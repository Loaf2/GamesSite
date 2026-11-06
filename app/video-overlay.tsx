export default function VideoOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
    >
      <video
        className="h-[100svh] w-screen object-cover object-center sm:h-full sm:w-full"
        src="/AimTraining.mp4"
        autoPlay
        muted
        loop
        playsInline
      >
        Your browser does not support video playback.
      </video>
      <div className="absolute inset-0 bg-black/60 sm:bg-black/55" />
    </div>
  );
}
