import { ConnectType } from "./types.js";
import * as Chunk from "prismarine-chunk";
import * as Block from "prismarine-block";
import * as Registry from "prismarine-registry";
import vec3 from "vec3";
import { ConnectionState } from "./types.js";
import { auth } from "./auth.js";
import { config } from "./config.js";
import { handleCommand } from "./commands.js";
import { getTokenProfileEasyMc } from "./auth_easymc.js";
const { Vec3 } = vec3;
const Enums = PLUGIN_MANAGER.Enums;
const Util = PLUGIN_MANAGER.Util;
const MAX_LIFETIME_CONNECTED = 10 * 60 * 1000,
  MAX_LIFETIME_AUTH = 5 * 60 * 1000,
  MAX_LIFETIME_LOGIN = 1 * 60 * 1000;
const REGISTRY = Registry.default("1.8.8"),
  McBlock = Block.default("1.8.8"),
  LOGIN_CHUNK = generateSpawnChunk().dump();
const logger = new PLUGIN_MANAGER.Logger("PlayerHandler");
let SERVER = null;
export function hushConsole() {
  const ignoredMethod = () => {};
  global.console.info = ignoredMethod;
  global.console.warn = ignoredMethod;
  global.console.error = ignoredMethod;
  global.console.debug = ignoredMethod;
}
export function setSG(svr) {
  SERVER = svr;
}
export function disconectIdle() {
  SERVER.players.forEach((client) => {
    if (
      client.state == ConnectionState.AUTH &&
      Date.now() - client.lastStatusUpdate > MAX_LIFETIME_AUTH
    ) {
      client.gameClient.end(
        "Timed out waiting for user to login via Microsoft"
      );
    } else if (
      client.state == ConnectionState.SUCCESS &&
      Date.now() - client.lastStatusUpdate > MAX_LIFETIME_CONNECTED
    ) {
      client.gameClient.end(
        Enums.ChatColor.RED +
          "Please enter the IP of the server you'd like to connect to in chat."
      );
    }
  });
}
export function handleConnect(client) {
  client.gameClient.write("login", {
    entityId: 1,
    gameMode: 2,
    dimension: 1,
    difficulty: 1,
    maxPlayers: 1,
    levelType: "flat",
    reducedDebugInfo: false,
  });
  client.gameClient.write("map_chunk", {
    x: 0,
    z: 0,
    groundUp: true,
    bitMap: 0xffff,
    chunkData: LOGIN_CHUNK,
  });
  client.gameClient.write("position", {
    x: 0,
    y: 65,
    z: 8.5,
    yaw: -90,
    pitch: 0,
    flags: 0x01,
  });
  client.gameClient.write("playerlist_header", {
    header: JSON.stringify({
      text: ` ${Enums.ChatColor.GOLD}EaglerProxy Authentication Server `,
    }),
    footer: JSON.stringify({
      text: `${Enums.ChatColor.GOLD}Please wait for instructions.`,
    }),
  });
  onConnect(client);
}
export function awaitCommand(client, filter) {
  return new Promise((res, rej) => {
    const onMsg = (packet) => {
      if (filter(packet.message)) {
        client.removeListener("chat", onMsg);
        client.removeListener("end", onEnd);
        res(packet.message);
      }
    };
    const onEnd = () =>
      rej("Client disconnected before promise could be resolved");
    client.on("chat", onMsg);
    client.on("end", onEnd);
  });
}
export function sendMessage(client, msg) {
  client.write("chat", {
    message: JSON.stringify({ text: msg }),
    position: 1,
  });
}
export function sendCustomMessage(client, msg, color, ...components) {
  client.write("chat", {
    message: JSON.stringify(
      components.length > 0
        ? {
            text: msg,
            color,
            extra: components,
          }
        : { text: msg, color }
    ),
    position: 1,
  });
}
export function sendChatComponent(client, component) {
  client.write("chat", {
    message: JSON.stringify(component),
    position: 1,
  });
}
export function sendMessageWarning(client, msg) {
  client.write("chat", {
    message: JSON.stringify({
      text: msg,
      color: "yellow",
    }),
    position: 1,
  });
}
export function sendMessageLogin(client, url, token) {
  client.write("chat", {
    message: JSON.stringify({
      text: "Please go to ",
      color: Enums.ChatColor.RESET,
      extra: [
        {
          text: url,
          color: "gold",
          clickEvent: {
            action: "open_url",
            value: url,
          },
          hoverEvent: {
            action: "show_text",
            value: Enums.ChatColor.GOLD + "Click to open me in a new window!",
          },
        },
        {
          text: " and login via the code ",
        },
        {
          text: token,
          color: "gold",
          hoverEvent: {
            action: "show_text",
            value: Enums.ChatColor.GOLD + "Click me to copy to chat!",
          },
          clickEvent: {
            action: "suggest_command",
            value: token,
          },
        },
        {
          text: ".",
        },
      ],
    }),
    position: 1,
  });
}
export function updateState(client, newState, uri, code) {
  switch (newState) {
    case "CONNECTION_TYPE":
      client.write("playerlist_header", {
        header: JSON.stringify({
          text: ` ${Enums.ChatColor.GOLD}EaglerProxy Authentication Server `,
        }),
        footer: JSON.stringify({
          text: `${Enums.ChatColor.RED}Choose the connection type: 1 = online, 2 = offline, 3 = EasyMC.`,
        }),
      });
      break;
    case "AUTH_EASYMC":
      client.write("playerlist_header", {
        header: JSON.stringify({
          text: ` ${Enums.ChatColor.GOLD}EaglerProxy Authentication Server `,
        }),
        footer: JSON.stringify({
          text: `${Enums.ChatColor.RED}easymc.io/get${Enums.ChatColor.GOLD} | ${Enums.ChatColor.RED}/login <alt_token>`,
        }),
      });
      break;
    case "AUTH":
      if (code == null || uri == null)
        throw new Error(
          "Missing code/uri required for title message type AUTH"
        );
      client.write("playerlist_header", {
        header: JSON.stringify({
          text: ` ${Enums.ChatColor.GOLD}EaglerProxy Authentication Server `,
        }),
        footer: JSON.stringify({
          text: `${Enums.ChatColor.RED}${uri}${Enums.ChatColor.GOLD} | Code: ${Enums.ChatColor.RED}${code}`,
        }),
      });
      break;
    case "SERVER":
      client.write("playerlist_header", {
        header: JSON.stringify({
          text: ` ${Enums.ChatColor.GOLD}EaglerProxy Authentication Server `,
        }),
        footer: JSON.stringify({
          text: `${Enums.ChatColor.RED}/join <ip>${
            config.allowCustomPorts ? " [port]" : ""
          }`,
        }),
      });
      break;
  }
}
// assuming that the player will always stay at the same pos
export function playSelectSound(client) {
  client.write("named_sound_effect", {
    soundName: "note.hat",
    x: 8.5,
    y: 65,
    z: 8.5,
    volume: 100,
    pitch: 63,
  });
}
export async function onConnect(client) {
  try {
    client.state = ConnectionState.AUTH;
    client.lastStatusUpdate = Date.now();
    await new Promise((res) => setTimeout(res, 2000));
    sendMessageWarning(
      client.gameClient,
      `WARNING: If you're on a Chromebook please turn down the graphics all the way or use Shadow! We aren't helping with client performance issues - Eaglercraft is just usually laggy!`
    );
    await new Promise((res) => setTimeout(res, 2000));

    updateState(client.gameClient, "CONNECTION_TYPE");
    let chosenOption = null;
    client.state = ConnectionState.SUCCESS;
    client.lastStatusUpdate = Date.now();
    updateState(client.gameClient, "SERVER");

    let host = "142.44.206.140";
    let port = 25617;

    try {
      sendChatComponent(client.gameClient, {
        text: `Joining Hazardcraft - welcome, ${client.gameClient.username}! Run `,
        color: "yellow",
        extra: [
          {
            text: "/eag-help",
            color: "gold",
            hoverEvent: {
              action: "show_text",
              value: Enums.ChatColor.GOLD + "Click me to run this command!",
            },
            clickEvent: {
              action: "run_command",
              value: "/eag-help",
            },
          },
          {
            text: " for a list of proxy commands, and ",
            color: "aqua",
          },
          {
            text: "/help",
            color: "gold",
            hoverEvent: {
              action: "show_text",
              value: Enums.ChatColor.GOLD + "Click me to run this command!",
            },
            clickEvent: {
              action: "run_command",
              value: "/help",
            },
          },
          {
            text: " for a list of help commands.",
            color: "aqua",
          },
        ],
      });
      sendChatComponent(client.gameClient, {
        text: ``,
        color: "aqua",
        extra: [
          {
            text: "NOTE: ",
            color: "red",
          },
          {
            text: "You'll need to stay put for a moment so everything can load. It might put you under the ground during this time - don't worry about it! It shouldn't take more than ~5 minutes!",
            color: "white",
          },
        ],
      });
      logger.info(
        `Player ${client.gameClient.username} is attempting to connect to ${host}:${port} under their Eaglercraft username (${client.gameClient.username}) using offline mode!`
      );
      const player = PLUGIN_MANAGER.proxy.players.get(
        client.gameClient.username
      );
      player.on("vanillaPacket", (packet, origin) => {
        if (
          origin == "CLIENT" &&
          packet.name == "chat" &&
          packet.params.message.toLowerCase().startsWith("/eag-") &&
          !packet.cancel
        ) {
          packet.cancel = true;
          handleCommand(player, packet.params.message);
        }
      });
      await player.switchServers({
        host: host,
        port: port,
        auth: "offline",
        username: client.gameClient.username,
        version: "1.8.8",
        keepAlive: false,
        skipValidation: true,
        hideErrors: true,
      });
    } catch (err) {
      if (!client.gameClient.ended) {
        client.gameClient.end(
          Enums.ChatColor.RED +
            `Something went wrong whilst switching servers: ${err.message}${
              err.code == "ENOTFOUND"
                ? host.includes(":")
                  ? `\n${Enums.ChatColor.GRAY}Suggestion: Replace the : in your IP with a space.`
                  : "\nIs that IP valid?"
                : ""
            }`
        );
      }
    }
  } catch (err) {
    if (!client.gameClient.ended) {
      logger.error(
        `Error whilst processing user ${client.gameClient.username}: ${
          err.stack || err
        }`
      );
      client.gameClient.end(
        Enums.ChatColor.YELLOW +
          "Something went wrong whilst processing your request. Please reconnect."
      );
    }
  }
}
export function generateSpawnChunk() {
  const chunk = new (Chunk.default(REGISTRY))(null);
  chunk.initialize(
    () =>
      new McBlock(
        REGISTRY.blocksByName.air.id,
        REGISTRY.biomesByName.the_end.id,
        0
      )
  );
  chunk.setBlock(
    new Vec3(8, 64, 8),
    new McBlock(
      REGISTRY.blocksByName.sea_lantern.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(8, 67, 8),
    new McBlock(
      REGISTRY.blocksByName.sea_lantern.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(7, 65, 8),
    new McBlock(
      REGISTRY.blocksByName.barrier.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(7, 66, 8),
    new McBlock(
      REGISTRY.blocksByName.barrier.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(9, 65, 8),
    new McBlock(
      REGISTRY.blocksByName.barrier.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(9, 66, 8),
    new McBlock(
      REGISTRY.blocksByName.barrier.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(8, 65, 7),
    new McBlock(
      REGISTRY.blocksByName.barrier.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(8, 66, 7),
    new McBlock(
      REGISTRY.blocksByName.barrier.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(8, 65, 9),
    new McBlock(
      REGISTRY.blocksByName.barrier.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  chunk.setBlock(
    new Vec3(8, 66, 9),
    new McBlock(
      REGISTRY.blocksByName.barrier.id,
      REGISTRY.biomesByName.the_end.id,
      0
    )
  );
  // chunk.setBlockLight(new Vec3(8, 65, 8), 15);
  chunk.setBlockLight(new Vec3(8, 66, 8), 15);
  return chunk;
}
