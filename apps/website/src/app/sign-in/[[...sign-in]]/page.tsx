import AuthShell from "@/components/auth/AuthShell";
import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign in | r/alevel" };

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </AuthShell>
  );
}
