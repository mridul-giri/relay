import Link from "next/link";
import { connection } from "next/server";
import { AuthLayout } from "../components/auth-layout";
import { SignedOutOnly } from "../components/signed-out-only";
import { SignupForm } from "../components/signup-form";

function makeDemoEmail() {
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `demo-${number}@relay.local`;
}

export default async function SignupPage() {
  await connection();
  const demoEmail = makeDemoEmail();

  const footer = (
    <>
      Already have one? <Link href="/login">Sign in</Link>
    </>
  );

  return (
    <SignedOutOnly>
      <AuthLayout
        title="Create account"
        subtitle="Set up a merchant to place calls from."
        footer={footer}
      >
        <SignupForm demoEmail={demoEmail} />
      </AuthLayout>
    </SignedOutOnly>
  );
}
