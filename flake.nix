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

            nixosModules.besserestrichliste = {
              # Insert besserestrichliste into nixpkgs
              nixpkgs.overlays = [
                (final: prev: {
                  besserestrichliste = packages.besserestrichliste;
                })
              ];
              # Load nixpkgs module
              imports = [ ./module.nix ];
            };

            formatter = pkgs.nixfmt-rfc-style;
          }
        ))
    );
}
