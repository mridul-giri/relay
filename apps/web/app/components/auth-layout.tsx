import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="relative grid min-h-svh items-center bg-background bg-dot-grid px-4 py-12">
      <div className="mx-auto grid w-full max-w-[1040px] items-center gap-10 min-[860px]:grid-cols-[1.15fr_1fr] min-[860px]:gap-[72px]">
        <div className="grid gap-[18px]">
          <h1 className="pixel text-[clamp(64px,12vw,136px)] leading-[0.85] tracking-[-0.02em] text-foreground">
            Relay
            <span
              className="ml-[0.06em] inline-block size-[0.14em] bg-primary"
              aria-hidden
            />
          </h1>
          <p className="max-w-[34ch] text-[clamp(17px,2vw,21px)] leading-[1.4] text-balance text-muted-foreground">
            Place AI voice calls and watch them happen live.
          </p>
        </div>

        <section
          className="panel grid w-full max-w-[440px] gap-6 px-7 pt-8 pb-9 min-[860px]:justify-self-end"
          aria-labelledby="auth-title"
        >
          <div className="grid gap-1.5">
            <h2
              id="auth-title"
              className="pixel text-[26px] leading-[1.1] text-foreground"
            >
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <p className="text-sm text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-primary [&_a]:decoration-1 [&_a]:underline-offset-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-[3px] [&_a:focus-visible]:outline-brand-text [&_a:hover]:text-brand-text">
            {footer}
          </p>
        </section>
      </div>
    </main>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 rounded-lg border border-dashed border-line-strong bg-well px-3 py-2.5 text-[13px] text-muted-foreground">
      <span className="pixel shrink-0 bg-primary px-1.5 py-0.5 text-xs leading-[1.3] text-primary-foreground">
        Demo
      </span>
      <span>{children}</span>
    </p>
  );
}
