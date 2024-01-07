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
<!-- Hazardraft uses a fork of Eaglerproxy v1.0.8. Learn more about EaglerProxy at https://github.com/WorldEditAxe/eaglerproxy, and learn more about Eaglercraft at https://eaglercraft.com/ -->
<html> 
<head> 
<title>Hazardcraft</title> 
<style> 
@import url('https://fontlay.com/css2?family=Roboto+Flex&family=Rubik+Marker+Hatch&display=swap');

h1 { font-family: "Rubik Marker Hatch", Impact, Arial, sans-serif; font-size: 48px; } 
body { background-color: #150909; background: repeating-linear-gradient(45deg, #150909 0px, #150909 10px, #150909 10px, #3b370d 10px, #3b370d 20px); color: #eee; text-align: center; padding: 0; margin: 0; font-family: 'Roboto Flex', 'Roboto', Arial, sans-serif; }
.content { max-width: 480px; width: 100%; min-height: 100vh; background-color: #1F0A0A; padding: 12px; box-sizing: border-box; position: relative; left: 50%; transform: translateX(-50%) }
code { padding: 3px 10px 3px 10px; border-radius: 5px; font-family: monospace; background-color: #222; color: white; } 
</style> 

<script type="text/javascript"> 
window.addEventListener('load', () => { 
  document.getElementById("connect-url").innerHTML = window.location.href.replace(window.location.protocol, window.location.protocol == "https:" ? "wss:" : "ws:"); 
}); 
</script> 
</head> 

<body> 
<div class="content">

<h1>Hazard&shy;craft</h1> 

<p>
Hazardcraft is a 1.8.9 Eaglercraft SMP that takes place on the highly-hazardous C-814 planet.
The sun is hazardous to humans, and the animals are highly aggressive hunters.
</p> 
<h2>Play at <code>wss://hazard.owouw.us/</code></h2>
<p>Ravinia SMP members must message an admin to enter the SMP world.</p>

<h2>Addon List</h2>

<ul>
<li>AuthMe</li>
<li>Quality Armory</li>
<li>Gringotts Economy</li>
<li>Deadly Sun</li>
<li>Aggressive Animals (the old version)</li>
<li>HoloMobHealth</li>
<li>CreeperRefund</li>
<li>TSkullDrops</li>
<li>EssentialsX</li>
<li>DeathCoordinates</li>
<li>Multiworld</li>
<li>TAB</li>
<li>ProximityChat</li>
<li>Horizon Anticheat</li>
<li>AntiLag</li>
</ul>

</div>
</body>
</html>`;
