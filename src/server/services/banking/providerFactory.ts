import { BankingProvider } from "./types";
import { SibsProvider } from "./providers/sibsProvider";
import { TrueLayerProvider } from "./providers/trueLayerProvider";
import fs from "fs";
import path from "path";
import { env } from "@/env.mjs";

// Get SIBS certificates (load from env or file)
const getSibsCertificates = () => {
  const certificate =
    env.SIBS_CERTIFICATE ||
    (fs.existsSync(path.join(process.cwd(), "certificates/sibs.crt"))
      ? fs.readFileSync(
          path.join(process.cwd(), "certificates/sibs.crt"),
          "utf8",
        )
      : "");

  const certificateKey =
    env.SIBS_CERTIFICATE_KEY ||
    (fs.existsSync(path.join(process.cwd(), "certificates/sibs.key"))
      ? fs.readFileSync(
          path.join(process.cwd(), "certificates/sibs.key"),
          "utf8",
        )
      : "");

  return { certificate, certificateKey };
};

/**
 * Factory function to get the appropriate banking provider
 */
export function getBankingProvider(providerName: string): BankingProvider {
  const isDevelopment = env.NODE_ENV !== "production";

  // Based on the provider name, return the appropriate provider instance
  switch (providerName.toLowerCase()) {
    case "sibs": {
      const { certificate, certificateKey } = getSibsCertificates();

      if (!certificate || !certificateKey) {
        throw new Error("SIBS certificates not found");
      }

      return new SibsProvider({
        baseUrl: env.SIBS_API_URL || "",
        clientId: env.SIBS_CLIENT_ID || "",
        clientSecret: env.SIBS_CLIENT_SECRET || "",
        redirectUri: env.SIBS_REDIRECT_URI || "",
        certificate,
        certificateKey,
        isSandbox: isDevelopment,
      });
    }

    case "truelayer":
      return new TrueLayerProvider({
        clientId: env.TRUELAYER_CLIENT_ID || "",
        clientSecret: env.TRUELAYER_CLIENT_SECRET || "",
        redirectUri: env.TRUELAYER_REDIRECT_URI || "",
        isSandbox: isDevelopment,
      });

    default:
      throw new Error(`Unsupported banking provider: ${providerName}`);
  }
}

/**
 * Get all supported banking providers
 */
export function getAllBankingProviders(): Array<{ id: string; name: string }> {
  return [
    { id: "sibs", name: "SIBS (Portuguese Banks)" },
    { id: "truelayer", name: "TrueLayer (UK & European Banks)" },
  ];
}
