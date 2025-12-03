import { GoogleGenerativeAI } from "@google/generative-ai";
import { DIAGRAM_SCHEMAS_AND_PROMPTS } from "../../config/diagram.schemas.js";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const parseMermaidToJSON = async (mermaidCode, diagramType) => {
  console.log(`parseMermaidToJSON - START - Type: ${diagramType}`, mermaidCode);

  const config = DIAGRAM_SCHEMAS_AND_PROMPTS[diagramType];
  if (!config) {
    const errorMessage = `parseMermaidToJSON - ERROR: Unsupported diagram type: ${diagramType}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const { schema, parsingPrompt } = config;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      systemInstruction: {
        role: "model",
        parts: [{ text: parsingPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: mermaidCode }],
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
      !response.candidates[0].content ||
      !response.candidates[0].content.parts
    ) {
      console.error(
        `parseMermaidToJSON - ERROR: Invalid response from LLM for ${diagramType}`,
        response,
      );
      throw new Error("Invalid response from AI parser.");
    }

    const content = response.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(content);
    console.log(`parseMermaidToJSON - END - Parsed Data:`, parsedData);
    return parsedData;
  } catch (error) {
    console.error(`parseMermaidToJSON (Type: ${diagramType}) - ERROR:`, error);
    throw new Error(
      `Failed to parse ${diagramType} code via AI: ${error.message}`,
    );
  }
};
