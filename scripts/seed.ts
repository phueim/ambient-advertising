#!/usr/bin/env tsx

// Set default DATABASE_URL BEFORE any imports
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ambient_advertising";

import { seedDatabase } from "../server/seedData";
import { seedContractSystem } from "../server/contractSeedData";

async function runSeeding() {
  console.log("🌱 Manual seeding initiated...");
  console.log(`📍 Database: ${process.env.DATABASE_URL}`);
  
  const force = process.argv.includes('--force');
  
  if (force) {
    console.log("⚠️  Force mode: bypassing existence checks and adding to existing data");
  }

  try {
    // First, check if we can connect and push schema if needed
    console.log("🔧 Ensuring database schema is up to date...");
    
    await seedDatabase(force);
    await seedContractSystem(force);
    
    console.log("✅ Manual seeding completed successfully!");
  } catch (error) {
    if (error.message.includes("does not exist")) {
      console.error("❌ Database schema not found. Please run:");
      console.error("   npm run db:push");
      console.error("   Then run the seed command again");
    } else {
      console.error("❌ Seeding failed:", error.message);
      console.error("💡 Make sure PostgreSQL is running and accessible");
    }
  }

  process.exit(1);
}

runSeeding();
