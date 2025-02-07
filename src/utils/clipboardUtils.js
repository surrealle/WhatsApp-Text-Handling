import { processWordHtml, sanitizeInput } from "./textProcessing";

export const handlePaste = (
  e,
  setInput,
  addToHistory,
  setStatus,
  MAX_CHARS
) => {
  try {
    e.preventDefault();
    setStatus((prev) => ({ ...prev, isProcessing: true, error: null }));

    if (!e.clipboardData) {
      throw new Error("Clipboard access denied");
    }

    const htmlContent = e.clipboardData.getData("text/html");
    const textContent = e.clipboardData.getData("text/plain");

    if (textContent.length > MAX_CHARS) {
      throw new Error(`Text exceeds maximum limit of ${MAX_CHARS} characters`);
    }

    let processedText;
    if (htmlContent && htmlContent.includes("</html>")) {
      const temp = document.createElement("div");
      temp.innerHTML = htmlContent;
      processedText = processWordHtml(temp);
    } else {
      processedText = sanitizeInput(textContent);
    }

    setInput(processedText);
    addToHistory(processedText);
    setStatus((prev) => ({ ...prev, charCount: processedText.length }));
  } catch (error) {
    console.error("Paste error:", error);
    setStatus((prev) => ({
      ...prev,
      error:
        error.message || "Error processing pasted content. Please try again.",
    }));
  } finally {
    setStatus((prev) => ({ ...prev, isProcessing: false }));
  }
};

export const handleCopy = async (convertedText, setStatus) => {
  try {
    await navigator.clipboard.writeText(convertedText);
    setStatus((prev) => ({ ...prev, copied: true, error: null }));
    setTimeout(() => {
      setStatus((prev) => ({ ...prev, copied: false }));
    }, 2000);
  } catch (err) {
    setStatus((prev) => ({
      ...prev,
      error: "Failed to copy text to clipboard",
      copied: false,
    }));
  }
};
