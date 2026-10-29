import type { ReactNode } from "react";

export function CallScreen({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center bg-background bg-dot-grid px-4 py-12 text-center">
      <CallColumn>{children}</CallColumn>
    </main>
  );
}

export function CallColumn({ children }: { children: ReactNode }) {
  return (
    <div className="grid max-w-[420px] justify-items-center gap-[18px]">
      {children}
    </div>
  );
}

export function CallTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="pixel text-[clamp(32px,6vw,44px)] leading-[1.05] text-balance text-foreground">
      {children}
    </h1>
  );
}
