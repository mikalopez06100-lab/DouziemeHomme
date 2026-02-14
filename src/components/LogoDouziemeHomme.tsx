import Image from "next/image";

export function LogoDouziemeHomme({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      aria-label="Douzième Homme"
    >
      <Image
        src="/logo-douzieme-homme.png"
        alt="Douzième Homme – Une passion, la victoire"
        width={280}
        height={160}
        className="w-full max-w-[280px] h-auto object-contain drop-shadow-lg"
        priority
      />
    </div>
  );
}
