export function LogoDouziemeHomme({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-label="Douzième Homme"
    >
      <span
        className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase px-4 py-2 border-2 border-white/30 rounded-lg bg-black/20"
        style={{
          textShadow: "0 1px 0 rgba(255,255,255,0.2), 0 -1px 2px rgba(0,0,0,0.5)",
        }}
      >
        Douzième Homme
      </span>
    </div>
  );
}
