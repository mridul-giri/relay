import Link from "next/link";
import { AuthLayout } from "../components/auth-layout";
import { SignedOutOnly } from "../components/signed-out-only";
import { LoginForm } from "../components/login-form";

export default function LoginPage() {
  const footer = (
    <>
      No account? <Link href="/signup">Create one</Link>
    </>
  );

  return (
    <SignedOutOnly>
      <AuthLayout
        title="Sign in"
        subtitle="Open your call console."
        footer={footer}
      >
        <LoginForm />
      </AuthLayout>
    </SignedOutOnly>
  );
}
