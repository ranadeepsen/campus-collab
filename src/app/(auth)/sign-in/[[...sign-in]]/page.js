import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/layout/AuthShell";

export default function Page() {
  return (
    <AuthShell>
      <div className="flex w-full justify-center lg:justify-start">
        <SignIn />
      </div>
    </AuthShell>
  );
}
