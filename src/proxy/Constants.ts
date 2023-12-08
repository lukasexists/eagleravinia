import * as meta from "../meta.js";

export namespace Constants {
  export const EAGLERCRAFT_SKIN_CHANNEL_NAME: string = "EAG|Skins-1.8";
  export const MAGIC_ENDING_SERVER_SKIN_DOWNLOAD_BUILTIN: number[] = [
    0x00, 0x00, 0x00,
  ];
  export const MAGIC_ENDING_CLIENT_UPLOAD_SKIN_BUILTIN: number[] = [
    0x00, 0x05, 0x01, 0x00, 0x00, 0x00,
  ];
  export const EAGLERCRAFT_SKIN_CUSTOM_LENGTH = 64 ** 2 * 4;

  export const JOIN_SERVER_PACKET = 0x01;
  export const PLAYER_LOOK_PACKET = 0x08;
}

export const UPGRADE_REQUIRED_RESPONSE = `<!DOCTYPE html><!-- Served by ${meta.PROXY_BRANDING} (version: ${meta.PROXY_VERSION}) --><html> <head> <title>Eagleravinia Proxy</title> <style> :root { font-family: "Arial" } code { padding: 3px 10px 3px 10px; border-radius: 5px; font-family: monospace; background-color: #1a1a1a; color: white; } </style> <script type="text/javascript"> window.addEventListener('load', () => { document.getElementById("connect-url").innerHTML = window.location.href.replace(window.location.protocol, window.location.protocol == "https:" ? "wss:" : "ws:"); }); </script> </head> <body> <h1>Eagleravinia Proxy</h1> <p>It appears as if you've reached the landing page for this EaglerProxy instance. To connect, use this server IP/URL: <code id="connect-url">loading...</code> (connect from any 1.8 EaglercraftX client via Multiplayer > Direct Connect)</p> </body></html>`;