// This folder contains options for both the bridge and networking adapter.
// Environment files and .env files are available here. Set the value of any config option to process.env.<ENV name>

import { Config } from "./launcher_types.js";

export const config: Config = {
  bridge: {
    enabled: false,
    motd: null,
  },
  adapter: {
    name: "EaglerProxy",
    bindHost: "0.0.0.0",
    bindPort: 8081,
    maxConcurrentClients: 20,
    skinUrlWhitelist: undefined,
    motd: true
      ? "FORWARD"
      : {
          iconURL: "logo.png",
          l1: "yes",
          l2: "no",
        },
    origins: {
      allowOfflineDownloads: true,
      originWhitelist: null,
      originBlacklist: null,
    },
    server: {
      host: "142.44.206.140",
      port: 25617,
    },
    tls: undefined,
  },
};
