import Logo from "@/components/Logo";
import Link from "next/link";
import SignInForm from "./SignInForm";
import { getProviders } from "next-auth/react";
import { Plus } from "lucide-react";

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="grid h-screen w-screen grid-cols-1 md:grid-cols-2">
      {/* Left: Branding */}
      <div className="relative flex flex-col justify-center bg-gradient-to-br from-purple-600 to-purple-500 p-12 text-white">
        <div className="mb-12 flex items-center">
          <Logo variant="signin" className="gap-3 text-white" />
        </div>
        <div className="flex flex-1 flex-col items-start justify-center">
          <div className="mb-8">
            <Plus className="mb-8 h-16 w-16 opacity-80" />
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              Start your journey with Kleero
            </h1>
            <p className="text-lg opacity-90">
              Access all your tools and resources in one place. Simplify your
              workflow and boost productivity.
            </p>
          </div>
        </div>
      </div>
      {/* Right: Sign In Card */}
      <div className="flex flex-col items-center justify-center bg-white">
        <div className="mx-auto w-full max-w-md rounded-lg p-8 shadow-lg">
          <SignInForm providers={providers} />
        </div>
        <div className="mt-4 px-4 text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link href="/" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/" className="underline">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
