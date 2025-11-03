import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// CLASSIFIER FUNCTION

export const classifyPromptDiagramTypes = async (promptText) => {
  console.log("classifyPromptDiagramTypes - START - Prompt:", promptText);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an expert diagram classifier. The user will provide a prompt.
Your ONLY job is to identify which of the following diagram types are relevant to the prompt:
- "Flowchart": For processes, logic flows, steps.
- "Sequence": For time-based interactions between actors.
- "ER": For database schemas, entities, and relationships.
- "Gantt": For project schedules, tasks, and dates.

Example: "a user logs in" is relevant to "Flowchart" and "Sequence".
Example: "a user has posts" is relevant to "ER".
Example: "a project plan" is relevant to "Gantt".
Example: "a happy dog" is not relevant to any.

Return ONLY a JSON object matching the schema.`;

    const schema = {
      type: "object",
      properties: {
        relevantTypes: {
          type: "array",
          items: {
            type: "string",
            enum: ["Flowchart", "Sequence", "ER", "Gantt"],
          },
        },
      },
      required: ["relevantTypes"],
    };

    const result = await model.generateContent({
      systemInstruction: {
        role: "model",
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
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
        "classifyPromptDiagramTypes - ERROR: Invalid response from LLM",
        response,
      );
      throw new Error("Invalid response from AI classifier.");
    }

    const content = response.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(content);
    console.log(
      "classifyPromptDiagramTypes - END - Relevant Types:",
      parsedData.relevantTypes,
    );
    return parsedData.relevantTypes; // e.g., ["Flowchart", "ER"]
  } catch (error) {
    console.error("classifyPromptDiagramTypes - ERROR:", error);
    throw new Error("Failed to classify prompt via AI.");
  }
};

// --- (Your existing `generateDiagramData` function goes here) ---
// (This function is unchanged from our previous fix)
export const generateDiagramData = async (promptText, diagramType) => {
  console.log(
    "generateDiagramData - START - Prompt:",
    promptText,
    "Type:",
    diagramType,
  );
  let schema;
  let systemPrompt;

  try {
    switch (diagramType) {
      case "Flowchart":
        schema = {
          type: "object",
          properties: {
            diagramType: { type: "string", enum: ["Flowchart"] },
            elements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: {
                    type: "string",
                    enum: [
                      "start",
                      "end",
                      "process",
                      "decision",
                      "inputoutput",
                    ],
                  },
                  text: { type: "string" },
                },
                required: ["id", "type", "text"],
              },
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
            },
          },
          required: ["diagramType", "elements", "connections"],
          propertyOrdering: ["diagramType", "elements", "connections"],
        };
        systemPrompt = `You are an AI assistant that generates structured JSON data for a Flowchart diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise flowchart. Only output the JSON.`;
        break;
      case "Sequence":
        schema = {
          type: "object",
          properties: {
            diagramType: { type: "string", enum: ["Sequence"] },
            title: { type: "string" },
            actors: {
              type: "array",
              items: { type: "string" },
            },
            messages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sender: { type: "string" },
                  receiver: { type: "string" },
                  message: { type: "string" },
                  type: {
                    type: "string",
                    enum: ["sync", "async", "reply", "async_reply"],
                  },
                },
                required: ["sender", "receiver", "message", "type"],
              },
            },
          },
          required: ["diagramType", "title", "actors", "messages"],
          propertyOrdering: ["diagramType", "title", "actors", "messages"],
        };
        systemPrompt = `You are an AI assistant that generates structured JSON data for a Sequence diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise sequence diagram. Only output the JSON.`;
        break;
      case "ER":
        schema = {
          type: "object",
          properties: {
            diagramType: { type: "string", enum: ["ER"] },
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  attributes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: { type: "string" },
                        key: {
                          type: "string",
                          enum: ["PK", "FK"],
                          nullable: true,
                        },
                      },
                      required: ["name", "type"],
                    },
                  },
                },
                required: ["name", "attributes"],
              },
            },
            relationships: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  fromEntity: { type: "string" },
                  toEntity: { type: "string" },
                  relationshipType: {
                    type: "string",
                    enum: [
                      "one-to-one",
                      "one-to-many",
                      "many-to-one",
                      "many-to-many",
                    ],
                  },
                  label: { type: "string", nullable: true },
                },
                required: ["fromEntity", "toEntity", "relationshipType"],
              },
            },
          },
          required: ["diagramType", "entities", "relationships"],
          propertyOrdering: ["diagramType", "entities", "relationships"],
        };
        systemPrompt = `You are an AI assistant that generates structured JSON data for an ER diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise ER diagram. Only output the JSON.`;
        break;
      case "Gantt":
        schema = {
          type: "object",
          properties: {
            diagramType: { type: "string", enum: ["Gantt"] },
            title: { type: "string" },
            dateFormat: {
              type: "string",
              description: "Date format string, e.g., 'YYYY-MM-DD'",
            },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        start: {
                          type: "string",
                          description: "Task start date in YYYY-MM-DD format",
                        },
                        end: {
                          type: "string",
                          description: "Task end date in YYYY-MM-DD format",
                        },
                        id: { type: "string", nullable: true },
                        status: {
                          type: "string",
                          enum: ["active", "done", "crit", "pending"],
                          nullable: true,
                        },
                      },
                      required: ["name", "start", "end"],
                    },
                  },
                },
                required: ["name", "tasks"],
              },
            },
          },
          required: ["diagramType", "title", "dateFormat", "sections"],
          propertyOrdering: ["diagramType", "title", "dateFormat", "sections"],
        };
        systemPrompt = `You are an AI assistant that generates structured JSON data for a Gantt chart based on a user's natural language request. Ensure the output is valid JSON according to the schema. Dates must be in YYYY-MM-DD format. Provide a clear and concise Gantt chart. Only output the JSON.`;
        break;
      default:
        const errorMessage = `generateDiagramData - ERROR: Unsupported diagram type: ${diagramType}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      systemInstruction: {
        role: "model",
        parts: [{ text: systemPrompt }],
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
    // Re-throw the error so Promise.allSettled can catch it as 'rejected'
    throw new Error(
      `Failed to generate ${diagramType} diagram: ${error.message}`,
    );
  } finally {
    console.log(`generateDiagramData (Type: ${diagramType}) - END`);
  }
};

// --- (Your existing `interpretPromptToInstruction` and `manipulateDiagramData` functions go here) ---
// (No changes are needed for them)
export const interpretPromptToInstruction = async (
  naturalLanguagePrompt,
  currentDiagramData,
) => {
  console.log("interpretPromptToInstruction - START");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
      !response.candidates.length === 0 ||
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
  structuredInstruction,
) => {
  console.log("manipulateDiagramData - START");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    // This is a generic schema just to ensure the output is a valid diagram.
    const outputSchema = {
      type: "object",
      properties: {
        diagramType: { type: "string" },
      },
      required: ["diagramType"],
    };

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
        responseSchema: outputSchema,
      },
    });

    const response = result.response;
    if (
      !response.candidates ||
      !response.candidates.length === 0 ||
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
