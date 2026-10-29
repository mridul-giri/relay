import Link from "next/link";
import { AuthLayout } from "../components/auth-layout";
import { SignedOutOnly } from "../components/signed-out-only";
import { SignupForm } from "../components/signup-form";

export default function SignupPage() {
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
        <SignupForm />
      </AuthLayout>
    </SignedOutOnly>
  );
}
