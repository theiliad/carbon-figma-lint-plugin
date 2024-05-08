// // This plugin will open a tab that indicates that it will monitor the current
// // selection on the page. It cannot change the document itself.

// // This file holds the main code for plugins. Code in this file has access to
// // the *figma document* via the figma global object.
// // You can access browser APIs in the <script> tag inside "ui.html" which has a
// // full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
// // This shows the HTML page in "ui.html".
// figma.showUI(__html__);

// // This monitors the selection changes and posts the selection to the UI
// figma.on('selectionchange', () => {
//   figma.ui.postMessage(figma.currentPage.selection)
// });

figma.showUI(__html__, { width: 240, height: 300 });

function processComponentNames(node, layerNames) {
  if (node.type === "INSTANCE") {
    layerNames.push(`${node.name} - ${node.id}`);
  }

  if ("children" in node) {
    node.children.forEach((child) => processComponentNames(child, layerNames));
  }
}

function processLayers() {
  const selectedNodes = figma.currentPage.selection;
  const layerNames = [];

  selectedNodes.forEach((node) => processComponentNames(node, layerNames));

  return layerNames;
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "results__collect") {
    const selectedNames = processLayers();

    figma.ui.postMessage({ type: "results__ready", names: selectedNames });
  }
};
