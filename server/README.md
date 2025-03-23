# Voice Pal Server

This is the backend server for the Voice Pal application. It handles communication with the OpenAI API to create real-time voice sessions.

## Prerequisites

- Node.js (v18 or higher)
- OpenAI API key with access to GPT-4o Realtime

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

The server will run at http://localhost:3000 with hot reloading enabled.

## Deployment

### Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Select the `/server` directory as the root directory
4. Set the build command to `npm install`
5. Set the start command to `npm start`
6. Add the environment variable `OPENAI_API_KEY`
7. Deploy the service

### Heroku

1. Create a new app on [Heroku](https://heroku.com)
2. Connect your GitHub repository
3. Set the root directory to `/server`
4. Add the environment variable `OPENAI_API_KEY` in the settings
5. Deploy the app

### Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set the root directory to `/server`
4. Add the environment variable `OPENAI_API_KEY`
5. Deploy the project

## API Endpoints

### GET /session

Creates a new OpenAI real-time voice session.

**Query Parameters:**
- `voice` (optional): The voice to use for the AI. Default is "alloy".
  - Valid values: "alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"

**Response:**
```json
{
  "id": "sess_abc123",
  "object": "realtime.session",
  "client_secret": {
    "value": "ek_123abc",
    "expires_at": 1742762872
  },
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "voice": "alloy"
}
```

## CORS Configuration

The server is configured to allow requests from any origin. If you want to restrict this, modify the CORS configuration in `index.js`.
