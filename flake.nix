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
    }: flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      rec {
        name = "besserestrichliste";

        packages.besserestrichliste = pkgs.callPackage ./default.nix { };
        packages.default = packages.besserestrichliste;

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

        checks.opensPort = pkgs.nixosTest
          {
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
          nixpkgs.overlays = [
            (final: prev: {
              inherit (packages) besserestrichliste;
            })
          ];
          imports = [ ./module.nix ];
        };
        nixosModules.default = nixosModules.besserestrichliste;

        # # VM for interactive testing of the module using nixos-shell
        # packages.nixosConfigurations = {
        #   testVm = nixpkgs.lib.makeOverridable nixpkgs.lib.nixosSystem {
        #     system = "x86_64-linux";
        #     modules = [
        #       nixosModules.besserestrichliste
        #       ({ pkgs, ... }: {
        #         services.besserestrichliste.enable = true;
        #         environment.systemPackages = with pkgs; [ git curl nmap besserestrichliste zsh coreutils inetutils moreutils bash ];
        #       })
        #     ];
        #   };
        # };

        formatter = pkgs.nixfmt-rfc-style;
      }
    );
}
