import Image from "next/image";

const LOGO_WIDTH = 3508;
const LOGO_HEIGHT = 2480;

export function LogoHero() {
  return (
    <div className="flex w-full items-center justify-center">
      <Image
        src="/logo.png"
        alt="Motempo"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        unoptimized
        className="h-auto max-h-[42dvh] w-auto max-w-[69vw] object-contain"
      />
    </div>
  );
}
