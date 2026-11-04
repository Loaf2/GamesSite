import { promises as fs } from "fs";
import path from "path";
import JSZip from "jszip";

const GAME_DIR = path.join(process.cwd(), "public", "Game");

async function addDirectory(zip: JSZip, dir: string, prefix: string) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const zipPath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      await addDirectory(zip, fullPath, zipPath);
    } else {
      zip.file(zipPath, await fs.readFile(fullPath));
    }
  }
}

export async function GET() {
  try {
    const zip = new JSZip();
    await addDirectory(zip, GAME_DIR, "Game");
    const body = await zip.generateAsync({ type: "uint8array" });
    return new Response(body as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="Game.zip"',
      },
    });
  } catch {
    return new Response("Game not found", { status: 404 });
  }
}
