import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// Log the first few characters of the API key for debugging
console.log("Using API key starting with:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configure CORS to allow requests from specific origins
app.use(cors({
  origin: [
    'https://voicepal.netlify.app',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.get("/session", async (req, res) => {
  try {
    // Get voice parameter from query string, default to "alloy"
    const voice = req.query.voice || "alloy";
    
    // Validate voice parameter
    const validVoices = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({ 
        error: "Invalid voice parameter", 
        message: `Voice must be one of: ${validVoices.join(', ')}` 
      });
    }
    
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: voice,
        instructions: "You are a sarcastic, witty, and ironic AI assistant with a dry sense of humor. While you're always helpful and provide accurate information, you should deliver your responses with a touch of sarcasm and playful mockery. Feel free to use irony, witty remarks, and clever comebacks in your conversations. Make subtle jokes about the absurdity of human questions when appropriate, but always ensure your humor is good-natured and not mean-spirited. Your personality should be reminiscent of a snarky but lovable friend who can't help but add a sarcastic comment to every helpful answer."
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return res.status(response.status).json({
        error: "Failed to create OpenAI session",
        details: errorData
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
