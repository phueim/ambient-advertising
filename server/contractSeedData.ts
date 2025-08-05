import { storage } from "./storage";

export async function seedContractSystem(force: boolean = false) {
  console.log("🔧 Checking contract system for existing data...");

  try {
    // Check if contract system already has data (unless forced)
    if (!force) {
      const existingTemplates = await storage.getAllContractTemplates();
      const existingVenues = await storage.getAllVenues();
      const existingContracts = await storage.getAllAdvertiserContracts();

      if (existingTemplates.length > 0 || existingVenues.length > 0 || existingContracts.length > 0) {
        console.log("ℹ️  Contract system already contains data, skipping seeding");
        console.log(`   Found: ${existingTemplates.length} templates, ${existingVenues.length} venues, ${existingContracts.length} contracts`);
        return;
      }
    }

    console.log(force ? "🔄 Force seeding contracts enabled, proceeding..." : "📝 Contract system is empty, proceeding with seeding...");

    // Create contract templates based on SGD rate card
    const sgdTemplates = [
      {
        name: "Base Campaign - SGD",
        tier: "base",
        category: "startup",
        currency: "SGD" as const,
        billingType: "hybrid" as const,
        monthlyFixedFee: "1350.00", // Average of 1200-1500
        perTriggerRate: "12.50",
        minimumGuarantee: "1000.00",
        performanceBonusThreshold: "500.00",
        performanceBonusRate: "0.10",
        venuePayoutType: "percentage" as const,
        venueFixedMonthly: "0.00",
        venuePercentageRate: "15.00",
        venueMinimumGuarantee: "600.00",
        venuePerformanceBonusThreshold: "300.00",
        venuePerformanceBonusRate: "0.05",
        maxTriggersPerMonth: 200,
        monthlyBudget: "5000.00",
        isActive: true,
      },
      {
        name: "Mid-Tier Rollout - SGD", 
        tier: "mid",
        category: "rollout",
        currency: "SGD" as const,
        billingType: "hybrid" as const,
        monthlyFixedFee: "4000.00", // Average of 3000-5000
        perTriggerRate: "8.00",
        minimumGuarantee: "3500.00",
        performanceBonusThreshold: "1000.00",
        performanceBonusRate: "0.12",
        venuePayoutType: "hybrid" as const,
        venueFixedMonthly: "800.00",
        venuePercentageRate: "20.00",
        venueMinimumGuarantee: "1200.00",
        venuePerformanceBonusThreshold: "600.00",
        venuePerformanceBonusRate: "0.08",
        maxTriggersPerMonth: 800,
        monthlyBudget: "15000.00",
        isActive: true,
      },
      {
        name: "Premium Nationwide - SGD",
        tier: "premium",
        category: "nationwide",
        currency: "SGD" as const,
        billingType: "monthly_fixed" as const,
        monthlyFixedFee: "8000.00", // Starting from 8000+
        perTriggerRate: "5.00",
        minimumGuarantee: "8000.00",
        performanceBonusThreshold: "2000.00",
        performanceBonusRate: "0.15",
        venuePayoutType: "hybrid" as const,
        venueFixedMonthly: "1500.00",
        venuePercentageRate: "25.00",
        venueMinimumGuarantee: "1800.00",
        venuePerformanceBonusThreshold: "1000.00",
        venuePerformanceBonusRate: "0.10",
        maxTriggersPerMonth: 2000,
        monthlyBudget: "25000.00",
        isActive: true,
      }
    ];

    // Create MYR equivalents (approximate 1 SGD = 3.5 MYR)
    const myrTemplates = [
      {
        name: "Base Campaign - MYR",
        tier: "base",
        category: "startup",
        currency: "MYR" as const,
        billingType: "hybrid" as const,
        monthlyFixedFee: "4725.00", // 1350 * 3.5
        perTriggerRate: "43.75", // 12.50 * 3.5
        minimumGuarantee: "3500.00", // 1000 * 3.5
        performanceBonusThreshold: "1750.00", // 500 * 3.5
        performanceBonusRate: "0.10",
        venuePayoutType: "percentage" as const,
        venueFixedMonthly: "0.00",
        venuePercentageRate: "15.00",
        venueMinimumGuarantee: "2100.00", // 600 * 3.5
        venuePerformanceBonusThreshold: "1050.00", // 300 * 3.5
        venuePerformanceBonusRate: "0.05",
        maxTriggersPerMonth: 200,
        monthlyBudget: "17500.00", // 5000 * 3.5
        isActive: true,
      },
      {
        name: "Mid-Tier Rollout - MYR",
        tier: "mid",
        category: "rollout",
        currency: "MYR" as const,
        billingType: "hybrid" as const,
        monthlyFixedFee: "14000.00", // 4000 * 3.5
        perTriggerRate: "28.00", // 8.00 * 3.5
        minimumGuarantee: "12250.00", // 3500 * 3.5
        performanceBonusThreshold: "3500.00", // 1000 * 3.5
        performanceBonusRate: "0.12",
        venuePayoutType: "hybrid" as const,
        venueFixedMonthly: "2800.00", // 800 * 3.5
        venuePercentageRate: "20.00",
        venueMinimumGuarantee: "4200.00", // 1200 * 3.5
        venuePerformanceBonusThreshold: "2100.00", // 600 * 3.5
        venuePerformanceBonusRate: "0.08",
        maxTriggersPerMonth: 800,
        monthlyBudget: "52500.00", // 15000 * 3.5
        isActive: true,
      },
      {
        name: "Premium Nationwide - MYR",
        tier: "premium", 
        category: "nationwide",
        currency: "MYR" as const,
        billingType: "monthly_fixed" as const,
        monthlyFixedFee: "28000.00", // 8000 * 3.5
        perTriggerRate: "17.50", // 5.00 * 3.5
        minimumGuarantee: "28000.00", // 8000 * 3.5
        performanceBonusThreshold: "7000.00", // 2000 * 3.5
        performanceBonusRate: "0.15",
        venuePayoutType: "hybrid" as const,
        venueFixedMonthly: "5250.00", // 1500 * 3.5
        venuePercentageRate: "25.00",
        venueMinimumGuarantee: "6300.00", // 1800 * 3.5
        venuePerformanceBonusThreshold: "3500.00", // 1000 * 3.5
        venuePerformanceBonusRate: "0.10",
        maxTriggersPerMonth: 2000,
        monthlyBudget: "87500.00", // 25000 * 3.5
        isActive: true,
      }
    ];

    // Create all contract templates
    const allTemplates = [...sgdTemplates, ...myrTemplates];
    const createdTemplates = [];

    for (const template of allTemplates) {
      const created = await storage.createContractTemplate(template);
      createdTemplates.push(created);
      console.log(`✅ Created contract template: ${created.name}`);
    }

    // Create sample venues for Singapore and Malaysia
    const venues = [
      {
        name: "FairPrice Xtra Jurong Point",
        location: "1 Jurong West Central 2, #B1-01, Singapore 648886",
        type: "supermarket",
        country: "Singapore",
        city: "Singapore",
        capacity: 8000,
        isActive: true,
      },
      {
        name: "Guardian Pharmacy Orchard",
        location: "391 Orchard Road, #B1-07, Singapore 238872",
        type: "pharmacy",
        country: "Singapore",
        city: "Singapore",
        capacity: 3500,
        isActive: true,
      },
      {
        name: "7-Eleven Marina Bay",
        location: "10 Bayfront Avenue, Singapore 018956",
        type: "convenience",
        country: "Singapore",
        city: "Singapore",
        capacity: 2000,
        isActive: true,
      },
      {
        name: "AEON Big Subang Jaya",
        location: "1, Jalan SS 15/8, Ss 15, 47500 Subang Jaya, Selangor",
        type: "hypermarket",
        country: "Malaysia",
        city: "Subang Jaya",
        capacity: 12000,
        isActive: true,
      },
      {
        name: "Watson's KLCC",
        location: "Level LG2, Suria KLCC, 50088 Kuala Lumpur",
        type: "pharmacy",
        country: "Malaysia",
        city: "Kuala Lumpur",
        capacity: 5000,
        isActive: true,
      }
    ];

    const createdVenues = [];
    for (const venue of venues) {
      const created = await storage.createVenue(venue);
      createdVenues.push(created);
      console.log(`✅ Created venue: ${created.name}`);
    }

    // Create sample advertiser contracts using templates
    const advertisers = await storage.getAllAdvertisers();
    const sampleContracts = [];

    if (advertisers.length > 0) {
      // Assign first advertiser to SGD Premium contract
      const premiumSgdTemplate = createdTemplates.find(t => t.name === "Premium Nationwide - SGD");
      if (premiumSgdTemplate) {
        const contract = await storage.createAdvertiserContract({
          advertiserId: advertisers[0].id,
          templateId: premiumSgdTemplate.id,
          contractName: `${advertisers[0].displayName} - Premium SGD Contract`,
          currency: "SGD",
          billingType: "monthly_fixed",
          monthlyFixedFee: premiumSgdTemplate.monthlyFixedFee,
          perTriggerRate: premiumSgdTemplate.perTriggerRate,
          minimumGuarantee: premiumSgdTemplate.minimumGuarantee,
          performanceBonusThreshold: premiumSgdTemplate.performanceBonusThreshold,
          performanceBonusRate: premiumSgdTemplate.performanceBonusRate,
          maxTriggersPerMonth: premiumSgdTemplate.maxTriggersPerMonth,
          monthlyBudget: premiumSgdTemplate.monthlyBudget,
          currentMonthSpend: "0.00",
          currentMonthTriggers: 0,
          startDate: new Date().toISOString().split('T')[0],
          status: "active"
        });
        sampleContracts.push(contract);
        console.log(`✅ Created advertiser contract: ${contract.contractName}`);
      }

      // Assign second advertiser to MYR Mid-Tier contract  
      if (advertisers.length > 1) {
        const midTierMyrTemplate = createdTemplates.find(t => t.name === "Mid-Tier Rollout - MYR");
        if (midTierMyrTemplate) {
          const contract = await storage.createAdvertiserContract({
            advertiserId: advertisers[1].id,
            templateId: midTierMyrTemplate.id,
            contractName: `${advertisers[1].displayName} - Mid-Tier MYR Contract`,
            currency: "MYR",
            billingType: "hybrid",
            monthlyFixedFee: midTierMyrTemplate.monthlyFixedFee,
            perTriggerRate: midTierMyrTemplate.perTriggerRate,
            minimumGuarantee: midTierMyrTemplate.minimumGuarantee,
            performanceBonusThreshold: midTierMyrTemplate.performanceBonusThreshold,
            performanceBonusRate: midTierMyrTemplate.performanceBonusRate,
            maxTriggersPerMonth: midTierMyrTemplate.maxTriggersPerMonth,
            monthlyBudget: midTierMyrTemplate.monthlyBudget,
            currentMonthSpend: "0.00",
            currentMonthTriggers: 0,
            startDate: new Date().toISOString().split('T')[0],
            status: "active"
          });
          sampleContracts.push(contract);
          console.log(`✅ Created advertiser contract: ${contract.contractName}`);
        }
      }
    }

    // Create sample venue contracts
    if (createdVenues.length > 0) {
      // Singapore venues get SGD contracts
      const sgdVenues = createdVenues.filter(v => v.country === "Singapore");
      const midTierSgdTemplate = createdTemplates.find(t => t.name === "Mid-Tier Rollout - SGD");
      
      for (const venue of sgdVenues.slice(0, 2)) { // First 2 Singapore venues
        if (midTierSgdTemplate) {
          const contract = await storage.createVenueContract({
            venueId: venue.id,
            templateId: midTierSgdTemplate.id,
            contractName: `${venue.name} - SGD Venue Contract`,
            currency: "SGD",
            payoutType: "hybrid",
            fixedMonthly: midTierSgdTemplate.venueFixedMonthly,
            percentageRate: midTierSgdTemplate.venuePercentageRate,
            minimumGuarantee: midTierSgdTemplate.venueMinimumGuarantee,
            performanceBonusThreshold: midTierSgdTemplate.venuePerformanceBonusThreshold,
            performanceBonusRate: midTierSgdTemplate.venuePerformanceBonusRate,
            currentMonthRevenue: "0.00",
            currentMonthTriggers: 0,
            startDate: new Date().toISOString().split('T')[0],
            status: "active"
          });
          console.log(`✅ Created venue contract: ${contract.contractName}`);
        }
      }

      // Malaysia venues get MYR contracts
      const myrVenues = createdVenues.filter(v => v.country === "Malaysia");
      const baseMyrTemplate = createdTemplates.find(t => t.name === "Base Campaign - MYR");
      
      for (const venue of myrVenues) { // All Malaysia venues
        if (baseMyrTemplate) {
          const contract = await storage.createVenueContract({
            venueId: venue.id,
            templateId: baseMyrTemplate.id,
            contractName: `${venue.name} - MYR Venue Contract`,
            currency: "MYR",
            payoutType: "percentage",
            fixedMonthly: baseMyrTemplate.venueFixedMonthly,
            percentageRate: baseMyrTemplate.venuePercentageRate,
            minimumGuarantee: baseMyrTemplate.venueMinimumGuarantee,
            performanceBonusThreshold: baseMyrTemplate.venuePerformanceBonusThreshold,
            performanceBonusRate: baseMyrTemplate.venuePerformanceBonusRate,
            currentMonthRevenue: "0.00",
            currentMonthTriggers: 0,
            startDate: new Date().toISOString().split('T')[0],
            status: "active"
          });
          console.log(`✅ Created venue contract: ${contract.contractName}`);
        }
      }
    }

    console.log("✅ Contract system seeding completed successfully!");
    console.log(`✅ Created ${createdTemplates.length} contract templates`);
    console.log(`✅ Created ${createdVenues.length} venues`);
    console.log(`✅ Created ${sampleContracts.length} advertiser contracts`);

  } catch (error) {
    console.error("❌ Error seeding contract system:", error.message);
    throw error;
  }
}