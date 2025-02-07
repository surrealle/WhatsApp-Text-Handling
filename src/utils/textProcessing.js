export const sanitizeInput = (text) =>
  text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\u200B/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+$/gm, "")
    .replace(/\t/g, "  ")
    .replace(/\r\n/g, "\n");

// Processes Word HTML
export const processWordHtml = (node) => {
  if (!node) {
    return "";
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent
      .replace(/\u00A0/g, " ") // ✅ Remove non-breaking spaces
      .replace(/·/g, "•") // ✅ Convert Word’s auto-replacement of `•`
      .replace(/\s+/g, " ") // ✅ Remove any extra spaces
      .trim();
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    // ❌ Remove Microsoft Word styles
    if (
      node.tagName === "STYLE" ||
      node.tagName === "META" ||
      node.tagName === "SCRIPT" ||
      node.tagName === "LINK"
    ) {
      return ""; // Ignore these elements
    }

    let result = "";

    if (
      node.tagName === "P" ||
      node.tagName === "DIV" ||
      node.tagName === "LI" ||
      node.tagName === "BR"
    ) {
      result += "\n"; // ✅ Ensure correct paragraph structure
    }

    const textParts = [];
    for (const child of node.childNodes) {
      textParts.push(processWordHtml(child)); // ✅ Collect text fragments properly
    }

    return result + textParts.join(" ").trim(); // ✅ Fixes word splitting issue
  }

  return "";
};
