# Promotional Script Generation API

This document describes the new promotional script generation endpoint that uses Google's Gemini AI to create short, polite promotional scripts for ambient advertising.

## Endpoint

```
POST /api/v1/generate-promotional-script
```

## Description

This endpoint receives advertiser information and uses Google's Gemini AI to generate a short, polite promotional script (2-3 sentences maximum) suitable for ambient advertising. The system also determines the appropriate voice style (male or female) based on the business type and target audience.

## Request

### Headers
```
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `advertiserDisplayName` | string | Yes | The display name of the advertiser/business |
| `businessType` | string | Yes | Type of business (e.g., "Coffee shop", "Restaurant", "Gym", "Mall", "Fast Food") |
| `ruleId` | string | Yes | Environmental condition rule ID (e.g., "very_hot_singapore", "hot_humid_mall") |
| `currentTime` | string | Yes | Current timestamp in ISO 8601 format |

### Example Request
```json
{
  "advertiserDisplayName": "Joe's Coffee Corner",
  "businessType": "Coffee shop",
  "ruleId": "very_hot_singapore",
  "currentTime": "2025-08-03T12:00:00.000Z"
}
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "script": "Cool down at Joe's Coffee Corner with our iced beverages and air-conditioned comfort. Fresh coffee and pastries in a refreshingly cool space. Perfect escape from the Singapore heat.",
  "voiceStyle": "female",
  "advertiser": "Joe's Coffee Corner",
  "businessType": "Coffee shop",
  "ruleId": "very_hot_singapore",
  "environmentalContext": "very hot singapore",
  "generatedAt": "2025-08-03T12:00:00.000Z"
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Missing required fields",
  "required": ["advertiserDisplayName", "businessType", "ruleId", "currentTime"]
}
```

### Error Response (500 Internal Server Error)
```json
{
  "success": false,
  "error": "Failed to generate promotional script",
  "details": "Error message details"
}
```

## Features

### AI-Powered Script Generation
- Uses Google Gemini 1.5 Flash model for high-quality, contextual script generation
- Professional system prompt ensures consistent, polite, and engaging content
- Scripts are optimized for 2-3 sentences maximum for ambient advertising
- **Environmental awareness**: Scripts naturally incorporate weather/environmental conditions

### Environmental Context Integration
The system recognizes and adapts to environmental conditions based on rule IDs:
- `very_hot_singapore`: Very hot weather (>32°C) - emphasizes cooling, AC, cold drinks
- `hot_humid_mall`: Hot humid mall conditions - highlights air-conditioned comfort
- `rainy_singapore`: Rainy weather - suggests shelter, warmth, indoor activities
- `hazy_singapore`: Hazy/polluted air - promotes clean indoor environments
- `thunderstorm_singapore`: Storm conditions - emphasizes safe indoor shelter
- `lunch_time_heat`: Hot lunch conditions - targets office workers needing cooling
- And more environmental rules with contextual interpretation

### Intelligent Voice Style Selection
- Automatically determines appropriate voice style (male/female) based on business type
- Female voice: Coffee shops, restaurants, malls, beauty, fashion, healthcare
- Male voice: Gyms, fast food, and other business types

### Contextual Fallback System
- Comprehensive fallback system with weather-aware scripts
- Different fallback scripts for hot, rainy, and hazy conditions
- Pre-written contextual scripts for common business types
- Graceful error handling with meaningful error messages

### Business Type Support
The system is optimized for the following business types with environmental context:
- Restaurant (cooling dining, shelter from weather)
- Coffee shop (iced drinks vs hot drinks based on weather)
- Gym (indoor facilities during weather extremes)
- Mall (climate-controlled shopping)
- Fast Food (quick service with weather comfort)
- And any other business type (with appropriate environmental fallbacks)

## Setup Requirements

### Environment Variables
Add the following to your `.env` file:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

### Dependencies
The following npm package is required (already installed):
```bash
npm install @google/generative-ai
```

## Implementation Details

### System Prompt
The endpoint uses a sophisticated system prompt that ensures:
- Professional and polite tone
- 2-3 sentence maximum length
- Contextual relevance to business type
- Natural, non-intrusive messaging
- Subtle call-to-action inclusion

### Voice Style Logic
The voice style selection follows these rules:
- **Female voice**: Coffee shop, Restaurant, Mall, Beauty, Fashion, Healthcare
- **Male voice**: Gym, Fast Food, and other business types (default)

### Error Handling
- Missing required fields return 400 status with clear field requirements
- Gemini API failures trigger fallback script generation
- All errors are logged for debugging purposes

## Testing

### Using curl
```bash
curl -X POST http://localhost:5000/api/v1/generate-promotional-script \
  -H "Content-Type: application/json" \
  -d '{
    "advertiserDisplayName": "Joe'\''s Coffee Corner",
    "businessType": "Coffee shop",
    "rulesId": "RULE_001",
    "currentTime": "2025-08-03T12:00:00.000Z"
  }'
```

### Using the test script
A test script is provided at `test-endpoint.js` that demonstrates the endpoint usage and expected responses.

## Architecture

### File Structure
```
server/
├── routes.ts                          # Main endpoint implementation
└── services/
    └── geminiScriptService.ts        # Gemini AI integration service
```

### Service Classes
- **GeminiScriptService**: Handles Gemini AI integration, prompt management, and fallback logic
- Integrated into existing route structure for consistency
- Follows existing error handling and logging patterns

## Security Considerations

- API key is stored securely in environment variables
- Input validation prevents malicious requests
- Error messages don't expose sensitive information
- Rate limiting should be considered for production use

## Production Notes

- Ensure `GEMINI_API_KEY` is properly configured in production environment
- Monitor API usage and costs through Google Cloud Console
- Consider implementing caching for frequently requested script types
- Add request rate limiting to prevent abuse
- Monitor script quality and adjust system prompt if needed