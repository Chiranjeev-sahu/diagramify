import { GoogleGenerativeAI } from "@google/generative-ai";
import { DIAGRAM_SCHEMAS_AND_PROMPTS } from "../../config/diagram.schemas.js";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);


export const interpretPromptToInstruction = async (
  naturalLanguagePrompt,
  currentDiagramData
) => {
  console.log("interpretPromptToInstruction - START");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const systemPrompt = `You are an AI assistant designed to convert a user's natural language request for diagram modification into a structured JSON instruction.
                          The current diagram data is provided to help resolve references (e.g., node names to IDs).
                          Output only a JSON object following these rules:
                          - If changing text: {"action": "update_element", "element_id": "resolved_id", "updates": {"text": "new_text"}}
                          - If adding an element: {"action": "add_element", "new_element": {"type": "type", "text": "text"}, "connections": [{"from": "existing_id", "to": "new_id", "label": "label?"}]}
                          - If removing an element: {"action": "remove_element", "element_id": "resolved_id"}
                          - Be precise. If an element cannot be resolved from currentDiagramData, throw an error.
                          Current Diagram Data:
                          \`\`\`json
                          ${JSON.stringify(currentDiagramData, null, 2)}
                          \`\`\`
                          Return ONLY the JSON instruction.`;

    const userPrompt = `User's Request: "${naturalLanguagePrompt}"`;
    const result = await model.generateContent({
      systemInstruction: {
        role: "model",
        parts: [{ text: systemPrompt }],
      },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["update_element", "add_element", "remove_element"],
            },
            element_id: { type: "string", nullable: true },
            updates: {
              type: "object",
              properties: { text: { type: "string" } },
              required: ["text"],
              nullable: true,
            },
            new_element: {
              type: "object",
              properties: {
                type: { type: "string" },
                text: { type: "string" },
              },
              required: ["type", "text"],
              nullable: true,
            },
            connections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string" },
                  to: { type: "string" },
                  label: { type: "string", nullable: true },
                },
                required: ["from", "to"],
              },
              nullable: true,
            },
          },
          required: ["action"],
          propertyOrdering: [
            "action",
            "element_id",
            "updates",
            "new_element",
            "connections",
          ],
        },
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
        "interpretPromptToInstruction - ERROR: Invalid response from LLM",
        response,
      );
      throw new Error("Invalid response from AI: No content returned.");
    }
    
    const content = response.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(content);
    return parsedData;
  } catch (error) {
    console.error("interpretPromptToInstruction - ERROR:", error);
    throw new Error("Failed to interpret user's request via AI.");
  } finally {
    console.log("interpretPromptToInstruction - END");
  }
};


export const manipulateDiagramData = async (
  currentDiagramData,
  structuredInstruction
) => {
  console.log("manipulateDiagramData - START");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const systemPrompt = `You are an AI assistant designed to strictly modify diagram data (JSON) based on a structured JSON instruction.
                          Do not interpret natural language. Apply the changes precisely to the current_diagram_data.
                          Output only the modified diagram data JSON. Ensure the output is valid JSON.
                          Schema for diagramData elements (e.g., Flowchart):
                          - "elements": [{"id": "string", "type": "start|end|process|decision|...", "text": "string"}]
                          - "connections": [{"from": "string", "to": "string", "label": "string?"}]
                          - Element IDs must be unique. If adding, generate a new unique ID (e.g., 'el_123').
                          Return ONLY the modified Diagram Data JSON.`;

    const userPrompt = `Current Diagram Data:
                        \`\`\`json
                        ${JSON.stringify(currentDiagramData, null, 2)}
                        \`\`\`
                        Structured Instruction:
                        \`\`\`json
                        ${JSON.stringify(structuredInstruction, null, 2)}
                        \`\`\``;

    const diagramType = currentDiagramData.diagramType;
    const config = DIAGRAM_SCHEMAS_AND_PROMPTS[diagramType];

    if (!config || !config.schema) {
      const errorMessage = `manipulateDiagramData - ERROR: No schema found for diagram type: ${diagramType}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const selectedSchema = config.schema;

    const result = await model.generateContent({
      systemInstruction: {
        role: "model",
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: selectedSchema,
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
        "manipulateDiagramData - ERROR: Invalid response from LLM",
        response,
      );
      throw new Error("Invalid response from AI: No content returned.");
    }
    
    const content = response.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(content);
    return parsedData;
  } catch (error) {
    console.error("manipulateDiagramData - ERROR:", error);
    throw new Error("Failed to modify diagram data using AI.");
  } finally {
    console.log("manipulateDiagramData - END");
  }
};
