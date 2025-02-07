import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, Copy, Redo, Undo } from "lucide-react";
import { debounce } from "lodash";

// ✅ Import utilities
import { sanitizeInput } from "../utils/textProcessing";
import { addToHistory, handleRedo, handleUndo } from "../utils/historyUtils";
import { handleCopy, handlePaste } from "../utils/clipboardUtils";
import { convertToWhatsApp } from "../utils/conversionUtils";

const styles = `
  .formatter-card {
    width: 100%;
    max-width: 42rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    margin: 1rem auto;
    padding: 1rem;
  }

  .formatter-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .formatter-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .formatter-content {
    padding: 1rem;
  }

  .space-y-4 > * + * {
    margin-top: 1rem;
  }

  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }

  .flex {
    display: flex;
  }

  .justify-between {
    justify-content: space-between;
  }

  .items-center {
    align-items: center;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .action-button {
    border: 1px solid #e5e7eb;
    padding: 0.25rem;
    border-radius: 0.25rem;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .action-button:hover:not(:disabled) {
    background-color: #f3f4f6;
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .copy-button {
    padding: 0.25rem 0.75rem;
  }

  .text-sm {
    font-size: 0.875rem;
  }

  .text-gray-500 {
    color: #6b7280;
  }

  .font-medium {
    font-weight: 500;
  }

  textarea, pre {
    width: 100%;
    min-height: 16rem;
    max-height: none;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-family: ui-monospace, monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre-wrap;
    margin: 0;
    overflow-y: auto;
  }

  pre {
    background-color: #f9fafb;
    height: auto;
    min-height: 16rem;
    max-height: none;
    overflow-y: auto;
  }

  .text-red-500 {
    color: #ef4444;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .success-button {
    background-color: #22c55e;
    color: white;
    border-color: #22c55e;
  }
`;

const MAX_HISTORY_LENGTH = 50;
const MAX_CHARS = 10000;

const WhatsAppListFormatter = () => {
  const [input, setInput] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState({
    copied: false,
    error: null,
    isProcessing: false,
    charCount: 0,
  });

  const handleClear = () => {
    setInput(""); // ✅ Clears the input field
    setConvertedText(""); // ✅ Clears the formatted output
    setHistory([]); // ✅ Resets history (optional)
    setCurrentIndex(-1); // ✅ Reset undo/redo index
  };

  const addHistoryEntry = useCallback(
    (text) => {
      addToHistory(
        text,
        history,
        setHistory,
        setCurrentIndex,
        MAX_HISTORY_LENGTH
      );
    },
    [history, setHistory, setCurrentIndex]
  );

  const handleUndoClick = () => {
    handleUndo(currentIndex, history, setCurrentIndex, setInput);
  };

  const handleRedoClick = () => {
    handleRedo(currentIndex, history, setCurrentIndex, setInput);
  };

  const debouncedConversion = useCallback(
    debounce((text) => {
      setConvertedText(convertToWhatsApp(text));
    }, 300),
    []
  );

  useEffect(() => {
    // ✅ Prevent adding history when undoing
    if (input.trim() !== "" && currentIndex === history.length - 1) {
      addHistoryEntry(input);
    }

    debouncedConversion(input);
    setStatus((prev) => ({ ...prev, charCount: input.length }));
  }, [input, debouncedConversion]);

  const handleCopyClick = () => {
    handleCopy(convertedText, setStatus);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="formatter-card">
        <div className="formatter-header">
          <h1 className="formatter-title">WhatsApp List Formatter</h1>
        </div>
        <div className="formatter-content space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleUndoClick}
                disabled={currentIndex <= 0}
                className={`action-button ${
                  currentIndex > 0 ? "" : "disabled"
                }`} // ✅ Disable button if no history
                title="Undo"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={handleRedoClick}
                disabled={currentIndex >= history.length - 1}
                className={`action-button ${
                  currentIndex < history.length - 1 ? "" : "disabled"
                }`} // ✅ Disable button if no history
                title="Redo"
              >
                <Redo size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {status.charCount}/{MAX_CHARS} characters
            </span>
          </div>
          <div className="flex justify-between items-center">
            <label>Paste your text here</label>

            {/* ✅ Clear Button */}
            <button
              onClick={handleClear}
              className="action-button"
              title="Clear All"
            >
              <span role="img" aria-label="trash">
                🗑️
              </span>{" "}
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              value={input}
              onChange={(e) => setInput(sanitizeInput(e.target.value))}
              onPaste={(e) =>
                handlePaste(e, setInput, addHistoryEntry, setStatus, MAX_CHARS)
              }
              placeholder="Paste your formatted text here..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label>WhatsApp Format</label>
              <button
                onClick={handleCopyClick}
                className={`action-button copy-button ${
                  status.copied ? "success-button" : ""
                }`}
                disabled={!convertedText || status.isProcessing}
              >
                {status.copied ? <Check size={16} /> : <Copy size={16} />}
                {status.copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre>{convertedText}</pre>
          </div>

          {status.error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              <span role="alert">{status.error}</span>
            </div>
          )}

          {status.isProcessing && (
            <div className="text-sm text-gray-500">Processing...</div>
          )}
        </div>
      </div>
    </>
  );
};

export default WhatsAppListFormatter;
