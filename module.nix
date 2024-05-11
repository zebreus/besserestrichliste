{ config, lib, pkgs, ... }:

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
        default = pkgs.besserestrichliste;
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
