"use client";

// import { useEffect, useRef, useState, type ComponentProps } from "react";
// import JSZip from "jszip";
// import { loadGame, saveGame, type StoredFile } from "./gameStorage";

// type FolderInputProps = ComponentProps<"input"> & {
//   webkitdirectory: string;
// };

// const folderInputProps: FolderInputProps = {
//   type: "file",
//   multiple: true,
//   webkitdirectory: "",
// };

export default function Home() {
  // const folderInput = useRef<HTMLInputElement>(null);
  // const [selectedGame, setSelectedGame] = useState("");
  // const [gameFiles, setGameFiles] = useState<StoredFile[]>([]);
  // const exeName = gameFiles
  //   .find((file) => file.path.toLowerCase().endsWith(".exe"))
  //   ?.path.split("/")
  //   .pop();
  // const [isDownloading, setIsDownloading] = useState(false);
  // const [downloadError, setDownloadError] = useState("");

  // useEffect(() => {
  //   let cancelled = false;
  //   loadGame()
  //     .then((files) => {
  //       if (cancelled || files.length === 0) return;
  //       setGameFiles(files);
  //       setSelectedGame(files[0].path.split("/")[0]);
  //     })
  //     .catch(() => {});
  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  // async function handleFolderChange(event: React.ChangeEvent<HTMLInputElement>) {
  //   const files: StoredFile[] = Array.from(event.currentTarget.files ?? []).map(
  //     (file) => ({ path: file.webkitRelativePath, blob: file }),
  //   );
  //   setGameFiles(files);
  //   setSelectedGame(files[0]?.path.split("/")[0] ?? "");
  //   setDownloadError("");
  //   try {
  //     await saveGame(files);
  //   } catch {
  //     setDownloadError("The folder could not be saved for your next visit.");
  //   }
  // }

  // async function handleDownload() {
  //   if (gameFiles.length === 0) return;
  //
  //   setIsDownloading(true);
  //   setDownloadError("");
  //
  //   try {
  //     const zip = new JSZip();
  //     gameFiles.forEach((file) => zip.file(file.path, file.blob));
  //     const archive = await zip.generateAsync({ type: "blob" });
  //     const url = URL.createObjectURL(archive);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = `${selectedGame}.zip`;
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  //   } catch (error) {
  //     setDownloadError(
  //       error instanceof Error ? error.message : "The game ZIP could not be created.",
  //     );
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 font-sans dark:bg-black">
      {/* <input
        {...folderInputProps}
        ref={folderInput}
        className="sr-only"
        onChange={handleFolderChange}
        aria-label="Choose a game folder"
      />
      <button
        type="button"
        onClick={() => folderInput.current?.click()}
        className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
      >
        Upload a game folder
      </button> */}
      {/* {selectedGame && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Selected: {selectedGame} ({gameFiles.length} files)
        </p>
      )}
      {exeName && (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{exeName}</span>
      )}
      <button
        type="button"
        onClick={handleDownload}
        disabled={gameFiles.length === 0 || isDownloading}
        className="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
      >
        {isDownloading ? "Preparing download..." : "Download game"}
      </button> */}
      <a
        href="/Aim%20Trainer.exe"
        download="Aim Trainer.exe"
        className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
      >
        Download aim trainer
      </a>
      {/* {downloadError && (
        <p role="alert" className="text-sm text-red-600">
          Could not download the game: {downloadError}
        </p>
      )} */}
    </main>
  );
}
