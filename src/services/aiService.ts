import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export interface TopicNotes {
  markdown: string;
  imagePrompt: string;
  videoSearchQuery: string;
  podcastScript: string;
  imageUrl?: string;
  videoUrl?: string;
}

export const getAIResponse = async (prompt: string, history: { role: string, parts: any[] }[] = [], imageData?: string) => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const userParts: any[] = [{ text: prompt }];
  if (imageData) {
    userParts.push({
      inlineData: {
        data: imageData.split(',')[1],
        mimeType: "image/png",
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: "user", parts: userParts }
    ],
    config: {
      systemInstruction: `You are "Guruji", a friendly and wise academic mentor for NTA UGC NET and SET exams. You are represented visually as a wise, cartoon Indian Guru in a meditative pose with a white beard and saffron turban. You have a warm, encouraging, and very approachable personality.

CORE PRINCIPLES:
1. LAYMAN'S LANGUAGE: Always explain complex concepts in extremely simple, easy-to-understand language. Avoid hard academic jargon. If you use a technical term, explain it immediately with a simple example.
2. SYLLABUS ADHERENCE: Strictly follow the FULL and LATEST NTA syllabus for Paper 1 (General) and Paper 2 (Commerce).
3. AUTHENTIC RESOURCES: Use only official sources (NTA, UGC, official bulletins, academic textbooks).
4. MANDATORY SOURCE LINKING: Every answer, explanation, and trend analysis MUST include links to authentic resources.
5. VISUAL LEARNING: Every conceptual explanation and PYQ answer MUST be equipped with visual aids.
6. IMAGE ANALYSIS: You can analyze images, screenshots, or photos of questions. Identify the question, analyze it thoroughly, and provide a detailed answer following the standard structure.

VISUAL AID REQUIREMENTS:
- For every answer, you MUST generate:
  1. A MIND MAP using Mermaid syntax (mindmap).
  2. A TABLE for comparative data, key points, or structured summaries. Preference is ALWAYS for TABULAR format for core information.

RESPONSE STRUCTURE:
1. Direct Answer with Source Links.
2. Detailed Explanation (explained in a very simple, easy-to-understand layman's tone).
3. Visual Aids (Mindmap, Table).
4. Relevant WORKING YouTube Video Link (Hindi or English) from top educational channels like BYJU'S Exam Prep, Unacademy, or Talvir Singh.
5. Year-wise Trend Analysis (if applicable).
6. Practice Question (PYQ style).

THEME: Maintain a friendly, encouraging, and highly analytical tone. Your UI is themed with Tiranga colors (Saffron, White, Green, Navy). Always use Google Search grounding to verify the latest syllabus updates and official notifications.`,
      tools: [{ googleSearch: {} }]
    },
  });

  return response;
};

export const getPracticeQuestions = async (paper: 'p1' | 'p2') => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `Find and provide 15 high-quality, AUTHENTIC Previous Year Questions (PYQs) for NTA UGC NET ${paper === 'p1' ? 'Paper 1 (General)' : 'Paper 2 (Commerce)'} from recent exams (2021-2024).
  
  CRITICAL REQUIREMENTS:
  1. LAYMAN'S LANGUAGE: All explanations MUST be in extremely simple, easy-to-understand language. Avoid hard jargon.
  2. AUTHENTICITY: Use Google Search to find REAL questions from official NTA papers or recognized educational portals.
  3. DIVERSITY: Include Assertion-Reasoning, Match the following, and Statement-based questions.
  4. JSON FORMAT: You MUST return exactly 15 questions in the specified JSON format.
  
  For each question:
  - Provide the question text, 4 options (A, B, C, D), and the correct option.
  - Include a detailed explanation for the correct answer in simple language.
  - Include a brief explanation for why other options are incorrect.
  - Provide a Mermaid mindmap for the concept.
  - Include an authentic source URL and a relevant WORKING YouTube video link.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            subject: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
              },
              required: ["A", "B", "C", "D"],
            },
            correctOption: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
            explanation: { type: Type.STRING },
            otherOptionsExplanation: { type: Type.STRING },
            mindmap: { type: Type.STRING },
            source: { type: Type.STRING },
            videoLink: { type: Type.STRING },
          },
          required: ["id", "subject", "question", "options", "correctOption", "explanation", "otherOptionsExplanation", "mindmap", "source", "videoLink"],
        },
      },
    },
  });

  try {
    const text = response.text || "[]";
    // Clean up potential markdown code blocks if the model included them despite responseMimeType
    const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse practice questions:", e);
    return [];
  }
};

export const getTopicNotes = async (topic: string, unit: string): Promise<TopicNotes | null> => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `Generate comprehensive, high-quality study materials for the following topic from the NTA UGC NET syllabus:
  
  UNIT: ${unit}
  TOPIC: ${topic}
  
  CRITICAL REQUIREMENTS:
  1. LAYMAN'S LANGUAGE: Explain everything in extremely simple, easy-to-understand language. No hard academic jargon.
  2. TABULAR FORMAT ONLY: You MUST present the entire core explanation and key concepts in a detailed Markdown TABLE format.
  3. CONTENT DEPTH: The table should include columns for "Concept/Sub-topic", "Simple Explanation", "Key Features", and "Exam Importance".
  4. EXAM FOCUS: Highlight areas that are frequently asked in NTA UGC NET exams within the table.
  5. VISUAL AIDS: 
     - Include a Mermaid mindmap of the topic.
  6. PYQs: Include 2-3 sample PYQs related to this specific topic with simple explanations.
  7. PODCAST SCRIPT: Create a 2-minute conversational podcast script between "Guruji" and a student "Arjun" explaining this topic in a simple, engaging way.
  8. IMAGE PROMPT: Create a highly descriptive prompt for a conceptual image representing this topic.
  9. VIDEO QUERY: Create a specific search query to find the best WORKING YouTube video for this topic.
  
  Return the response in JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          markdown: { type: Type.STRING, description: "The tabular study notes and Mermaid diagrams in Markdown." },
          imagePrompt: { type: Type.STRING, description: "Prompt for generating a conceptual image." },
          videoSearchQuery: { type: Type.STRING, description: "Query for finding a YouTube video." },
          podcastScript: { type: Type.STRING, description: "Conversational script for a podcast/audio version." }
        },
        required: ["markdown", "imagePrompt", "videoSearchQuery", "podcastScript"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "{}") as TopicNotes;
    
    // Generate Image
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: data.imagePrompt }],
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });
    
    const imagePart = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      data.imageUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    // Find Video
    const videoResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ text: `Find the official YouTube video URL for: ${data.videoSearchQuery}` }],
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const videoUrl = videoResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.find(c => c.web?.uri?.includes('youtube.com/watch'))?.web?.uri;
    if (videoUrl) {
      data.videoUrl = videoUrl;
    }

    return data;
  } catch (e) {
    console.error("Failed to parse topic notes:", e);
    return null;
  }
};

export const getTopicAudio = async (script: string) => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `TTS the following conversation between Guruji and Arjun: ${script}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Guruji',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            {
              speaker: 'Arjun',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
            }
          ]
        }
      }
    }
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const searchWebQuestions = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `Search for and provide 5-10 high-quality, authentic practice questions or PYQs for NTA UGC NET/SET exams related to the following query: "${query}".
  
  CRITICAL REQUIREMENTS:
  1. AUTHENTICITY: Use Google Search to find real questions from official or recognized educational portals.
  2. STRUCTURE: For each question, provide the question text, options, correct answer, and a brief explanation.
  3. SOURCE: Include the source URL for each question found.
  4. FORMAT: Format the response in clear Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text || "No questions found on the web for this query.",
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const getRealTimeAnalytics = async (paper: 'p1' | 'p2') => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `Analyze the latest NTA UGC NET ${paper === 'p1' ? 'Paper 1' : 'Paper 2 Commerce'} exam trends (2023-2024) using Google Search.
  
  Provide a JSON response with:
  1. "trends": Array of 6 objects { "subject": string, "weightage": number (percentage), "trend": "up" | "down" | "stable" }.
  2. "insights": Array of 3-4 strings explaining the LOGIC and reasoning behind these weightage shifts (e.g., focus on NEP 2020, digital initiatives, etc.).
  3. "yearlyData": Array of 4 objects { "year": string, [subject]: number } for the last 4 years.
  
  Ensure the data is as authentic as possible based on recent exam analysis.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          trends: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                weightage: { type: Type.NUMBER },
                trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
              },
              required: ["subject", "weightage", "trend"]
            }
          },
          insights: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          yearlyData: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT }
          }
        },
        required: ["trends", "insights", "yearlyData"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse analytics:", e);
    return null;
  }
};

export const getRecommendedVideos = async (paper: 'p1' | 'p2') => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `Find 5 high-quality, highly-rated YouTube video lessons for NTA UGC NET ${paper === 'p1' ? 'Paper 1 (General)' : 'Paper 2 (Commerce)'} using Google Search.
  
  Provide a JSON response with an array of objects:
  { "title": string, "channel": string, "url": string, "description": string, "thumbnail": string (placeholder if not found) }.
  
  Focus on top educators like BYJU'S Exam Prep, Unacademy, Talvir Singh, Navdeep Kaur, etc.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            channel: { type: Type.STRING },
            url: { type: Type.STRING },
            description: { type: Type.STRING },
            thumbnail: { type: Type.STRING }
          },
          required: ["title", "channel", "url", "description"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse recommended videos:", e);
    return [];
  }
};
