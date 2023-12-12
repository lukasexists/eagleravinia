import * as meta from "../meta.js";
export var Constants;
(function (Constants) {
    Constants.EAGLERCRAFT_SKIN_CHANNEL_NAME = "EAG|Skins-1.8";
    Constants.MAGIC_ENDING_SERVER_SKIN_DOWNLOAD_BUILTIN = [
        0x00, 0x00, 0x00,
    ];
    Constants.MAGIC_ENDING_CLIENT_UPLOAD_SKIN_BUILTIN = [
        0x00, 0x05, 0x01, 0x00, 0x00, 0x00,
    ];
    Constants.EAGLERCRAFT_SKIN_CUSTOM_LENGTH = 64 ** 2 * 4;
    Constants.JOIN_SERVER_PACKET = 0x01;
    Constants.PLAYER_LOOK_PACKET = 0x08;
})(Constants || (Constants = {}));
export const UPGRADE_REQUIRED_RESPONSE = `<!DOCTYPE html>
<!-- Served by ${meta.PROXY_BRANDING} (version: ${meta.PROXY_VERSION}) -->
<html> 
<head> 
<title>Deadly</title> 
<style> 
:root { font-family: "Arial" } 
body { background-color: #000; color: #eee; }
code { padding: 3px 10px 3px 10px; border-radius: 5px; font-family: monospace; background-color: #1a1a1a; color: white; } 
</style> 

<script type="text/javascript"> 
window.addEventListener('load', () => { 
  document.getElementById("connect-url").innerHTML = window.location.href.replace(window.location.protocol, window.location.protocol == "https:" ? "wss:" : "ws:"); 
}); 
</script> 
</head> 

<body> 
<h1>Deadly</h1> 
<p>Welcome to the Deadly home page! To connect, use this server IP/URL: <code id="connect-url">loading...</code> (connect from any 1.8 EaglercraftX client via Multiplayer > Direct Connect!)</p> 
<p>Ravinia SMP members must message an admin to enter the SMP world.</p>
</body>
</html>`;
