export const DIAGRAM_SCHEMAS_AND_PROMPTS = {
  Flowchart: {
    schema: {
      type: "object",
      properties: {
        diagramType: { type: "string", enum: ["Flowchart"] },
        title: { type: "string", description: "A short, descriptive title for the diagram" },
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
      required: ["diagramType", "title", "elements", "connections"],
      propertyOrdering: ["diagramType", "title", "elements", "connections"],
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for a Flowchart diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise flowchart with a descriptive title.
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
        title: { type: "string", description: "A short, descriptive title for the diagram" },
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
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for a Sequence diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise sequence diagram with a descriptive title. Only output the JSON.`,
    parsingPrompt: `You are an expert Mermaid.js parser. You will be given Mermaid code for a Sequence Diagram.
                    Your ONLY job is to parse the code and return a JSON object that strictly adheres to the provided schema.
                    - 'participant A' maps to an item in "actors".
                    - 'title X' maps to {"title": "X"}.
                    - A->>B: msg maps to {"sender": "A", "receiver": "B", "message": "msg", "type": "sync"}.
                    - A-)B: msg maps to {"sender": "A", "receiver": "B", "message": "msg", "type": "async"}.
                    - A-->B: msg maps to {"sender": "A", "receiver": "B", "message": "msg", "type": "reply"}.
                    - A-->>B: msg maps to {"sender": "A", "receiver": "B", "message": "msg", "type": "async_reply"}.
                    Return ONLY the valid JSON.`,
  },
  ER: {
    schema: {
      type: "object",
      properties: {
        diagramType: { type: "string", enum: ["ER"] },
        title: { type: "string", description: "A short, descriptive title for the diagram" },
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
      required: ["diagramType", "title", "entities", "relationships"],
      propertyOrdering: ["diagramType", "title", "entities", "relationships"],
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for an ER diagram based on a user's natural language request. Ensure the output is valid JSON according to the schema. Provide a clear and concise ER diagram with a descriptive title. Only output the JSON.`,
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
        title: { type: "string", description: "A short, descriptive title for the diagram" },
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
    generationPrompt: `You are an AI assistant that generates structured JSON data for a Gantt chart based on a user's natural language request. Ensure the output is valid JSON according to the schema. Dates must be in YYYY-MM-DD format. Provide a clear and concise Gantt chart with a descriptive title. Only output the JSON.`,
    parsingPrompt: `You are an expert Mermaid.js parser. You will be given Mermaid code for a Gantt Chart.
                    Your ONLY job is to parse the code and return a JSON object that strictly adheres to the provided schema.
                    - 'title X' maps to {"title": "X"}.
                    - 'dateFormat YYYY-MM-DD' maps to {"dateFormat": "YYYY-MM-DD"}.
                    - 'section Name' maps to {"name": "Name", "tasks": [...]}.
                    - 'Task Name :done, 2024-01-01, 2024-01-02' maps to {"name": "Task Name", "status": "done", "start": "2024-01-01", "end": "2024-01-02"}.
                    - 'Task Name : 2024-01-01, 2024-01-02' maps to {"name": "Task Name", "start": "2024-01-01", "end": "2024-01-02"}.
                    Return ONLY the valid JSON.`,
  },
  Class: {
    schema: {
      type: "object",
      properties: {
        diagramType: { type: "string", enum: ["Class"] },
        title: { type: "string", description: "A short, descriptive title for the diagram" },
        classes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              attributes: {
                type: "array",
                items: { type: "string" },
              },
              methods: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["name"],
          },
        },
        relationships: {
          type: "array",
          items: {
            type: "object",
            properties: {
              fromClass: { type: "string" },
              toClass: { type: "string" },
              relationshipType: {
                type: "string",
                enum: [
                  "inheritance",
                  "composition",
                  "aggregation",
                  "association",
                  "dependency",
                  "realization",
                  "solid",
                  "dashed",
                ],
              },
              label: { type: "string", nullable: true },
            },
            required: ["fromClass", "toClass", "relationshipType"],
          },
        },
      },
      required: ["diagramType", "title", "classes", "relationships"],
      propertyOrdering: ["diagramType", "title", "classes", "relationships"],
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for a Class diagram based on a user's natural language request. Ensure the output is valid JSON. Attributes and methods should follow standard UML notation (+, -, #). Only output the JSON.`,
    parsingPrompt: `You are an expert Mermaid.js parser for Class Diagrams. Parse the code into JSON complying with the schema. 
                    - 'class A {}' maps to {"name": "A"} with contents mapping to attributes or methods.
                    - Inheritance and relationship types map to specific string enumerations.
                    Return ONLY valid JSON.`,
  },
  State: {
    schema: {
      type: "object",
      properties: {
        diagramType: { type: "string", enum: ["State"] },
        title: { type: "string", description: "A short, descriptive title for the diagram" },
        states: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
            required: ["id", "name"],
          },
        },
        transitions: {
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
      required: ["diagramType", "title", "states", "transitions"],
      propertyOrdering: ["diagramType", "title", "states", "transitions"],
    },
    generationPrompt: `You are an AI assistant that generates structured JSON data for a State diagram based on a user's natural language request. Use '[*]' to define the initial state and final state when appropriate. Provide a descriptive title. Only output the JSON.`,
    parsingPrompt: `You are an expert Mermaid.js parser for State Diagrams. Parse the code into JSON adhering to the schema.
                    - '[*] --> StateA' means from '[*]' to 'StateA'.
                    Return ONLY valid JSON.`,
  },
};
