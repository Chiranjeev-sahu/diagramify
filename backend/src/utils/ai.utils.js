import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// --- REFACTORED SCHEMAS AND PROMPTS ---
// Centralized to be used by both generation and parsing
const DIAGRAM_SCHEMAS_AND_PROMPTS = {
  Flowchart: {
    schema: {
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
                enum: ["start", "end", "process", "decision", "inputoutput"],
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
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for a Flowchart diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise flowchart.
                      **IMPORTANT: Do not use 'start', 'end', 'graph', or 'subgraph' as a node 'id', as they are reserved keywords. Use an alternative like 'startNode' or 'endNode' instead.**
                      Only output the JSON.`,
    parsingPrompt: `You are an expert Mermaid.js parser. You will be given Mermaid code for a Flowchart.
                    Your ONLY job is to parse the code and return a JSON object that strictly adheres to the provided schema.
                    - 'graph TD' means Flowchart.
                    - A(Text) or A[Text] maps to {"id": "A", "type": "process", "text": "Text"}.
                    - A((Text)) maps to {"id": "A", "type": "start", "text": "Text"} or {"id": "A", "type": "end", "text": "Text"}.
                    - A{Text} maps to {"id": "A", "type": "decision", "text": "Text"}.
                    - A[/Text/] maps to {"id": "A", "type": "inputoutput", "text": "Text"}.
                    - A --> B maps to {"from": "A", "to": "B"}.
                    - A -- "label" --> B maps to {"from": "A", "to": "B", "label": "label"}.
                    Return ONLY the valid JSON.`,
  },
  Sequence: {
    schema: {
      type: "object",
      properties: {
        diagramType: { type: "string", enum: ["Sequence"] },
        title: { type: "string", nullable: true },
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
      required: ["diagramType", "actors", "messages"],
      propertyOrdering: ["diagramType", "title", "actors", "messages"],
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for a Sequence diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise sequence diagram. Only output the JSON.`,
    parsingPrompt: `You are an expert Mermaid.js parser. You will be given Mermaid code for a Sequence Diagram.
                    Your ONLY job is to parse the code and return a JSON object that strictly adheres to the provided schema.
                    - 'participant A' maps to an item in "actors".
                    - 'title X' maps to {"title": "X"}.
                    - A->>B: msg maps to {"sender": "A", "receiver": "B", "message": "msg", "type": "sync"}.
                    - A->>B: msg maps to {"sender": "A", "receiver": "B", "message": "msg", "type": "async"}.
                    - A-->B: msg maps to {"sender": "A", "receiver": "B", "message": "msg", "type": "reply"}.
                    - A-->>B: msg maps to {"sender": "A", "receiver": "B", "message": "msg", "type": "async_reply"}.
                    Return ONLY the valid JSON.`,
  },
  ER: {
    schema: {
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
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for an ER diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise ER diagram. Only output the JSON.`,
    parsingPrompt: `You are an expert Mermaid.js parser. You will be given Mermaid code for an ER Diagram.
                    Your ONLY job is to parse the code and return a JSON object that strictly adheres to the provided schema.
                    - 'ENTITY {' maps to {"name": "ENTITY", "attributes": [...]}.
                    - 'string name PK' maps to {"type": "string", "name": "name", "key": "PK"}.
                    - 'int id' maps to {"type": "int", "name": "id"}.
                    - A ||--|| B : "label" maps to {"fromEntity": "A", "toEntity": "B", "relationshipType": "one-to-one", "label": "label"}.
                    - A ||--o{ B : "label" maps to {"fromEntity": "A", "toEntity": "B", "relationshipType": "one-to-many", "label": "label"}.
                    - A }o--|| B : "label" maps to {"fromEntity": "A", "toEntity": "B", "relationshipType": "many-to-one", "label": "label"}.
                    - A }o--o{ B : "label" maps to {"fromEntity": "A", "toEntity": "B", "relationshipType": "many-to-many", "label": "label"}.
                    Return ONLY the valid JSON.`,
  },
  Gantt: {
    schema: {
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
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for a Gantt chart based on a user's natural language request. Ensure the output is valid JSON according to the schema. Dates must be in YYYY-MM-DD format. Provide a clear and concise Gantt chart. Only output the JSON.`,
    parsingPrompt: `You are an expert Mermaid.js parser. You will be given Mermaid code for a Gantt Chart.
                    Your ONLY job is to parse the code and return a JSON object that strictly adheres to the provided schema.
                    - 'title X' maps to {"title": "X"}.
                    - 'dateFormat YYYY-MM-DD' maps to {"dateFormat": "YYYY-MM-DD"}.
                    - 'section Name' maps to {"name": "Name", "tasks": [...]}.
                    - 'Task Name :done, 2024-01-01, 2024-01-02' maps to {"name": "Task Name", "status": "done", "start": "2024-01-01", "end": "2024-01-02"}.
                    - 'Task Name : 2024-01-01, 2024-01-02' maps to {"name": "Task Name", "start": "2024-01-01", "end": "2024-01-02"}.
                    Return ONLY the valid JSON.`,
  },
};

// --- CLASSIFIER FUNCTION (Unchanged) ---
export const classifyPromptDiagramTypes = async (promptText) => {
  console.log("classifyPromptDiagramTypes - START - Prompt:", promptText);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an expert diagram classifier. The user will provide a prompt.
Your ONLY job is to identify which of the following diagram types are relevant to the prompt:
- "Flowchart": For processes, logic flows, steps.
- "Sequence": For time-based interactions between actors.
- "ER": For database schemas, entities, and relationships.
- "Gantt": For project schedules, tasks, and dates.
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
    console.log(JSON.stringify(response, null, 2));
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
    return parsedData.relevantTypes;
  } catch (error) {
    console.error("classifyPromptDiagramTypes - ERROR:", error);
    throw new Error("Failed to classify prompt via AI.");
  }
};

// --- GENERATION FUNCTION (Refactored) ---
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

// --- NEW FUNCTION (Code-to-JSON Parser) ---
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

// --- REPROMPT/MANIPULATION FUNCTIONS (Unchanged) ---
export const interpretPromptToInstruction = async (naturalLanguagePrompt,currentDiagramData,) => {
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
  structuredInstruction,
) => {
  console.log("manipulateDiagramData - START");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using 1.5-flash
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
        // Use the dynamically selected schema, not the old generic one
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
