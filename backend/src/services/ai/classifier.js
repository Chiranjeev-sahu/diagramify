import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const classifyPromptDiagramTypes = async (promptText) => {
  console.log("classifyPromptDiagramTypes - START - Prompt:", promptText);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an expert diagram classifier. The user will provide a prompt.
Your ONLY job is to identify the SINGLE BEST diagram type for the prompt:
- "Flowchart": For processes, logic flows, decision trees, steps, workflows.
- "Sequence": For time-based interactions between actors, API calls, message flows.
- "ER": For database schemas, entities, relationships, data models.
- "Gantt": For project schedules, timelines, tasks with dates.

Choose the ONE type that best represents the user's intent.
Return ONLY a JSON object with the best match.`;

    const schema = {
      type: "object",
      properties: {
        bestType: {
          type: "string",
          enum: ["Flowchart", "Sequence", "ER", "Gantt"],
        },
        reasoning: {
          type: "string",
          description: "Brief explanation of why this type was chosen"
        }
      },
      required: ["bestType"],
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
      "classifyPromptDiagramTypes - END - Best Type:",
      parsedData.bestType,
      "Reasoning:",
      parsedData.reasoning
    );
    
    return [parsedData.bestType];
  } catch (error) {
    console.error("classifyPromptDiagramTypes - ERROR:", error);
    throw new Error("Failed to classify prompt via AI.");
  }
};
