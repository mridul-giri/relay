import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>Relay voice console</h1>
      <p>Place AI voice calls and watch them happen live.</p>
      <p style={{ display: "flex", gap: 12 }}>
        <Link href="/login">Sign in</Link>
        <Link href="/signup">Create account</Link>
      </p>
    </main>
  );
}
