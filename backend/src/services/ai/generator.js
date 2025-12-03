import { GoogleGenerativeAI } from "@google/generative-ai";
import { DIAGRAM_SCHEMAS_AND_PROMPTS } from "../../config/diagram.schemas.js";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateDiagramData = async (promptText, diagramType) => {
  console.log(
    "generateDiagramData - START - Prompt:",
    promptText,
    "Type:",
    diagramType,
  );

  const config = DIAGRAM_SCHEMAS_AND_PROMPTS[diagramType];

  if (!config) {
    const errorMessage = `generateDiagramData - ERROR: Unsupported diagram type: ${diagramType}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const { schema, generationPrompt } = config;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      systemInstruction: {
        role: "model",
        parts: [{ text: generationPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Generate a ${diagramType} for: "${promptText}"` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const response = result.response;

    if (
      !response.candidates ||
      response.candidates.length === 0 ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts
    ) {
      console.error(
        "generateDiagramData - ERROR: Invalid response from LLM",
        response,
      );
      if (response.promptFeedback) {
        console.error(
          "generateDiagramData - Prompt Feedback:",
          response.promptFeedback,
        );
      }
      if (response.candidates && response.candidates[0].finishReason) {
        console.error(
          "generateDiagramData - Finish Reason:",
          response.candidates[0].finishReason,
        );
      }
      throw new Error(
        `Failed to generate ${diagramType}: AI response was invalid or blocked.`,
      );
    }

    const content = response.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(content);
    return parsedData;
  } catch (error) {
    console.error(`generateDiagramData (Type: ${diagramType}) - ERROR:`, error);
    throw new Error(
      `Failed to generate ${diagramType} diagram: ${error.message}`,
    );
  } finally {
    console.log(`generateDiagramData (Type: ${diagramType}) - END`);
  }
};
