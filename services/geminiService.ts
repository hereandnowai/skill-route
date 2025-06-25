
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LearningPathInput, GeminiLearningPathResponse } from '../types';
import { GEMINI_API_KEY_PLACEHOLDER_ERROR, GEMINI_MODEL_TEXT } from '../constants';

// Initialize the GoogleGenAI client strictly with process.env.API_KEY.
// As per guidelines, assume process.env.API_KEY is pre-configured and accessible.
// If process.env.API_KEY is undefined, the SDK constructor or subsequent calls should handle this.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonFromMarkdown = (text: string): any => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim(); // Extract content within fences
  }
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini, raw text:", text, "Error:", e);
    // Return a structured error that matches GeminiLearningPathResponse
    return { 
        error: `Failed to parse AI response. Raw text might be incomplete or not valid JSON. Preview: ${text.substring(0,300)}`,
        pathTitle: "Error: AI Response Parsing Failed",
        phases: [] 
    };
  }
};


export const generateLearningPath = async (input: LearningPathInput): Promise<GeminiLearningPathResponse> => {
  // Check if the API key from the environment is available.
  if (!process.env.API_KEY) {
    console.error(GEMINI_API_KEY_PLACEHOLDER_ERROR);
    return { 
      error: GEMINI_API_KEY_PLACEHOLDER_ERROR + " Please ensure the API_KEY environment variable is set.",
      pathTitle: "Error: API Key Missing",
      phases: [] 
    };
  }

  let resumeSection = "";
  if (input.resumeText && input.resumeText.trim() !== "") {
    resumeSection = `
User's Resume Information (for additional context on existing skills and experience):
---
${input.resumeText.substring(0, 4000)} ${input.resumeText.length > 4000 ? "\n[Resume truncated for brevity]" : ""} 
---
When analyzing current skills, consider the information from this resume.
`;
  }

  const prompt = `
You are an expert career coach and learning path designer.
Given the user's current skills, target role, performance summary, and optionally their resume text, generate a personalized learning path.

User Input:
Current Skills/Role: ${input.currentSkills}
Target Role/Goal: ${input.targetGoal}
Performance Summary/Struggles: ${input.performanceSummary}
${resumeSection}

Output Requirements:
Provide a step-by-step learning path.
The path should be broken down into logical phases (e.g., "Month 1: Foundations", "Month 2: Core Skills", "Month 3: Advanced Topics & Projects").
Each phase should have a "phaseTitle".
Each phase should contain an array of "steps".
Each step must include:
1.  "id": A unique string identifier for the step (e.g., "python_fundamentals_week1_2"). Use underscores and keep it concise.
2.  "title": A concise title (e.g., "Master Python Fundamentals").
3.  "description": A brief description of the step's objective and what to learn (2-3 sentences).
4.  "resources": An array of strings, listing recommended resources (e.g., "Online Course: Coursera's Python for Everybody", "Book: 'Automate the Boring Stuff with Python'", "Tool: Jupyter Notebooks", "Project Idea: Build a simple web scraper"). Be specific with resource names if possible, otherwise suggest types of resources. Include a mix of resource types.
5.  "duration": An estimated duration or timeframe (e.g., "Weeks 1-2", "15 days", "Approx. 20 hours").

The skills should build upon each other logically.
Identify key skill gaps based on ALL provided input (including resume if available) and prioritize them in the path.
The "pathTitle" should be engaging and reflect the user's target goal.

Return ONLY the JSON object as specified below, without any surrounding text or markdown.

JSON Output Structure:
{
  "pathTitle": "Personalized Learning Path to Become a ${input.targetGoal}",
  "phases": [
    {
      "phaseTitle": "Phase 1: Example Phase Title (e.g., Days 1-30: Foundational Skills)",
      "steps": [
        {
          "id": "example_step_id_1",
          "title": "Example Step Title",
          "description": "Example step description focusing on core concepts.",
          "resources": ["Example Resource 1 (e.g., Specific Online Course)", "Book: Example Book Title", "Official Documentation: Relevant Technology"],
          "duration": "Example Duration (e.g., Weeks 1-2)"
        }
      ]
    }
    // Add more phases and steps as needed. Aim for 2-4 phases.
  ]
}

If the user's input (excluding resume, which is optional) is too vague or doesn't provide enough information in 'currentSkills' and 'targetGoal' to create a meaningful path, respond with this JSON object:
{
  "error": "Insufficient information provided. Please provide more details about your current skills and target role to generate a path.",
  "pathTitle": "Error Creating Path",
  "phases": []
}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5, // Slightly lower for more deterministic structured output
        topP: 0.9,
        topK: 30,
      }
    });

    const responseText = response.text;
    const parsedData = parseJsonFromMarkdown(responseText) as GeminiLearningPathResponse;
    
    if (parsedData.error && !parsedData.phases?.length) { // Check if it's primarily an error response
        console.warn("Gemini returned an error or insufficient data message in the JSON payload:", parsedData.error);
        // This is an error object from Gemini or our parser, propagate it.
        return parsedData; 
    }
    
    // Validate core structure even if no explicit error field from Gemini
    if (!parsedData.phases || !Array.isArray(parsedData.phases) || !parsedData.pathTitle) {
        console.error("Gemini response missing 'phases' array, 'pathTitle', or is malformed.", parsedData);
        return { 
            error: "AI response was not in the expected format (e.g., missing phases or path title).", 
            pathTitle: "Error: Malformed AI Response", 
            phases: [] 
        };
    }

    return parsedData;

  } catch (error) {
    console.error('Error generating learning path with Gemini:', error);
    let errorMessage = "An unknown error occurred while generating the learning path.";
    if (error instanceof Error) {
        errorMessage = error.message;
        // Check if the error message indicates an API key issue from the SDK
        if (errorMessage.toLowerCase().includes("api key") || 
            errorMessage.toLowerCase().includes("permission denied") ||
            errorMessage.toLowerCase().includes("authentication")) {
             errorMessage = `Gemini API Key is invalid, missing, or lacks permissions: ${errorMessage}. Please verify the API_KEY environment variable and API console settings.`;
        }
    }
    return { 
        error: `AI API Error: ${errorMessage}`,
        pathTitle: "Error: AI Service Failure",
        phases: [] 
    };
  }
};

export const getAIAssistanceResponse = async (userQuery: string, learningContext?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error(GEMINI_API_KEY_PLACEHOLDER_ERROR);
    return "AI Assistant is unavailable. API Key is not configured.";
  }

  let contextInstruction = "";
  if (learningContext) {
    contextInstruction = `The user is currently focused on a learning path titled "${learningContext}". Please tailor your assistance to this context if the query seems related. If the query is general, answer it generally.`;
  }

  const prompt = `
You are a friendly and encouraging AI Learning Assistant.
${contextInstruction}

User's query: "${userQuery}"

Your task:
1. Understand the user's query.
2. Provide a concise, helpful, and clear response.
3. If the query is about a concept, explain it simply.
4. If the query asks for resources, suggest 1-2 specific and relevant examples or types of resources.
5. If the query is vague, gently ask for clarification.
6. Maintain a supportive and positive tone.
7. Do not refer to yourself as a large language model or AI. Act as a personal tutor.
8. Keep your response focused. Avoid overly long answers. Aim for 1-3 paragraphs.
   Format your response as plain text.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error getting AI assistance response from Gemini:', error);
    let errorMessage = "Sorry, I encountered an issue while processing your request.";
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("api key")) {
        errorMessage = "AI Assistant is temporarily unavailable due to an API configuration issue.";
      }
    }
    return errorMessage;
  }
};
