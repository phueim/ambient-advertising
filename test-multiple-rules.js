// Test script for multiple environmental rule scenarios
// This demonstrates how different weather conditions create different scripts

const endpoint = 'http://localhost:5000/api/v1/generate-promotional-script';

const testScenarios = [
  {
    name: "Very Hot Weather - Coffee Shop",
    data: {
      advertiserDisplayName: "Joe's Coffee Corner",
      businessType: "Coffee shop",
      ruleId: "very_hot_singapore",
      currentTime: new Date().toISOString()
    },
    expectedTheme: "Cooling, iced drinks, air-conditioning"
  },
  {
    name: "Hot Humid Mall - Restaurant", 
    data: {
      advertiserDisplayName: "Mama's Kitchen",
      businessType: "Restaurant",
      ruleId: "hot_humid_mall",
      currentTime: new Date().toISOString()
    },
    expectedTheme: "Air-conditioned comfort, cool dining"
  },
  {
    name: "Rainy Weather - Gym",
    data: {
      advertiserDisplayName: "FitZone Singapore",
      businessType: "Gym", 
      ruleId: "rainy_singapore",
      currentTime: new Date().toISOString()
    },
    expectedTheme: "Indoor activities, staying dry"
  },
  {
    name: "Hazy Conditions - Mall",
    data: {
      advertiserDisplayName: "Central Mall",
      businessType: "Mall",
      ruleId: "hazy_singapore", 
      currentTime: new Date().toISOString()
    },
    expectedTheme: "Clean indoor air, filtered environment"
  },
  {
    name: "Lunch Time Heat - Fast Food",
    data: {
      advertiserDisplayName: "Quick Bites",
      businessType: "Fast Food",
      ruleId: "lunch_time_heat",
      currentTime: new Date().toISOString()
    },
    expectedTheme: "Quick cooling relief, cold drinks"
  }
];

console.log('Testing promotional script generation with multiple environmental scenarios...\n');

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   Rule ID: ${scenario.data.ruleId}`);
  console.log(`   Business: ${scenario.data.advertiserDisplayName} (${scenario.data.businessType})`);
  console.log(`   Expected Theme: ${scenario.expectedTheme}`);
  
  const curlCommand = `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(scenario.data)}'`;
  
  console.log(`   Curl: ${curlCommand}`);
  console.log('');
});

console.log('To test all scenarios, run each curl command above, or use the provided Node.js test function below:\n');

// Function to test all scenarios if running in Node.js environment
async function testAllScenarios() {
  console.log('Running automated tests...\n');
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`Testing: ${scenario.name}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario.data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Success: "${result.script}"`);
        console.log(`   Voice: ${result.voiceStyle}`);
        console.log(`   Environmental Context: ${result.environmentalContext}`);
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log('');
    
    // Add small delay between requests
    if (i < testScenarios.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Export for use in other test files
if (typeof module !== 'undefined') {
  module.exports = { testScenarios, testAllScenarios };
}

// Auto-run if fetch is available (modern Node.js or browser)
if (typeof fetch !== 'undefined') {
  testAllScenarios().catch(console.error);
} else {
  console.log('Note: Auto-testing requires fetch support. Use curl commands above or run in browser/modern Node.js');
}