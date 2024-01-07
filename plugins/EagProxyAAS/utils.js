import { ConnectType } from "./types.js";
import * as Chunk from "prismarine-chunk";
import * as Block from "prismarine-block";
import * as Registry from "prismarine-registry";
import vec3 from "vec3";
import { ConnectionState } from "./types.js";
import { auth } from "./auth.js";
import { config } from "./config.js";
import { handleCommand } from "./commands.js";
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
      text: ` ${Enums.ChatColor.RED}Hazard${Enums.ChatColor.YELLOW}Craft `,
    }),
    footer: JSON.stringify({
      text: `${Enums.ChatColor.GOLD}Please wait...`,
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
  client.write("playerlist_header", {
    header: JSON.stringify({
      text: ` ${Enums.ChatColor.RED}Hazard${Enums.ChatColor.YELLOW}Craft `,
    }),
    footer: JSON.stringify({
      text: `${Enums.ChatColor.RED}Powered by EaglerProxy`,
    }),
  });
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
      `WARNING: If you're on a Chromebook please turn down the graphics (specifically render distance)! We cannot help with client performance issues - Eaglercraft just tends to be laggy!`
    );
    await new Promise((res) => setTimeout(res, 2000));
    sendMessageWarning(
      client.gameClient,
      `WARNING: If you're on bad internet, you'll need to stay put for a moment so everything can load. Just wait until the login messages pop up!`
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
      logger.info(
        `Player ${client.gameClient.username} is attempting to connect!`
      );
      const player = PLUGIN_MANAGER.proxy.players.get(
        client.gameClient.username
      );
      /*player.on("vanillaPacket", (packet, origin) => {
        if (
          origin == "CLIENT" &&
          packet.name == "chat" &&
          packet.params.message.toLowerCase().startsWith("/eag-") &&
          !packet.cancel
        ) {
          packet.cancel = true;
          handleCommand(player, packet.params.message);
        }
      });*/
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
        if (err.code.contains("ENOTFOUND") || err.code.contains("ECONNREFUSED")) {
          client.gameClient.end(
            Enums.ChatColor.RED +
              `It looks like the servers are down! Try agian later!`
          );
        } else {
          client.gameClient.end(
            Enums.ChatColor.RED +
              `Something went wrong while we were connecting you! ${err.message}`
          );
        }
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
          "Whoops, something went wrong while we were connecting you! Please reconnect!"
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
