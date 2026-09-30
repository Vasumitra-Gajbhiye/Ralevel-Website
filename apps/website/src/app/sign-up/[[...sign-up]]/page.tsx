import AuthShell from "@/components/auth/AuthShell";
import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Sign up | r/alevel" };

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </AuthShell>
  );
}
