import { seedDatabase } from "./index";

// Self-invoking async function to handle promises
void (async () => {
  try {
    await seedDatabase();
    console.log("💾 Database seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding the database:", error);
    process.exit(1);
  }
})();
