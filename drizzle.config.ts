import { type Config } from "drizzle-kit";
import { env } from "@/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    // Clean the DATABASE_URL to remove any whitespace/newlines that might cause issues
    url: env.DATABASE_URL.trim(),
  },
  tablesFilter: ["Kleero_*"],
} satisfies Config;
