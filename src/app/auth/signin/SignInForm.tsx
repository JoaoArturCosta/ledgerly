"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { signIn, type ClientSafeProvider } from "next-auth/react";
import AuthButton from "@/components/AuthButton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SignInFormProps {
  providers: Record<string, ClientSafeProvider> | null;
}

export default function SignInForm({ providers }: SignInFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setError(null);
    setSuccess(null);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (res?.error) {
      setError(res.error);
      setSuccess(null);
    } else {
      setSuccess("Signed in successfully. Redirecting...");
      setError(null);
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="mb-1 text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500">
          Enter your credentials to access your account
        </p>
      </div>
      <form
        onSubmit={(e) => {
          handleSubmit(onSubmit)(e);
        }}
        className="w-full space-y-4"
      >
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="pl-10"
            {...register("email", { required: true })}
            disabled={isSubmitting}
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="pl-10"
            {...register("password", { required: true })}
            disabled={isSubmitting}
          />
          <Link
            href="#"
            className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 text-xs text-purple-600 hover:underline"
            tabIndex={-1}
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full rounded-md bg-purple-600 py-2 text-base font-semibold text-white hover:bg-purple-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Signing in..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
        {error && <p className="pt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="pt-2 text-sm text-green-600">{success}</p>}
      </form>
      <div className="my-2 flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs font-medium text-gray-400">
          OR CONTINUE WITH
        </span>
        <Separator className="flex-1" />
      </div>
      <div className="flex w-full flex-row items-center justify-center gap-4 pt-2">
        {providers &&
          Object.values(providers)
            .filter((provider) => provider.id !== "credentials")
            .map((provider) => (
              <AuthButton
                key={provider.id}
                provider={provider}
                className="flex w-40 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white py-2 text-gray-900 shadow-sm hover:bg-gray-50"
              />
            ))}
      </div>
    </div>
  );
}
