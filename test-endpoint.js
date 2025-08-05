// Test script for the promotional script generation endpoint
// This script demonstrates how to call the new endpoint

const endpoint = 'http://localhost:5000/api/v1/generate-promotional-script';

const testData = {
  advertiserDisplayName: "Joe's Coffee Corner",
  businessType: "Coffee shop",
  ruleId: "very_hot_singapore",
  currentTime: new Date().toISOString()
};

console.log('Testing promotional script generation endpoint...');
console.log('Endpoint:', endpoint);
console.log('Test data:', JSON.stringify(testData, null, 2));

// Note: This test requires the server to be running and a valid GEMINI_API_KEY to be set
console.log('\nTo test this endpoint:');
console.log('1. Set GEMINI_API_KEY in your environment variables');
console.log('2. Start the development server: npm run dev');
console.log('3. Run this test with: node test-endpoint.js');

// Example curl command
const curlCommand = `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testData)}'`;

console.log('\nExample curl command:');
console.log(curlCommand);

// Example expected response
const expectedResponse = {
  success: true,
  script: "Cool down at Joe's Coffee Corner with our iced beverages and air-conditioned comfort. Fresh coffee and pastries in a refreshingly cool space. Perfect escape from the Singapore heat.",
  voiceStyle: "female",
  advertiser: "Joe's Coffee Corner",
  businessType: "Coffee shop",
  ruleId: "very_hot_singapore",
  environmentalContext: "very hot singapore",
  generatedAt: "2025-08-03T12:00:00.000Z"
};

console.log('\nExample expected response:');
console.log(JSON.stringify(expectedResponse, null, 2));

// If running in Node.js with fetch available
if (typeof fetch !== 'undefined') {
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  })
  .then(response => response.json())
  .then(data => {
    console.log('\nActual response:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('\nError testing endpoint:', error.message);
    console.log('Make sure the server is running and GEMINI_API_KEY is set');
  });
} else {
  console.log('\nNote: To run the actual test, use a tool that supports fetch() or use curl');
}