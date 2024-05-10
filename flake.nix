{
  description = "Reimplementing strichliste in svelte";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:nixos/nixpkgs";
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    ,
    }:
    (
      (flake-utils.lib.eachDefaultSystem
        (
          system:
          let
            pkgs = import nixpkgs { inherit system; };
          in
          rec {
            name = "besserestrichliste";

            packages.besserestrichliste = pkgs.buildNpmPackage
              {
                pname = "besserestrichliste";
                version = "0.0.1";

                src = ./.;

                nativeBuildInputs = [ pkgs.sqlite pkgs.nodePackages.prisma pkgs.openssl ];

                npmDepsHash = "sha256-UXquaMSMlxqG/nug5m6VjzgJgVP6RYKtUF80WzOQO4o=";
                npmFlags = [ "--legacy-peer-deps" ];

                preBuild = ''
                  export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
                  export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
                  export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
                  export PRISMA_INTROSPECTION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/introspection-engine"
                  export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
                  export DATABASE_URL=file:dev.db

                  node_modules/.bin/prisma generate
                '';

                installPhase = ''
                  mkdir -p $out
                  cp -r node_modules build prisma static package.json package-lock.json $out
                '';
              };

            packages.default = pkgs.callPackage
              ({ pkgs
               , databaseFile ? "/var/lib/besserestrichliste/besserestrichliste.db"
               , host ? "localhost"
               , port ? "3000"
               , origin ? "http://localhost:3000"
               , besserestrichliste ? packages.besserestrichliste
               , ...
               }: (pkgs.writeShellApplication
                {
                  name = "besserestrichliste-launcher";

                  runtimeInputs = with pkgs; [ sqlite nodePackages.prisma openssl ];

                  text = ''
                    chmod +x
                    export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
                    export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
                    export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
                    export PRISMA_INTROSPECTION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/introspection-engine"
                    export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"

                    export DATABASE_URL="file:${databaseFile}"
                    export HOST='${host}'
                    export PORT=${port}
                    export ORIGIN=${origin}
                    # export PROTOCOL_HEADER=x-forwarded-proto
                    # export HOST_HEADER=x-forwarded-host

                    DB_CREATE=$(test -f "${databaseFile}" && echo false || echo true)
                    prisma migrate deploy
                    if $DB_CREATE; then
                      # Seed if the db was just created
                      prisma db seed
                    fi


                    cd ${besserestrichliste}
                    node build
                  '';
                }))
              { };

            devShell = pkgs.mkShell {
              buildInputs = [ pkgs.nodejs pkgs.sqlite pkgs.nodePackages.prisma pkgs.openssl ];
              shellHook = with pkgs; ''
                export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine"
                export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
                export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
                export PRISMA_INTROSPECTION_ENGINE_BINARY="${prisma-engines}/bin/introspection-engine"
                export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
                export DATABASE_URL=file:dev.db
                export PATH=$PATH:$PWD/node_modules/.bin

                npm install
                prisma migrate dev
              '';
            };

            # packages.nixosConfigurations = {
            #   testVm = nixpkgs.lib.makeOverridable nixpkgs.lib.nixosSystem {
            #     system = "x86_64-linux";
            #     modules = [
            #       nixosModules.besserestrichliste
            #       ({ pkgs, ... }: {
            #         boot.kernelPackages = pkgs.linuxPackages_latest;
            #         services.besserestrichliste.enable = true;
            #         environment.systemPackages = with pkgs; [ sqlite nodePackages.prisma openssl nmap git ];
            #       })
            #     ];
            #   };
            # };

            # journalctl -exu besserestrichliste-init

            checks.opensPort = pkgs.nixosTest {
              name = "besserestrichliste-opens-port";
              nodes.machine = { config, pkgs, ... }: {
                imports = [
                  nixosModules.besserestrichliste
                  { services.besserestrichliste.enable = true; }
                ];
              };
              testScript = ''
                machine.wait_for_unit("besserestrichliste.service")
                machine.wait_for_open_port(3000)
              '';
            };

            nixosModules.besserestrichliste = ({ config, lib, pkgs, utils, ... }:

              let
                cfg = config.services.besserestrichliste;
              in
              {
                options = {
                  services.besserestrichliste = {
                    enable = lib.mkEnableOption "Enable the besserestrichliste service.";

                    host = lib.mkOption {
                      type = lib.types.str;
                      default = "localhost";
                      example = "192.168.22.22";
                      description = lib.mdDoc "Address to serve on.";
                    };

                    port = lib.mkOption {
                      type = lib.types.int;
                      default = 3000;
                      example = 3000;
                      description = lib.mdDoc "Port to serve on.";
                    };

                    origin = lib.mkOption {
                      type = lib.types.str;
                      default = "http://localhost:3000";
                      example = "https://example.com";
                      description = lib.mdDoc "Origin for CORS and stuff.";
                    };

                    package = lib.mkOption {
                      type = lib.types.package;
                      description = lib.mdDoc "besserestrichliste package used for the service.";
                      default = packages.besserestrichliste;
                      defaultText = lib.literalExpression "packages.besserestrichliste";
                    };
                  };
                };

                config = lib.mkIf cfg.enable (
                  let
                    dataDirectory = "/var/lib/besserestrichliste";
                    databaseFile = "${dataDirectory}/besserestrichliste.db";
                  in
                  {
                    users.users.besserestrichliste = {
                      isSystemUser = true;
                      createHome = true;
                      home = dataDirectory;
                      group = "besserestrichliste";
                    };
                    users.groups.besserestrichliste = { };

                    systemd.services."besserestrichliste-init" = {
                      description = "make sure the besserestrichliste database exists and the schema is up to date";
                      serviceConfig = { Type = "oneshot"; };
                      environment = {
                        PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
                        PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
                        PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
                        PRISMA_INTROSPECTION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/introspection-engine";
                        PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";
                        DATABASE_URL = "file:${databaseFile}";
                      };
                      script = ''
                        ${lib.getExe (pkgs.writeShellApplication {
                          name = "besserestrichliste-init";
                          runtimeInputs = with pkgs; [  nodePackages.prisma  ];
                          text = ''
                            cd ${cfg.package}
                            export PATH="$PATH:${cfg.package}/node_modules/.bin"
                            DB_CREATE=$(test -f "${databaseFile}" && echo false || echo true)
                            prisma migrate deploy
                            if $DB_CREATE; then
                              # Seed if the db was just created
                              prisma db seed
                            fi
                          '';
                        })}
                      '';
                    };

                    systemd.services."besserestrichliste" = {
                      serviceConfig = {
                        Type = "simple";
                        User = "besserestrichliste";
                        Group = "besserestrichliste";
                        Restart = "on-failure";
                        RestartSec = "30s";
                        ExecStart = "${lib.getExe pkgs.nodejs} ${cfg.package}/build";
                      };
                      wantedBy = [ "multi-user.target" ];
                      after = [ "besserestrichliste-init.service" ];

                      description = "besserestrichliste UI and server";

                      environment = {
                        DATABASE_URL = "file:${databaseFile}";
                        HOST = "${cfg.host}";
                        PORT = "${builtins.toString cfg.port}";
                        ORIGIN = "${cfg.origin}";
                        NODE_ENV = "production";
                      };

                      documentation = [
                        "https://github.com/zebreus/besserestrichliste"
                      ];
                    };
                  }
                );
              }
            );

            formatter = pkgs.nixfmt-rfc-style;
          }
        ))
    );
}
