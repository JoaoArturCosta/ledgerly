import { NextResponse } from "next/server";
import { runMigrations } from "@/server/db";

export async function GET() {
  try {
    console.log("🚀 API endpoint: Running migrations manually...");
    await runMigrations();
    return NextResponse.json({
      success: true,
      message: "Migrations completed successfully",
    });
  } catch (error) {
    console.error("❌ API endpoint: Error running migrations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to run migrations",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
