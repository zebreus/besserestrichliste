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
      databaseFile = "${dataDirectory}/db.sqlite";
    in
    {
      users.users.besserestrichliste = {
        isSystemUser = true;
        createHome = true;
        home = dataDirectory;
        group = "besserestrichliste";
      };
      users.groups.besserestrichliste = { };

      systemd.services."besserestrichliste" = {
        serviceConfig = {
          Type = "simple";
          User = "besserestrichliste";
          Group = "besserestrichliste";
          Restart = "on-failure";
          RestartSec = "30s";
          ExecStart = "${lib.getExe pkgs.besserestrichliste}";
        };
        wantedBy = [ "multi-user.target" ];

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
