# LLM Integration Guide

This document provides comprehensive details on how the AI Chatbot integrates with your external LLM microservice.

## Overview

The chat-based condition builder uses two separate API endpoints:
1. **Chat API** - For streaming conversational responses
2. **Construct API** - For extracting structured condition data from conversations

## Environment Configuration

Add these environment variables to your `.env` file:

```env
VITE_LLM_CHAT_API_URL=https://your-llm-service.com/api/chat
VITE_LLM_CONSTRUCT_API_URL=https://your-llm-service.com/api/construct
VITE_LLM_API_KEY=your-api-key-here
```

## API Specifications

### 1. Chat API (Streaming)

**Endpoint:** `POST /api/chat`

**Purpose:** Conversational AI responses with streaming support

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are an intelligent assistant helping users create conditional logic for email templates..."
    },
    {
      "role": "user",
      "content": "I want to check if the user is premium"
    },
    {
      "role": "assistant",
      "content": "Great! I can help you with that..."
    }
  ],
  "variables": [
    { "name": "isPremiumUser", "type": "boolean" },
    { "name": "accountStatus", "type": "string" }
  ],
  "stream": true
}
```

**Response Format (SSE - Server-Sent Events):**

The API should return streaming responses in SSE format:

```
data: {"content": "Great! "}
data: {"content": "I can "}
data: {"content": "help you "}
data: {"content": "with that."}
data: [DONE]
```

**Alternative Response Formats Supported:**

Option 1 - Simple content:
```
data: {"content": "chunk text"}
```

Option 2 - OpenAI-compatible format:
```
data: {"choices": [{"delta": {"content": "chunk text"}}]}
```

Option 3 - Token format:
```
data: {"token": "chunk text"}
```

Option 4 - Plain text (fallback):
```
data: chunk text
```

### 2. Construct API (JSON Response)

**Endpoint:** `POST /api/construct`

**Purpose:** Analyze conversation and extract structured condition

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

**Request Body:**
```json
{
  "conversation": [
    {
      "role": "system",
      "content": "You are an intelligent assistant..."
    },
    {
      "role": "user",
      "content": "Show this if isPremiumUser is true"
    },
    {
      "role": "assistant",
      "content": "I understand you want to check if isPremiumUser equals true..."
    }
  ],
  "variables": [
    { "name": "isPremiumUser", "type": "boolean" },
    { "name": "accountStatus", "type": "string" },
    { "name": "accountBalance", "type": "number" }
  ]
}
```

**Response Format (JSON):**

Success Response:
```json
{
  "success": true,
  "condition": {
    "name": "isPremiumUserIsTrue",
    "description": "Checks if isPremiumUser equals true",
    "clauses": [
      {
        "variable": "isPremiumUser",
        "operator": "==",
        "value": "true",
        "valueType": "literal"
      }
    ],
    "logicOperator": "AND",
    "hasElse": false,
    "elseContent": ""
  }
}
```

Error Response:
```json
{
  "success": false,
  "error": "Could not extract condition from conversation"
}
```

## Supported Operators

The system supports the following comparison operators:

| Operator | Symbol | Description |
|----------|--------|-------------|
| equals | `==` | Values are equal |
| not equals | `!=` | Values are not equal |
| greater than | `>` | Left > Right |
| less than | `<` | Left < Right |
| greater or equal | `>=` | Left >= Right |
| less or equal | `<=` | Left <= Right |
| contains | `contains` | String contains substring |
| not contains | `notContains` | String doesn't contain substring |

## Value Types

Clauses can have different value types:

- `"literal"` - Direct value (e.g., "true", "100", "active")
- `"variable"` - Reference to another variable
- `"condition"` - Reference to another condition

## Logic Operators

When multiple clauses exist:

- `"AND"` - All conditions must be true
- `"OR"` - Any condition can be true

## Example Implementation (Node.js/Express)

```javascript
const express = require('express');
const app = express();

// Chat endpoint with streaming
app.post('/api/chat', async (req, res) => {
  const { messages, variables, stream } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Your LLM processing logic here
  const response = await yourLLMService.chat(messages, variables);

  // Stream response word by word
  const words = response.split(' ');
  for (const word of words) {
    res.write(`data: ${JSON.stringify({ content: word + ' ' })}\n\n`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

// Construct endpoint
app.post('/api/construct', async (req, res) => {
  const { conversation, variables } = req.body;

  try {
    // Your LLM analysis logic here
    const extractedCondition = await yourLLMService.extractCondition(
      conversation,
      variables
    );

    res.json({
      success: true,
      condition: extractedCondition
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});
```

## Example Implementation (Python/FastAPI)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

app = FastAPI()

class ChatRequest(BaseModel):
    messages: list
    variables: list
    stream: bool = True

class ConstructRequest(BaseModel):
    conversation: list
    variables: list

@app.post("/api/chat")
async def chat(request: ChatRequest):
    async def generate():
        # Your LLM processing logic here
        response = await your_llm_service.chat(
            request.messages,
            request.variables
        )

        # Stream response
        for word in response.split():
            chunk = json.dumps({"content": word + " "})
            yield f"data: {chunk}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )

@app.post("/api/construct")
async def construct(request: ConstructRequest):
    try:
        # Your LLM analysis logic here
        extracted = await your_llm_service.extract_condition(
            request.conversation,
            request.variables
        )

        return {
            "success": True,
            "condition": extracted
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
```

## System Prompt Template

The frontend automatically sends this system prompt to guide the LLM:

```
You are an intelligent assistant helping users create conditional logic for email templates.

Available variables: [variable list with types]

Your role:
1. Understand what condition the user wants to create using natural language
2. Help extract variable names, operators, and values
3. Guide them through refining the condition
4. Ask clarifying questions when needed

Be conversational, helpful, and guide them naturally. When they describe a condition, acknowledge it clearly and help them build it step by step.
```

## UI Features

### Chat Interface
- **Streaming responses** with word-by-word animation
- **Markdown support** in messages (bold, code blocks, bullet points)
- **Auto-scrolling** to latest message
- **Message counter** showing conversation length
- **Multi-line input** with auto-expanding textarea
- **Keyboard shortcuts** (Enter to send)

### Construct Button
- Located next to the Send button
- **Green gradient** design with lightning icon
- Disabled until at least 1 user message exists
- Shows loading state while processing
- Extracts condition and applies it automatically

### Design System (bolt.new style)
- Clean, minimal white background
- Gray message area with subtle shadows
- Blue gradient for user messages
- White cards with borders for bot messages
- Proper dark mode support
- Professional typography and spacing

## Error Handling

The frontend handles these error scenarios:

1. **Network errors** - Shows user-friendly error message
2. **API errors** - Displays error from API response
3. **Timeout errors** - Automatic retry with exponential backoff
4. **Malformed responses** - Graceful fallback to error state

## Security Considerations

1. **API Key** stored in environment variables (never exposed to client)
2. **HTTPS only** for production deployments
3. **CORS** properly configured on your API
4. **Rate limiting** recommended on API endpoints
5. **Input sanitization** on both frontend and backend

## Testing Your Integration

1. Set environment variables in `.env`
2. Start your LLM microservice
3. Run the app: `npm run dev`
4. Click "Wrap in Condition" in the editor
5. Start chatting with the AI
6. Click "Construct" to extract the condition

## Troubleshooting

**Issue:** Streaming not working
- Verify your API returns `Content-Type: text/event-stream`
- Check SSE format is correct
- Ensure no buffering in reverse proxy (nginx/apache)

**Issue:** Construct returns error
- Verify conversation history is being sent correctly
- Check variable list matches your template
- Ensure response JSON structure matches specification

**Issue:** CORS errors
- Add proper CORS headers on your API
- Include `Access-Control-Allow-Origin` header
- Allow `Authorization` header in CORS config

## Performance Optimization

1. **Connection pooling** for API requests
2. **Response caching** for repeated queries
3. **Request debouncing** for rapid user input
4. **Chunked responses** for large conversations
5. **Lazy loading** of chat history

## Next Steps

1. Implement your LLM microservice endpoints
2. Update `.env` with correct URLs
3. Test with real conversations
4. Monitor API performance
5. Adjust system prompts as needed
6. Add custom error messages
7. Implement logging and analytics

## Support

For issues or questions about the integration, please refer to:
- API documentation for your LLM service
- Frontend code in `src/services/llmService.ts`
- Chat component in `src/components/ChatConditionBuilder.tsx`
