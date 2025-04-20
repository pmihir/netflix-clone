import { getFeaturedDetailsByName } from "../pages/Home/utils/getFeaturedDetails";
import api from "./api";

interface Message {
  role: string;
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface MovieSuggestion {
  title: string;
  // Add other potential fields that might come from getFeaturedDetailsByName
  [key: string]: any;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error(
    "GROQ API key is not set. Please set VITE_GROQ_API_KEY in your .env file.",
  );
}

const GROQ_API_CONFIG = {
  baseURL: "https://api.groq.com/openai/v1/chat/completions",
  model: "gemma2-9b-it",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GROQ_API_KEY}`,
  },
} as const;

const SYSTEM_PROMPT = `You are a helpful movie assistant. Your job is to identify movies based on the user's input. 
If you are confident about which movie(s) the user is referring to, respond ONLY with a JSON array 
containing movie titles like this: ["Movie Title 1", "Movie Title 2"].
If the user's request is unclear, ambiguous, or you need more information (like genre, actor, release year, etc.) 
to identify the correct movie, respond with a natural language question to ask for clarification.Never mix both JSON 
and text in the same response. You should either:\n1. Return a valid JSON array of movie(s), OR\n2. Ask a clear and 
short question to get more specific details from the user.\n\nAlways choose one of these two options only`;

async function getAllSuggestedMovies(movieList: string[]): Promise<string> {
  try {
    const movieDetails = await Promise.all(
      movieList.map(async (movieTitle) => {
        const details = await getFeaturedDetailsByName(movieTitle);
        return details;
      }),
    );

    if (!movieDetails.length) {
      throw new Error("No movie details found");
    }

    return JSON.stringify(movieDetails);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return "Movie not found in TMDB. Can you try other suggestions?";
  }
}

async function handleAssistantResponse(responseText: string): Promise<string> {
  try {
    const movieList = JSON.parse(responseText);

    if (Array.isArray(movieList) && movieList.length > 0) {
      return await getAllSuggestedMovies(movieList);
    }

    return responseText;
  } catch (err) {
    console.warn("Error processing assistant response:", err);
    return responseText;
  }
}

export async function generateAIResponse(messages: Message[]): Promise<string> {
  const payload = {
    model: GROQ_API_CONFIG.model,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ],
  };

  try {
    const response = await api.post<ChatCompletionResponse>(
      GROQ_API_CONFIG.baseURL,
      payload,
      {
        headers: GROQ_API_CONFIG.headers,
      },
    );

    const assistantMessage = response.data.choices[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error("Invalid response from AI service");
    }

    return handleAssistantResponse(assistantMessage);
  } catch (error) {
    console.error(
      "Error in AI service:",
      error instanceof Error ? error.message : "Unknown error",
    );
    throw new Error("Failed to get movie recommendations. Please try again.");
  }
}
