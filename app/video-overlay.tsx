"use client";

import { useState } from "react";

export default function VideoOverlay() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aim Trainer preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
    >
      <div className="relative w-full max-w-5xl">
        <video
          className="max-h-[85vh] w-full rounded-2xl object-contain shadow-2xl"
          src="/AimTraining.mp4"
          autoPlay
          muted
          playsInline
          controls
        >
          Your browser does not support video playback.
        </video>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close video preview"
          className="absolute right-3 top-3 rounded-full bg-black/70 px-4 py-2 text-xl leading-none text-white transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        >
          ×
        </button>
      </div>
    </div>
  );
}
