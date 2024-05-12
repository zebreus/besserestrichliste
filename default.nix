{ buildNpmPackage, makeWrapper, openssl, prisma-engines, nodejs, ... }:
buildNpmPackage {
  pname = "besserestrichliste";
  version = "0.0.1";

  src = ./.;

  nativeBuildInputs = [ makeWrapper openssl ];
  buildInputs = [ openssl ];
  # Explicitly set the nodejs version because we use it directly in makeWrapperArgs
  inherit nodejs;

  npmDepsHash = "sha256-y17xUaVheYj7k7XMC+p3jtdejtad2yzL6VWA+Ja7TgA=";
  npmFlags = [ "--legacy-peer-deps" ];

  PRISMA_SCHEMA_ENGINE_BINARY = "${prisma-engines}/bin/schema-engine";
  PRISMA_QUERY_ENGINE_BINARY = "${prisma-engines}/bin/query-engine";
  PRISMA_QUERY_ENGINE_LIBRARY = "${prisma-engines}/lib/libquery_engine.node";
  PRISMA_FMT_BINARY = "${prisma-engines}/bin/prisma-fmt";

  makeWrapperArgs = [
    ''--set-default PRISMA_SCHEMA_ENGINE_BINARY "${prisma-engines}/bin/schema-engine"''
    ''--set-default PRISMA_QUERY_ENGINE_BINARY "${prisma-engines}/bin/query-engine"''
    ''--set-default PRISMA_QUERY_ENGINE_LIBRARY "${prisma-engines}/lib/libquery_engine.node"''
    ''--set-default PRISMA_FMT_BINARY "${prisma-engines}/bin/prisma-fmt"''
    ''--prefix PATH : ${openssl}/bin'' # Prisma prints warnings if it cant find openssl
    ''--set-default DATABASE_URL "file:/tmp/dev.db"''
    ''--set-default HOST localhost''
    ''--set-default PORT 3000''
    ''--set-default ORIGIN http://localhost:3000''
    ''--run "cd $out/lib/node_modules/besserestrichliste && ${nodejs}/bin/npm run migrate:prod ; cd -"''
  ];
}

