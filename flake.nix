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

                nativeBuildInputs = [ pkgs.makeWrapper ];
                buildInputs = [ pkgs.openssl ];

                npmDepsHash = "sha256-y17xUaVheYj7k7XMC+p3jtdejtad2yzL6VWA+Ja7TgA=";
                npmFlags = [ "--legacy-peer-deps" ];

                PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
                PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
                PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
                PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";

                makeWrapperArgs = [
                  ''--set-default PRISMA_SCHEMA_ENGINE_BINARY "${pkgs.prisma-engines}/bin/schema-engine"''
                  ''--set-default PRISMA_QUERY_ENGINE_BINARY "${pkgs.prisma-engines}/bin/query-engine"''
                  ''--set-default PRISMA_QUERY_ENGINE_LIBRARY "${pkgs.prisma-engines}/lib/libquery_engine.node"''
                  ''--set-default PRISMA_FMT_BINARY "${pkgs.prisma-engines}/bin/prisma-fmt"''
                  ''--prefix PATH : ${pkgs.openssl}/bin'' # Prisma prints warnings if it cant find openssl
                  ''--set-default DATABASE_URL "file:/tmp/dev.db"''
                  ''--set-default HOST localhost''
                  ''--set-default PORT 3000''
                  ''--set-default ORIGIN http://localhost:3000''
                  ''--run "cd $out/lib/node_modules/besserestrichliste && ${pkgs.nodejs}/bin/npm run migrate:prod ; cd -"''
                ];
              };

            devShell = pkgs.mkShell {
              buildInputs = [ pkgs.nodejs pkgs.sqlite pkgs.openssl ];
              shellHook = with pkgs; ''
                export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine"
                export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
                export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
                export PRISMA_INTROSPECTION_ENGINE_BINARY="${prisma-engines}/bin/introspection-engine"
                export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
                export DATABASE_URL=file:dev.db

                export PATH=$PATH:$PWD/node_modules/.bin

                npm install
                prisma generate
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
