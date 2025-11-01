// backend/src/utils/diagram.converter.js

/**
 * Converts structured diagramData (JSON) into Mermaid.js code for a Flowchart.
 * @param {object} diagramData - The structured JSON data for the flowchart.
 * @returns {string} The Mermaid.js code string.
 */
const convertFlowchartDataToMermaid = (diagramData) => {
  if (
    !diagramData ||
    !Array.isArray(diagramData.elements) ||
    !Array.isArray(diagramData.connections)
  ) {
    throw new Error(
      "Invalid flowchart diagramData structure: missing 'elements' or 'connections'.",
    );
  }

  let mermaidCode = "graph TD\n"; // Default for top-down flowchart

  // Map elements to their Mermaid.js node representations
  diagramData.elements.forEach((element) => {
    let nodeRepresentation = "";
    switch (element.type) {
      case "start":
      case "end":
        // Start/End nodes often use rounded rectangles or circles
        // Using stadium shape for start/end in this example
        nodeRepresentation = `${element.id}((${element.text}))`;
        break;
      case "process":
        nodeRepresentation = `${element.id}[${element.text}]`; // Rectangle for process
        break;
      case "decision":
        nodeRepresentation = `${element.id}{${element.text}}`; // Diamond for decision
        break;
      case "subroutine":
        nodeRepresentation = `${element.id}[[${element.text}]]`; // Subroutine
        break;
      case "inputoutput":
        nodeRepresentation = `${element.id}[/${element.text}/]`; // Parallelogram for input/output
        break;
      default:
        nodeRepresentation = `${element.id}[${element.text}]`; // Default to rectangle
    }
    mermaidCode += `    ${nodeRepresentation};\n`;
  });

  // Add connections
  diagramData.connections.forEach((connection) => {
    const fromNodeId = connection.from;
    const toNodeId = connection.to;
    const label = connection.label ? ` -- ${connection.label} -->` : " -->";
    mermaidCode += `    ${fromNodeId}${label}${toNodeId};\n`;
  });

  return mermaidCode;
};

/**
 * Converts structured diagramData (JSON) into Mermaid.js code for a Sequence Diagram.
 * @param {object} diagramData - The structured JSON data for the sequence diagram.
 * @returns {string} The Mermaid.js code string.
 */
const convertSequenceDiagramDataToMermaid = (diagramData) => {
  if (
    !diagramData ||
    !Array.isArray(diagramData.actors) ||
    !Array.isArray(diagramData.messages)
  ) {
    throw new Error(
      "Invalid sequence diagramData structure: missing 'actors' or 'messages'.",
    );
  }

  let mermaidCode = "sequenceDiagram\n";

  // Add actors
  diagramData.actors.forEach((actor) => {
    mermaidCode += `    participant ${actor.name}\n`;
  });
  mermaidCode += "\n"; // Add a newline for better readability in Mermaid

  // Add messages
  diagramData.messages.forEach((message) => {
    // message.type should be like "->>", "-->", "-->>", etc.
    mermaidCode += `    ${message.from}${message.type}${message.to}: ${message.text}\\n`;
  });

  return mermaidCode;
};

/**
 * Converts structured diagramData (JSON) into Mermaid.js code for an ER Diagram.
 * @param {object} diagramData - The structured JSON data for the ER diagram.
 * @returns {string} The Mermaid.js code string.
 */
const convertERDiagramDataToMermaid = (diagramData) => {
  if (
    !diagramData ||
    !Array.isArray(diagramData.entities) ||
    !Array.isArray(diagramData.relationships)
  ) {
    throw new Error(
      "Invalid ER diagramData structure: missing 'entities' or 'relationships'.",
    );
  }

  let mermaidCode = "erDiagram\n";

  // Add entities and their attributes
  diagramData.entities.forEach((entity) => {
    mermaidCode += `    ${entity.name} {\n`;
    entity.attributes.forEach((attr) => {
      const key = attr.key ? ` ${attr.key}` : "";
      const extra = attr.extra ? ` ${attr.extra.toUpperCase()}` : "";
      mermaidCode += `        ${attr.type} ${attr.name}${key}${extra}\n`;
    });
    mermaidCode += `    }\n`;
  });

  mermaidCode += "\n"; // Add a newline for separation

  // Add relationships
  diagramData.relationships.forEach((rel) => {
    // rel.type should be like "||--|{"
    mermaidCode += `    ${rel.entity1} ${rel.type} ${rel.entity2} : ${rel.label}\\n`;
  });

  return mermaidCode;
};

/**
 * Main dispatcher function to convert diagramData to Mermaid.js code based on diagramType.
 * @param {object} diagramData - The structured JSON data of the diagram.
 * @returns {string} The Mermaid.js code string.
 */
export const diagramDataToMermaidCode = (diagramData) => {
  if (!diagramData || !diagramData.diagramType) {
    throw new Error("Invalid diagramData: 'diagramType' is missing.");
  }

  switch (diagramData.diagramType) {
    case "Flowchart":
      return convertFlowchartDataToMermaid(diagramData);
    case "Sequence Diagram":
      return convertSequenceDiagramDataToMermaid(diagramData);
    case "ER Diagram":
      return convertERDiagramDataToMermaid(diagramData); // Now implemented
    case "Gantt Chart":
      return convertGanttChartDataToMermaid(diagramData); // Now implemented
    default:
      throw new Error(
        `Unsupported diagram type for conversion: ${diagramData.diagramType}`,
      );
  }
};

/**
 * Converts structured diagramData (JSON) into Mermaid.js code for a Gantt Chart.
 * @param {object} diagramData - The structured JSON data for the Gantt chart.
 * @returns {string} The Mermaid.js code string.
 */
const convertGanttChartDataToMermaid = (diagramData) => {
  if (!diagramData || !Array.isArray(diagramData.sections)) {
    throw new Error(
      "Invalid Gantt Chart diagramData structure: missing 'sections'.",
    );
  }

  let mermaidCode = "gantt\\n";

  if (diagramData.title) {
    mermaidCode += `    title ${diagramData.title}\\n`;
  }
  if (diagramData.dateFormat) {
    mermaidCode += `    dateFormat ${diagramData.dateFormat}\\n`;
  }
  if (diagramData.axisFormat) {
    mermaidCode += `    axisFormat ${diagramData.axisFormat}\\n`;
  }

  diagramData.sections.forEach((section) => {
    mermaidCode += `\\n    section ${section.name}\\n`;
    section.tasks.forEach((task) => {
      let taskLine = `    ${task.name} :`;
      if (task.status) {
        taskLine += `${task.status}, `;
      }
      if (task.id) {
        taskLine += `${task.id}, `;
      }

      // Determine timing for the task
      if (task.start && task.end) {
        taskLine += `${task.start}, ${task.end}`;
      } else if (task.start && task.duration) {
        taskLine += `${task.start}, ${task.duration}`;
      } else if (task.after && task.duration) {
        taskLine += `after ${task.after}, ${task.duration}`;
      } else if (task.after && task.end) {
        // Added this case for 'after' and 'end' if duration is not present
        taskLine += `after ${task.after}, ${task.end}`;
      } else if (task.milestone && task.date) {
        // Milestone
        taskLine += `milestone, ${task.date}`;
      } else {
        // Fallback or error if no valid timing is provided
        taskLine += `des:${task.start || ""}, ${task.duration || ""}`; // Dummy for undefined
      }
      mermaidCode += `${taskLine}\\n`;
    });
  });

  return mermaidCode;
};

/**
 * Parses Mermaid.js code into structured diagramData.
 * NOTE: This is a complex function typically requiring a dedicated parser library
 * or a specialized LLM. This is a placeholder for now.
 * @param {string} mermaidCode - The Mermaid.js code string.
 * @param {string} diagramType - The type of diagram to parse.
 * @returns {object} The structured JSON diagramData.
 */
export const mermaidCodeToDiagramData = (mermaidCode, diagramType) => {
  console.warn(
    `mermaidCodeToDiagramData for type '${diagramType}' is a placeholder and requires a parser library or LLM for robust implementation.`,
  );
  // As a temporary measure, you might return a very basic structure or parse
  // a extremely simple, predefined Mermaid string.
  // For production, this needs a proper parser.
  return {
    diagramType: diagramType,
    elements: [],
    connections: [],
    // ... potentially other default properties
    _parsedFromCode: mermaidCode, // Keep original code for debugging/info
  };
};
