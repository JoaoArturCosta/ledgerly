import { type Config } from "drizzle-kit";
import { env } from "@/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    // Extract just the required database name from the connection string
    // The connection string format is typically: postgresql://user:password@host:port/database
    host: env.DATABASE_URL.split("@")[1]?.split(":")[0] ?? "localhost",
    port: parseInt(
      env.DATABASE_URL.split("@")[1]?.split(":")[1]?.split("/")[0] ?? "5432",
    ),
    user: env.DATABASE_URL.split("://")[1]?.split(":")[0] ?? "postgres",
    password: env.DATABASE_URL.split(":")[2]?.split("@")[0] ?? "",
    database: env.DATABASE_URL.split("/").pop()?.split("?")[0] ?? "postgres",
    ssl: env.DATABASE_URL.includes("ssl="),
  },
  tablesFilter: ["Kleero_*"],
} satisfies Config;
