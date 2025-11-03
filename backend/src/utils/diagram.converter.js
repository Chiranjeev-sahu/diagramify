import { parseMermaidToJSON } from "./ai.utils.js";

export const convertFlowchartDataToMermaid = (diagramData) => {
  console.log("convertFlowchartDataToMermaid - START", diagramData);

  if (
    !diagramData ||
    !Array.isArray(diagramData.elements) ||
    !Array.isArray(diagramData.connections)
  ) {
    const errorMessage =
      "Invalid flowchart diagramData structure: missing 'elements' or 'connections'.";
    console.error(
      "convertFlowchartDataToMermaid - ERROR:",
      errorMessage,
      diagramData,
    );
    throw new Error(errorMessage);
  }

  let mermaidCode = "graph LR\n"; // Default for top-down flowchart

  // Map elements to their Mermaid.js node representations
  try {
    diagramData.elements.forEach((element) => {
      console.log(
        "convertFlowchartDataToMermaid - Processing element:",
        element,
      );
      let nodeRepresentation = "";
      // This switch statement maps your AI's 'type' to Mermaid's syntax
      switch (element.type) {
        case "start":
          nodeRepresentation = `${element.id}(("${element.text}"))`; // (()) for start/end
          break;
        case "end":
          nodeRepresentation = `${element.id}(("${element.text}"))`;
          break;
        case "process":
          nodeRepresentation = `${element.id}["${element.text}"]`; // [] for process
          break;
        case "decision":
          nodeRepresentation = `${element.id}{"${element.text}"}`; // {} for decision
          break;
        case "inputoutput":
          nodeRepresentation = `${element.id}[/"${element.text}"/]`; // [//] for parallelogram
          break;
        default:
          nodeRepresentation = `${element.id}["${element.text}"]`; // Default to rectangle
      }
      mermaidCode += `    ${nodeRepresentation};\n`;
      console.log(
        "convertFlowchartDataToMermaid - Added node:",
        nodeRepresentation,
      );
    });

    mermaidCode += "\n"; // Add a newline for readability

    // Add connections
    diagramData.connections.forEach((connection) => {
      console.log(
        "convertFlowchartDataToMermaid - Processing connection:",
        connection,
      );
      const fromNodeId = connection.from;
      const toNodeId = connection.to;
      // Labels MUST be in quotes for Mermaid syntax
      const label = connection.label ? ` -- "${connection.label}" -->` : " -->";
      mermaidCode += `    ${fromNodeId}${label}${toNodeId};\n`;
      console.log(
        "convertFlowchartDataToMermaid - Added connection:",
        `${fromNodeId}${label}${toNodeId};`,
      );
    });
  } catch (error) {
    console.error(
      "convertFlowchartDataToMermaid - ERROR: An error occurred during element/connection processing:",
      error,
    );
    throw error; // Re-throw the error to be handled by the calling function
  }

  console.log(
    "convertFlowchartDataToMermaid - END - Mermaid code:",
    mermaidCode,
  );
  return mermaidCode;
};

export const convertSequenceDiagramDataToMermaid = (diagramData) => {
  console.log("convertSequenceDiagramDataToMermaid - START", diagramData);
  if (
    !diagramData ||
    !Array.isArray(diagramData.actors) ||
    !Array.isArray(diagramData.messages)
  ) {
    const errorMessage =
      "Invalid sequence diagramData structure: missing 'actors' or 'messages'.";
    console.error(
      "convertSequenceDiagramDataToMermaid - ERROR:",
      errorMessage,
      diagramData,
    );
    throw new Error(errorMessage);
  }

  let mermaidCode = "sequenceDiagram\n";

  // Add title if it exists
  if (diagramData.title) {
    mermaidCode += `    title ${diagramData.title}\n`;
  }

  mermaidCode += "\n"; // Add a newline

  // Add actors
  try {
    diagramData.actors.forEach((actor) => {
      console.log(
        "convertSequenceDiagramDataToMermaid - Processing actor:",
        actor,
      );
      mermaidCode += `    participant ${actor}\n`;
      console.log(
        "convertSequenceDiagramDataToMermaid - Added participant:",
        actor,
      );
    });
    mermaidCode += "\n"; // Add a newline for better readability

    // Add messages
    diagramData.messages.forEach((message) => {
      console.log(
        "convertSequenceDiagramDataToMermaid - Processing message:",
        message,
      );
      let arrowType = "->>"; // Default: solid arrow for 'sync'
      // This switch maps your AI's 'type' to Mermaid's arrow syntax
      switch (message.type) {
        case "async":
          arrowType = "->>"; // Mermaid uses ->) or ->> for async
          break;
        case "reply":
          arrowType = "-->"; // Dashed arrow for reply
          break;
        case "async_reply":
          arrowType = "-->>"; // Dashed arrow for async reply
          break;
        case "sync":
        default:
          arrowType = "->>"; // Solid arrow
          break;
      }

      mermaidCode += `    ${message.sender}${arrowType}${message.receiver}: ${message.message}\n`;
      console.log(
        "convertSequenceDiagramDataToMermaid - Added message:",
        `${message.sender}${arrowType}${message.receiver}: ${message.message}`,
      );
    });
  } catch (error) {
    console.error(
      "convertSequenceDiagramDataToMermaid - ERROR: An error occurred during actor/message processing:",
      error,
    );
    throw error; // Re-throw the error
  }

  console.log(
    "convertSequenceDiagramDataToMermaid - END - Mermaid code:",
    mermaidCode,
  );
  return mermaidCode;
};

export const convertERDiagramDataToMermaid = (diagramData) => {
  console.log("convertERDiagramDataToMermaid - START", diagramData);

  if (
    !diagramData ||
    !Array.isArray(diagramData.entities) ||
    !Array.isArray(diagramData.relationships)
  ) {
    const errorMessage =
      "Invalid ER diagramData structure: missing 'entities' or 'relationships'.";
    console.error(
      "convertERDiagramDataToMermaid - ERROR:",
      errorMessage,
      diagramData,
    );
    throw new Error(errorMessage);
  }

  let mermaidCode = "erDiagram\n";

  // Add entities and their attributes
  try {
    diagramData.entities.forEach((entity) => {
      console.log("convertERDiagramDataToMermaid - Processing entity:", entity);
      mermaidCode += `    ${entity.name} {\n`;
      entity.attributes.forEach((attribute) => {
        console.log(
          "convertERDiagramDataToMermaid - Processing attribute:",
          attribute,
        );
        let attributeString = `        ${attribute.type} ${attribute.name}`;
        if (attribute.key) {
          attributeString += ` ${attribute.key.toUpperCase()}`; // PK, FK
        }
        mermaidCode += attributeString + "\n";
        console.log(
          "convertERDiagramDataToMermaid - Added attribute:",
          attributeString,
        );
      });
      mermaidCode += "    }\n";
      console.log("convertERDiagramDataToMermaid - Added entity:", entity.name);
    });

    mermaidCode += "\n"; // Add a newline for separation

    // Add relationships
    diagramData.relationships.forEach((rel) => {
      console.log(
        "convertERDiagramDataToMermaid - Processing relationship:",
        rel,
      );
      let relationshipString = `    ${rel.fromEntity} `;
      // This switch maps your AI's 'relationshipType' to Mermaid's syntax
      switch (rel.relationshipType) {
        case "one-to-one":
          relationshipString += `||--||`;
          break;
        case "one-to-many":
          relationshipString += `||--o{`;
          break;
        case "many-to-one":
          relationshipString += `o{--||`;
          break;
        case "many-to-many":
          relationshipString += `o{--o{`;
          break;
        default:
          relationshipString += `|--|`; // Default
      }
      // Labels MUST be in quotes for Mermaid syntax
      relationshipString += ` ${rel.toEntity} : "${rel.label || ""}"\n`;
      mermaidCode += relationshipString;
      console.log(
        "convertERDiagramDataToMermaid - Added relationship:",
        relationshipString,
      );
    });
  } catch (error) {
    console.error(
      "convertERDiagramDataToMermaid - ERROR: An error occurred during entity/relationship processing:",
      error,
    );
    throw error; // Re-throw the error
  }

  console.log(
    "convertERDiagramDataToMermaid - END - Mermaid code:",
    mermaidCode,
  );
  return mermaidCode;
};

export const convertGanttChartDataToMermaid = (diagramData) => {
  console.log("convertGanttChartDataToMermaid - START", diagramData);
  if (!diagramData || !Array.isArray(diagramData.sections)) {
    const errorMessage =
      "Invalid Gantt Chart diagramData structure: missing 'sections'.";
    console.error(
      "convertGanttChartDataToMermaid - ERROR:",
      errorMessage,
      diagramData,
    );
    throw new Error(errorMessage);
  }

  let mermaidCode = "gantt\n";

  try {
    if (diagramData.title) {
      console.log(
        "convertGanttChartDataToMermaid - Adding title:",
        diagramData.title,
      );
      mermaidCode += `    title ${diagramData.title}\n`;
    }
    if (diagramData.dateFormat) {
      console.log(
        "convertGanttChartDataToMermaid - Adding dateFormat:",
        diagramData.dateFormat,
      );
      mermaidCode += `    dateFormat ${diagramData.dateFormat}\n`;
    }
    if (diagramData.axisFormat) {
      console.log(
        "convertGanttChartDataToMermaid - Adding axisFormat:",
        diagramData.axisFormat,
      );
      mermaidCode += `    axisFormat ${diagramData.axisFormat}\n`;
    }

    diagramData.sections.forEach((section) => {
      console.log(
        "convertGanttChartDataToMermaid - Processing section:",
        section,
      );
      mermaidCode += `\n    section ${section.name}\n`;
      section.tasks.forEach((task) => {
        console.log("convertGanttChartDataToMermaid - Processing task:", task);

        let taskLine = `        ${task.name} :`;
        if (task.status) {
          taskLine += `${task.status}, `; // e.g., "done, "
        }
        taskLine += `${task.start}, ${task.end}`;

        mermaidCode += `${taskLine}\n`;
        console.log(
          "convertGanttChartDataToMermaid - Added task line:",
          taskLine,
        );
      });
    });
  } catch (error) {
    console.error(
      "convertGanttChartDataToMermaid - ERROR: An error occurred during section/task processing:",
      error,
    );
    throw error; // Re-throw the error
  }

  console.log(
    "convertGanttChartDataToMermaid - END - Mermaid code:",
    mermaidCode,
  );
  return mermaidCode;
};

export const diagramDataToMermaidCode = (diagramData) => {
  console.log("diagramDataToMermaidCode - START", diagramData);
  if (!diagramData || !diagramData.diagramType) {
    const errorMessage = "Invalid diagramData: 'diagramType' is missing.";
    console.error(
      "diagramDataToMermaidCode - ERROR:",
      errorMessage,
      diagramData,
    );
    throw new Error(errorMessage);
  }

  let mermaidCode = "";
  try {
    switch (diagramData.diagramType) {
      case "Flowchart":
        mermaidCode = convertFlowchartDataToMermaid(diagramData);
        break;
      case "Sequence":
        mermaidCode = convertSequenceDiagramDataToMermaid(diagramData);
        break;
      case "ER":
        mermaidCode = convertERDiagramDataToMermaid(diagramData);
        break;
      case "Gantt":
        mermaidCode = convertGanttChartDataToMermaid(diagramData);
        break;
      default:
        const errorMessage = `Unsupported diagram type for conversion: ${diagramData.diagramType}`;
        console.error(
          "diagramDataToMermaidCode - ERROR:",
          errorMessage,
          diagramData,
        );
        throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(
      "diagramDataToMermaidCode - ERROR: An error occurred during conversion:",
      error,
    );
    throw error; // Re-throw the error
  }

  console.log("diagramDataToMermaidCode - END - Mermaid code:", mermaidCode);
  return mermaidCode;
};

export const mermaidCodeToDiagramData = async (mermaidCode, diagramType) => {
  console.log("mermaidCodeToDiagramData - START", diagramType);
  if (!diagramType) {
    throw new Error("diagramType is required to parse Mermaid code.");
  }

  try {
    // Use the new AI parsing function
    const parsedData = await parseMermaidToJSON(mermaidCode, diagramType);
    return parsedData;
  } catch (error) {
    console.error(
      `mermaidCodeToDiagramData - ERROR: Failed to parse code for ${diagramType}:`,
      error,
    );
    return {
      diagramType: diagramType,
      error: "Failed to parse code, but code was saved.",
    };
  }
};
