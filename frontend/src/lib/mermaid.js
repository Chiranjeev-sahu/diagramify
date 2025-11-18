// src/lib/mermaid.js
import mermaid from "mermaid";

export function initializeMermaid(config = {}) {
  const base = {
    startOnLoad: false,
    theme: "forest",
  };

  try {
    mermaid.initialize({ ...base, ...config });
  } catch {
    /* ignore re-init warning */
  }
}

mermaid.parseError = (err) => {
  console.warn("Mermaid parse error:", err);
};

export async function renderInto(element, code) {
  if (!element) return;

  element.innerHTML = "";

  const id = `m-${Math.random().toString(36).slice(2, 10)}`;

  try {
    const result = mermaid.parse(code);
    if (!result) {
      throw new Error("Invalid Mermaid syntax");
    }

    const { svg } = await mermaid.render(id, code);
    element.innerHTML = svg;

  } catch (err) {
    element.innerHTML = `
      <div class="p-4 text-red-600 border border-red-600 rounded">
        Diagram Error: ${err.message}
      </div>
    `;

    cleanupInjectedNodes();
  }
}

function cleanupInjectedNodes() {
  const junk = document.querySelectorAll("[id^='d']", "[id^='dm-']");
  junk.forEach(el => el.remove());
}
