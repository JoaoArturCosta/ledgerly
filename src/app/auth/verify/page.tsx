"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    async function verify() {
      if (!token || !email) {
        if (!isCancelled) {
          setStatus("error");
          setMessage("Missing verification token or email.");
        }
        return;
      }

      if (!isCancelled) {
        setStatus("loading");
      }

      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
        );
        const data = await res.json();

        if (!isCancelled) {
          if (data.success) {
            setStatus("success");
            setMessage(data.message || "Email verified successfully.");
          } else {
            setStatus("error");
            setMessage(data.message || "Verification failed.");
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setStatus("error");
          setMessage("An error occurred during verification.");
        }
      }
    }

    verify();

    return () => {
      isCancelled = true;
    };
  }, [token, email]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <Logo variant="signin" className="justify-center" />
          <p className="mt-2 text-sm text-gray-600">
            Financial Management Made Simple
          </p>
        </div>

        {/* Verification Card */}
        <div className="rounded-xl border bg-white p-8 shadow-lg">
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  Verifying Your Email
                </h2>
                <p className="text-gray-600">
                  Please wait while we confirm your email address...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  Email Verified!
                </h2>
                <p className="mb-6 text-gray-600">{message}</p>
                <Button
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Link href="/auth/signin">Continue to Sign In</Link>
                </Button>
                <p className="mt-4 text-xs text-gray-500">
                  You can now access all features of your Kleeru account.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                  Verification Failed
                </h2>
                <p className="mb-6 text-gray-600">{message}</p>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/signin">Try Signing In</Link>
                  </Button>
                  <p className="text-xs text-gray-500">
                    If you continue to have issues, please contact support or
                    try requesting a new verification email.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Need help?{" "}
            <Link href="#" className="text-purple-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
