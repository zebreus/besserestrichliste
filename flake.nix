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
    flake-utils.lib.eachDefaultSystem
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

          packages.default = pkgs.writeShellApplication
            {
              name = "besserestrichliste-launcher";

              runtimeInputs = with pkgs; [ sqlite nodePackages.prisma openssl ];

              text = ''
                export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
                export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
                export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
                export PRISMA_INTROSPECTION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/introspection-engine"
                export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"

                DATABASE_FILE=/tmp/dev.db
                export DATABASE_URL=file:/tmp/dev.db
                export HOST='localhost'
                export PORT=3000
                export ORIGIN=http://localhost:3000
                # export PROTOCOL_HEADER=x-forwarded-proto
                # export HOST_HEADER=x-forwarded-host

                DB_CREATE=$(test -f $DATABASE_FILE && echo false || echo true)
                prisma migrate deploy
                if $DB_CREATE; then
                  # Seed if the db was just created
                  prisma db seed
                fi

                node_modules/.bin/prisma generate

                cd ${packages.besserestrichliste}
                node build
              '';
            };

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

          formatter = pkgs.nixfmt-rfc-style;
        }
      );
}
