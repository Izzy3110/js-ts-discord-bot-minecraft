import fs from "fs";
import path from "path";

export const saveFavicon = (favicon: string, host: string, port: number) => {
    if (!favicon.startsWith("data:image/png;base64,")) {
        console.warn("Favicon is not a valid base64 PNG data URI.");
        return;
    }

    const base64Data = favicon.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const dir = path.join(process.cwd(), "data", "favicons", "server");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Windows safe filename: replace : with -
    const safeHost = host.replace(/:/g, "-");

    const filename = `${safeHost}-${port}.png`;
    const filepath = path.join(dir, filename);
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, buffer);

        console.log(`Favicon saved to ${filepath}`);

    }
};