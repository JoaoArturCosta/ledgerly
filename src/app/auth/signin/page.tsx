import AuthButton from "@/components/AuthButton";
import { Separator } from "@/components/ui/separator";
import { getServerAuthSession } from "@/server/auth";
import { Boxes } from "lucide-react";
import { getProviders } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignIn() {
  const session = await getServerAuthSession();

  const providers = await getProviders();

  console.log(providers)

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <section className="grid h-screen w-screen grid-cols-2">
      <div className="col-span-1 bg-primary">
        <div className="flex w-full  items-center gap-3 p-6">
          <Boxes className="h-12 w-12 " />
          <h1 className=" text-3xl font-semibold  ">Ledgerly</h1>
        </div>
      </div>
      <div className="col-span-1 flex  flex-col items-center justify-center">
        <div className="flex w-[50%] flex-col items-center justify-center gap-2">
          <h2 className="text-3xl font-semibold ">Sign In</h2>
          <div className="flex items-center justify-center gap-2 pt-6">
            <Separator />
            <span className="text-nowrap text-xs font-light uppercase text-muted-foreground">
              or continue with
            </span>
            <Separator />
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-4 pt-6">
            {providers &&
              Object.values(providers).map((provider) => (
                <AuthButton key={provider.id} provider={provider} />
              ))}
          </div>
        </div>
        <div>
          By clicking continue, you agree to our{" "}
          <Link href={"/"}>Terms of Service</Link> and{" "}
          <Link href={"/"}>Privacy Policy</Link>.
        </div>
      </div>
    </section>
  );
}
