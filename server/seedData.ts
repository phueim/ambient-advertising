import { storage } from "./storage";
import { AutomationPipeline } from "./services/automationPipeline";
import * as fs from "fs";
import * as path from "path";
import type { InsertAdvertiser, InsertUser } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Password hashing function (matches auth.ts)
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase(force: boolean = false) {
  console.log("🌱 Checking database for existing data...");

  try {
    // Check existing data
    const existingAdvertisers = await storage.getAllAdvertisers();
    const existingLocations = await storage.getAllLocations();
    const existingRules = await storage.getAllConditionRules();
    const existingAudio = await storage.getAllAudio();
    const existingUsers = await storage.getAllUsers();

    // Skip seeding if data exists and not forced
    if (!force && (existingAdvertisers.length > 0 || existingLocations.length > 0 || existingRules.length > 0 || existingUsers.length > 0)) {
      console.log("ℹ️  Database already contains data, skipping seeding");
      console.log(`   Found: ${existingAdvertisers.length} advertisers, ${existingLocations.length} locations, ${existingRules.length} rules, ${existingAudio.length} audio, ${existingUsers.length} users`);
      return;
    }

    // If forced and data exists, use existing data
    if (force && existingAdvertisers.length > 0) {
      console.log("🔄 Force mode: using existing data (audio and advertising seeding disabled)");
      // Note: Audio and advertising seeding has been removed
      console.log("\n🎉 Force seeding completed!");
      console.log(`Found ${existingAdvertisers.length} existing advertisers`);
      console.log(`Found ${existingLocations.length} existing locations`);
      console.log(`Found ${existingRules.length} existing rules`);
      return {
        advertisers: existingAdvertisers.length,
        locations: existingLocations.length,
        rules: existingRules.length,
        audio: 0,
        advertising: 0
      };
    }

    console.log(force ? "🔄 Force seeding enabled, proceeding..." : "📝 Database is empty, proceeding with seeding...");

    // Create sample users first
    console.log("Creating users...");
    await seedUsers();

    // Create sample advertisers
    console.log("Creating advertisers...");
    
    const advertisers: InsertAdvertiser[] = [
      {
        name: "tourism_australia",
        displayName: "Tourism Australia",
        businessType: "Mall" as const,
        creditBalance: "1000.00",
        budgetCap: "2000.00",
        status: "Active" as const
      },
      {
        name: "coldbrew_drinks",
        displayName: "ColdBrew Drinks",
        businessType: "Coffee shop" as const,
        creditBalance: "800.00",
        budgetCap: "1500.00",
        status: "Active"
      },
      {
        name: "grab_insurance",
        displayName: "Grab / Insurance",
        businessType: "Mall" as const,
        creditBalance: "1200.00",
        budgetCap: "2500.00",
        status: "Active"
      },
      {
        name: "local_fnb_comfort",
        displayName: "Local F&B Comfort",
        businessType: "Restaurant" as const,
        creditBalance: "600.00",
        budgetCap: "1000.00",
        status: "Active"
      },
      {
        name: "soup_warm_drinks",
        displayName: "Soup & Warm Drinks",
        businessType: "Restaurant" as const,
        creditBalance: "500.00",
        budgetCap: "800.00",
        status: "Active"
      },
      {
        name: "suncare_products",
        displayName: "SunCare Products",
        businessType: "Gym" as const,
        creditBalance: "400.00",
        budgetCap: "600.00",
        status: "Active"
      },
      {
        name: "health_wellness",
        displayName: "Health & Wellness",
        businessType: "Gym" as const,
        creditBalance: "700.00",
        budgetCap: "1200.00",
        status: "Active"
      },
      {
        name: "general_branding",
        displayName: "General Branding",
        businessType: "Mall" as const,
        creditBalance: "300.00",
        budgetCap: "500.00",
        status: "Active"
      },
      {
        name: "breakfast_fnb",
        displayName: "Breakfast F&B",
        businessType: "Fast Food" as const,
        creditBalance: "450.00",
        budgetCap: "750.00",
        status: "Active"
      }
    ];

    const createdAdvertisers = [];
    for (const advertiser of advertisers) {
      const created = await storage.createAdvertiser(advertiser);
      createdAdvertisers.push(created);
      console.log(`✅ Created advertiser: ${created.displayName}`);
    }

    // Create sample locations
    console.log("Creating locations...");
    
    const locations = [
      {
        name: "Orchard Road Mall",
        address: "238 Orchard Road, Singapore 238851",
        type: "mall",
        isActive: true
      },
      {
        name: "Marina Bay Sands",
        address: "10 Bayfront Avenue, Singapore 018956",
        type: "mall",
        isActive: true
      },
      {
        name: "Changi Airport Terminal 3",
        address: "65 Airport Boulevard, Singapore 819663",
        type: "airport",
        isActive: true
      },
      {
        name: "Jurong Point",
        address: "1 Jurong West Central 2, Singapore 648886",
        type: "mall",
        isActive: true
      },
      {
        name: "Tampines Mall",
        address: "4 Tampines Central 5, Singapore 529510",
        type: "mall",
        isActive: true
      }
    ];

    for (const location of locations) {
      const created = await storage.createLocation(location);
      console.log(`✅ Created location: ${created.name}`);
    }

    // Create condition rules based on @condition.md specification
    console.log("Creating condition rules...");
    
    const conditionRules = [
      // Single Weather-based Rules
      // ColdBrew Drinks - 3 rules (Coffee shop)
      {
        ruleId: "very_hot_singapore",
        advertiserId: createdAdvertisers.find(a => a.name === "coldbrew_drinks")!.id,
        priority: 10,
        conditions: {
          temperature_c_greater_than: 35
        },
        isActive: true
      },
      {
        ruleId: "afternoon_heat",
        advertiserId: createdAdvertisers.find(a => a.name === "coldbrew_drinks")!.id,
        priority: 8,
        conditions: {
          time_of_day_between_start: "14:00",
          time_of_day_between_end: "17:00",
          temperature_c_greater_than: 30
        },
        isActive: true
      },
      {
        ruleId: "high_humidity_hot",
        advertiserId: createdAdvertisers.find(a => a.name === "coldbrew_drinks")!.id,
        priority: 7,
        conditions: {
          humidity_percent_above: 75,
          temperature_c_greater_than: 28
        },
        isActive: true
      },

      // Tourism Australia - 2 rules (Mall)  
      {
        ruleId: "hot_weather",
        advertiserId: createdAdvertisers.find(a => a.name === "tourism_australia")!.id,
        priority: 9,
        conditions: {
          temperature_c_greater_than: 32
        },
        isActive: true
      },
      {
        ruleId: "sunny_conditions",
        advertiserId: createdAdvertisers.find(a => a.name === "tourism_australia")!.id,
        priority: 6,
        conditions: {
          weather_condition_contains: "sunny"
        },
        isActive: true
      },

      // Soup & Warm Drinks - 3 rules (Restaurant)
      {
        ruleId: "cool_weather",
        advertiserId: createdAdvertisers.find(a => a.name === "soup_warm_drinks")!.id,
        priority: 7,
        conditions: {
          temperature_c_less_than: 25
        },
        isActive: true
      },
      {
        ruleId: "rainy_conditions",
        advertiserId: createdAdvertisers.find(a => a.name === "soup_warm_drinks")!.id,
        priority: 8,
        conditions: {
          weather_condition_contains: "rain"
        },
        isActive: true
      },
      {
        ruleId: "morning_cool",
        advertiserId: createdAdvertisers.find(a => a.name === "soup_warm_drinks")!.id,
        priority: 6,
        conditions: {
          time_of_day_between_start: "06:00",
          time_of_day_between_end: "10:00",
          temperature_c_less_than: 27
        },
        isActive: true
      },

      // SunCare Products - 2 rules (Gym)
      {
        ruleId: "high_humidity",
        advertiserId: createdAdvertisers.find(a => a.name === "suncare_products")!.id,
        priority: 8,
        conditions: {
          humidity_percent_above: 80
        },
        isActive: true
      },
      {
        ruleId: "uv_high",
        advertiserId: createdAdvertisers.find(a => a.name === "suncare_products")!.id,
        priority: 9,
        conditions: {
          uv_index_greater_than: 8
        },
        isActive: true
      },

      // Local F&B Comfort - 1 rule (Restaurant)
      {
        ruleId: "comfort_food_weather",
        advertiserId: createdAdvertisers.find(a => a.name === "local_fnb_comfort")!.id,
        priority: 7,
        conditions: {
          weather_condition_contains: "cloudy",
          temperature_c_between_min: 26,
          temperature_c_between_max: 30
        },
        isActive: true
      },

      // Grab/Insurance - 2 rules (Mall)
      {
        ruleId: "morning_peak_hours",
        advertiserId: createdAdvertisers.find(a => a.name === "grab_insurance")!.id,
        priority: 9,
        conditions: {
          time_of_day_between_start: "07:00",
          time_of_day_between_end: "09:30"
        },
        isActive: true
      },
      {
        ruleId: "mall_locations",
        advertiserId: createdAdvertisers.find(a => a.name === "grab_insurance")!.id,
        priority: 7,
        conditions: {
          location_type: "mall"
        },
        isActive: true
      },

      // Breakfast F&B - 3 rules (Fast Food)
      {
        ruleId: "breakfast_peak_hours",
        advertiserId: createdAdvertisers.find(a => a.name === "breakfast_fnb")!.id,
        priority: 9,
        conditions: {
          time_of_day_between_start: "06:30",
          time_of_day_between_end: "10:00"
        },
        isActive: true
      },
      {
        ruleId: "lunch_peak_hours",
        advertiserId: createdAdvertisers.find(a => a.name === "breakfast_fnb")!.id,
        priority: 8,
        conditions: {
          time_of_day_between_start: "12:00",
          time_of_day_between_end: "14:00"
        },
        isActive: true
      },
      {
        ruleId: "weekend_brunch",
        advertiserId: createdAdvertisers.find(a => a.name === "breakfast_fnb")!.id,
        priority: 7,
        conditions: {
          is_weekend: true,
          time_of_day_between_start: "10:00",
          time_of_day_between_end: "15:00"
        },
        isActive: true
      },

      // Health & Wellness - 2 rules (Gym)
      {
        ruleId: "airport_locations",
        advertiserId: createdAdvertisers.find(a => a.name === "health_wellness")!.id,
        priority: 8,
        conditions: {
          location_type: "airport"
        },
        isActive: true
      },
      {
        ruleId: "fitness_hours",
        advertiserId: createdAdvertisers.find(a => a.name === "health_wellness")!.id,
        priority: 7,
        conditions: {
          time_of_day_between_start: "05:30",
          time_of_day_between_end: "08:00"
        },
        isActive: true
      },

      // General Branding - 1 rule (Mall)
      {
        ruleId: "weekend_hours",
        advertiserId: createdAdvertisers.find(a => a.name === "general_branding")!.id,
        priority: 6,
        conditions: {
          is_weekend: true
        },
        isActive: true
      }
    ];

    for (const rule of conditionRules) {
      const created = await storage.createConditionRule(rule);
      console.log(`✅ Created condition rule: ${created.ruleId}`);
    }

    // Note: Audio and advertising data seeding has been removed
    const audioCount = 0;
    const advertisingCount = 0;

    console.log("\n🎉 Database seeded successfully!");
    console.log(`Created ${createdAdvertisers.length} advertisers`);
    console.log(`Created ${locations.length} locations`);
    console.log(`Created ${conditionRules.length} condition rules`);
    console.log(`Created ${audioCount} audio records`);
    console.log(`Created ${advertisingCount} advertising campaigns`);

    return {
      advertisers: createdAdvertisers.length,
      locations: locations.length,
      rules: conditionRules.length,
      audio: audioCount,
      advertising: advertisingCount
    };

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// REMOVED: Audio seeding function has been disabled
// async function seedAudioData(advertisers: any[]): Promise<number> { ... }

function getAdvertiserIdFromContent(text: string, advertisers: any[]): number {
  const lowerText = text.toLowerCase();
  
  // Content-based advertiser mapping
  if (lowerText.includes('air filter') || lowerText.includes('air quality') || lowerText.includes('breathe easier')) {
    return advertisers.find(a => a.name === "health_wellness")?.id || advertisers[0].id;
  }
  if (lowerText.includes('cold') || lowerText.includes('ice') || lowerText.includes('refreshing') || lowerText.includes('drink')) {
    return advertisers.find(a => a.name === "coldbrew_drinks")?.id || advertisers[0].id;
  }
  if (lowerText.includes('tourism') || lowerText.includes('visit') || lowerText.includes('destination') || lowerText.includes('travel')) {
    return advertisers.find(a => a.name === "tourism_australia")?.id || advertisers[0].id;
  }
  if (lowerText.includes('insurance') || lowerText.includes('grab') || lowerText.includes('protection')) {
    return advertisers.find(a => a.name === "grab_insurance")?.id || advertisers[0].id;
  }
  if (lowerText.includes('soup') || lowerText.includes('warm') || lowerText.includes('comfort food')) {
    return advertisers.find(a => a.name === "soup_warm_drinks")?.id || advertisers[0].id;
  }
  if (lowerText.includes('suncare') || lowerText.includes('sun protection') || lowerText.includes('uv')) {
    return advertisers.find(a => a.name === "suncare_products")?.id || advertisers[0].id;
  }
  if (lowerText.includes('breakfast') || lowerText.includes('morning')) {
    return advertisers.find(a => a.name === "breakfast_fnb")?.id || advertisers[0].id;
  }
  
  // Default to a random advertiser
  return advertisers[Math.floor(Math.random() * advertisers.length)].id;
}

function extractVariablesFromText(text: string): any {
  const variables: any = {};
  
  // Extract common variables from the text
  const temperatureMatch = text.match(/temperature[:\s]+(\d+)/i);
  if (temperatureMatch) {
    variables.temperature = parseInt(temperatureMatch[1]);
  }
  
  const humidityMatch = text.match(/humidity[:\s]+(\d+)/i);
  if (humidityMatch) {
    variables.humidity = parseInt(humidityMatch[1]);
  }
  
  // Time-based variable parsing
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    variables.hour_of_day = parseInt(timeMatch[1]);
    variables.time = timeMatch[0]; // Full matched time string
  }
  
  const dateMatch = text.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
  if (dateMatch) {
    variables.dayOfWeek = dateMatch[1];
  }
  
  return Object.keys(variables).length > 0 ? variables : null;
}

// REMOVED: Advertising seeding function has been disabled
// async function seedAdvertisingData(advertisers: any[], conditionRules: any[]): Promise<number> { ... }

export async function startAutomationDemo() {
  console.log("\n🚀 Starting Ambient Advertising Automation Demo...");
  
  const pipeline = new AutomationPipeline();
  
  // Start with 2-minute intervals for demo purposes
  await pipeline.startAutomation(2);
  
  console.log("✅ Automation pipeline started with 2-minute intervals");
  console.log("🔄 First execution will run immediately, then every 2 minutes");
  console.log("📊 Monitor the logs to see the AI automation in action!");
  
  return pipeline;
}

// Separate function to seed users
async function seedUsers() {
  const users: InsertUser[] = [
    {
      username: "admin",
      email: "admin@ambient.local",
      password: await hashPassword("admin123"),
      firstName: "System",
      lastName: "Administrator", 
      role: "admin",
      isActive: true
    },
    {
      username: "demo",
      email: "demo@ambient.local",
      password: await hashPassword("demo123"),
      firstName: "Demo",
      lastName: "User",
      role: "user",
      isActive: true
    },
    {
      username: "manager",
      email: "manager@ambient.local",
      password: await hashPassword("manager123"),
      firstName: "Campaign",
      lastName: "Manager",
      role: "user",
      isActive: true
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    try {
      const user = await storage.createUser(userData);
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${user.username} (${user.email})`);
    } catch (error) {
      console.error(`   ✗ Failed to create user ${userData.username}:`, error.message);
    }
  }
  
  console.log(`📋 Created ${createdUsers.length}/${users.length} users`);
  return createdUsers;
}