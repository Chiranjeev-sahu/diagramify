import mermaid from "mermaid"

export function initializeMermaid() {
    mermaid.initilize({startOnLoad:false,theme:"default"});
}

export function renderDiagrams(code,containerId) {
    mermaid.render("generatedDiagram",code,(svg) => {
        document.getElementById(containerId).innerHTML=svg;
    })
}