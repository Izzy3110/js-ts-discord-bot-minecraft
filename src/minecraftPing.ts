import net from "node:net";
import fs from "fs";
import path from "node:path";
import { readVarInt, unixTimestampMs, writeVarInt } from "./utils.js";
import { saveFavicon } from "./favicon.js";

type MinecraftStatus = {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    max: number;
    online: number;
    sample?: { name: string; id: string }[];
  };
  description: any;
  favicon?: string;
  ping: number;
  timestamp?: number;
};

export async function queryMinecraftServer(
  host: string,
  port = 25565,
  timeout = 3000
): Promise<MinecraftStatus> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const startTime = Date.now();

    socket.setTimeout(timeout);

    socket.once("error", reject);
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("Connection timeout"));
    });

    socket.connect(port, host, () => {
      // --- Handshake packet ---
      const protocolVersion = writeVarInt(758); // 1.20.4 (works fine for status)
      const hostBuf = Buffer.from(host, "utf8");

      const handshake = Buffer.concat([
        writeVarInt(0x00),                 // packet id
        protocolVersion,                  // protocol version
        writeVarInt(hostBuf.length),
        hostBuf,
        Buffer.from([(port >> 8) & 0xff, port & 0xff]),
        writeVarInt(1)                     // next state: status
      ]);

      socket.write(Buffer.concat([writeVarInt(handshake.length), handshake]));

      // --- Status request packet ---
      socket.write(Buffer.from([0x01, 0x00]));
    });

    let buffer = Buffer.alloc(0);

    socket.on("data", (chunk) => {
      const chunkBuf = typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer);
      buffer = Buffer.concat([buffer, chunkBuf]);

      let lengthInfo;
      try {
        lengthInfo = readVarInt(buffer);
      } catch (e) {
        return; // Wait for more data if VarInt isn't complete
      }

      if (buffer.length < lengthInfo.size + lengthInfo.value) {
        return; // Wait for the rest of the packet
      }

      const packetIdInfo = readVarInt(buffer, lengthInfo.size);

      if (packetIdInfo.value !== 0x00) {
        socket.destroy();
        return reject(new Error("Invalid packet ID"));
      }

      const jsonLengthInfo = readVarInt(
        buffer,
        lengthInfo.size + packetIdInfo.size
      );

      const jsonStart =
        lengthInfo.size + packetIdInfo.size + jsonLengthInfo.size;

      const jsonStr = buffer.slice(jsonStart, jsonStart + jsonLengthInfo.value).toString("utf8");

      try {
        const json = JSON.parse(jsonStr);
        const ping = Date.now() - startTime;
        socket.end();
        if (Object.keys(json).includes("favicon")) {
          console.log("favicon found");
          let favicon = json.favicon;
          if (favicon.length > 0) {
            saveFavicon(favicon, host, port);
          }
        }

        let finalObject = { ...json, ping };
        let now_timestamp = unixTimestampMs();
        let queriesDir = path.join(process.cwd(), "data", "queries");
        if (!fs.existsSync(queriesDir)) {
          fs.mkdirSync(queriesDir, { recursive: true });
        }

        let queriesDir_hostDir = path.join(queriesDir, host);
        if (!fs.existsSync(queriesDir_hostDir)) {
          fs.mkdirSync(queriesDir_hostDir, { recursive: true });
        }
        fs.writeFileSync(path.join(queriesDir_hostDir, `${port}-${now_timestamp}.json`), JSON.stringify(finalObject, null, 4));
        resolve(finalObject);
      } catch (e) {
        reject(e);
        socket.destroy();
      }
    });
  });
}
