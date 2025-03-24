# Nicanor - Multilingual AI Assistant with Neon Robot Face

Nicanor is an interactive web application that combines OpenAI's real-time voice API with a dynamic, animated neon robot face. The robot's expressions and mouth movements react to the AI's speech, creating an immersive and entertaining conversation experience in multiple languages.

![Voice Pal Demo](demo-screenshot.png)

## Features

- **Interactive Neon Robot Face**: A digital robot with glowing neon eyes and mouth that reacts to AI speech
- **Multiple Voice Options**: Choose from 8 different AI voices, each with its own personality
- **Multilingual Support**: Communicate in 12 different languages including English, Spanish, German, French, Italian, Romanian, Russian, Ukrainian, Portuguese, Polish, Chinese, and Japanese
- **Customizable AI Personality**: Choose from 5 different moods (Sarcastic, Excited, Philosophical, Dramatic, Deadpan)
- **Adjustable Emotional Range**: Select from 5 emotional styles (Balanced, Expressive, Subtle, Volatile, Stoic)
- **Fullscreen Experience**: Interface transforms to fullscreen when conversation starts
- **Dynamic Expressions**: Robot shows different emotions based on AI speech patterns

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, p5.js (for animations)
- **Backend**: Node.js, Express
- **APIs**: OpenAI GPT-4o Realtime API
- **Audio Processing**: Web Audio API for real-time audio analysis

## Prerequisites

- Node.js (v14 or higher)
- OpenAI API key with access to GPT-4o Realtime

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/vital1188/voice-pal-app.git
   cd voice-pal-app
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Running the App

1. Start the server:
   ```
   cd server
   node index.js
   ```
   The server will run at http://localhost:3000

2. In a new terminal, start the client:
   ```
   cd client
   npx live-server
   ```
   The client will be available at http://localhost:8080 (or similar)

## How to Use

1. Open the client URL in your browser
2. Select your preferred AI voice from the dropdown
3. Choose your desired AI mood and emotional range
4. Select your preferred language from the 12 available options
5. Adjust sociability, voice tone, speech rate, and memory strength using the sliders
6. Click the diamond-shaped button to connect
7. Allow microphone access when prompted
8. Start speaking with Nicanor in your selected language
9. Watch the robot's face animate as the AI responds:
   - Eyes follow your mouse movements
   - Mouth opens and closes with the AI's speech
   - Face shows different expressions based on speech patterns
10. Try clicking on the robot's eyes or mouth to trigger different expressions
11. Click the X button to end the conversation

## Robot Face Interactions

- **Left Eye**: Click to make the robot enter "thinking" mode
- **Right Eye**: Click to make the robot look surprised
- **Mouth**: Click to make the robot smile
- **Mouse Movement**: Eyes follow your cursor

## Voice Options

- **Alloy**: Neutral, balanced voice (default)
- **Echo**: Male voice with a stern tone
- **Shimmer**: Female voice with a pleasant tone
- **Ash**: Neutral voice with a calm demeanor
- **Ballad**: Neutral voice with a melodic quality
- **Coral**: Neutral voice with a warm tone
- **Sage**: Neutral voice with a wise character
- **Verse**: Neutral voice with a poetic style

## Language Options

Nicanor supports 12 languages, allowing you to have conversations in:

- English
- Spanish (Español)
- German (Deutsch)
- French (Français)
- Italian (Italiano)
- Romanian (Română)
- Russian (Русский)
- Ukrainian (Українська)
- Portuguese (Português)
- Polish (Polski)
- Chinese (中文)
- Japanese (日本語)

When you select a language, Nicanor will immediately respond in that language and use appropriate expressions and idioms native to that language.

## Project Structure

- `/client`: Frontend code
  - `index.html`: Main HTML file
  - `app.js`: Core application logic
  - `animations.js`: Robot animations and visual effects
  - `p5-background.js`: Robot face implementation using p5.js
- `/server`: Backend code
  - `index.js`: Express server for OpenAI API communication
  - `.env`: Environment variables (API keys)

## License

MIT

## Acknowledgements

- [OpenAI](https://openai.com/) for the GPT-4o Realtime API
- [p5.js](https://p5js.org/) for the animation library
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for audio processing
