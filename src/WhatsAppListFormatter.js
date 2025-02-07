import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Undo, Redo, AlertCircle } from 'lucide-react';
import { debounce } from 'lodash';

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
  const [input, setInput] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [status, setStatus] = useState({
    copied: false,
    error: null,
    isProcessing: false,
    charCount: 0,
  });

  const sanitizeInput = (text) => {
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/\u200B/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\s+$/gm, '')
      .replace(/\t/g, '  ')
      .replace(/\r\n/g, '\n');
  };

  const processWordHtml = (node) => {
    if (!node) return '';

    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent
            .replace(/\u00A0/g, ' ')  // ✅ Remove non-breaking spaces
            .replace(/·/g, '•')  // ✅ Convert Word’s auto-replacement of `•`
            .replace(/\s+/g, ' ')  // ✅ Remove any extra spaces
            .trim();
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        let result = '';

        if (node.tagName === 'P' || node.tagName === 'DIV' || node.tagName === 'LI' || node.tagName === 'BR') {
            result += '\n';  // ✅ Ensure correct paragraph structure
        }

        let textParts = [];
        for (const child of node.childNodes) {
            textParts.push(processWordHtml(child));  // ✅ Collect text fragments properly
        }

        return result + textParts.join(' ').trim();  // ✅ Fixes word splitting issue
    }

    return '';
};


  const addToHistory = useCallback((text) => {
    setHistory(prev => {
      const newHistory = [...prev.slice(0, currentIndex + 1), text].slice(-MAX_HISTORY_LENGTH);
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setInput(history[currentIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInput(history[currentIndex + 1]);
    }
  };

  const handleClear = () => {
    setInput('');  // ✅ Clears the input field
    setConvertedText('');  // ✅ Clears the formatted output
    setHistory([]);  // ✅ Resets history (optional)
    setCurrentIndex(-1);  // ✅ Reset undo/redo index
  };

  const handlePaste = (e) => {
    try {
      e.preventDefault();
      setStatus(prev => ({ ...prev, isProcessing: true, error: null }));

      if (!e.clipboardData) {
        throw new Error('Clipboard access denied');
      }

      const htmlContent = e.clipboardData.getData('text/html');
      const textContent = e.clipboardData.getData('text/plain');
      
      if (textContent.length > MAX_CHARS) {
        throw new Error(`Text exceeds maximum limit of ${MAX_CHARS} characters`);
      }

      let processedText;
      if (htmlContent && htmlContent.includes('</html>')) {
        const cleanHtml = htmlContent
        .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments containing styles
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''); // Remove style tags
        
        
        const temp = document.createElement('div');
        temp.innerHTML = cleanHtml;
        processedText = processWordHtml(temp)
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      } else {
        processedText = sanitizeInput(textContent);
      }

      setInput(processedText);
      addToHistory(processedText);
      setStatus(prev => ({ ...prev, charCount: processedText.length }));

    } catch (error) {
      console.error('Paste error:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: error.message || 'Error processing pasted content. Please try again.' 
      }));
    } finally {
      setStatus(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const convertToWhatsApp = useCallback((text) => {
    if (!text?.trim()) return 'No content to format.';
    
    return text
      .split(/(?<=\n|^)(?=✅|❌|⚠️)/gm)
      .map(section => {
        return section
          .replace(/\*\*(.*?)\*\*/g, '*$1*')
          .replace(/(?<!\*)\*((?!\*).+?)(?<!\*)\*/g, '_$1_')
          .replace(/^\* /gm, '• ');
      })
      .join('\n')
      .trim();
  }, []);

  const debouncedConversion = useCallback(
    debounce((text) => {
      setConvertedText(convertToWhatsApp(text));
    }, 300),
    [convertToWhatsApp]
  );

  useEffect(() => {
    debouncedConversion(input);
    setStatus(prev => ({ ...prev, charCount: input.length }));
  }, [input, debouncedConversion]);


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertedText);
      setStatus(prev => ({ ...prev, copied: true, error: null }));
      setTimeout(() => {
        setStatus(prev => ({ ...prev, copied: false }));
      }, 2000);
    } catch (err) {
      setStatus(prev => ({ 
        ...prev, 
        error: 'Failed to copy text to clipboard',
        copied: false 
      }));
    }
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
                onClick={handleUndo}
                disabled={currentIndex <= 0}
                className="action-button"
                title="Undo"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={handleRedo}
                disabled={currentIndex >= history.length - 1}
                className="action-button"
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
              <span role="img" aria-label="trash">🗑️</span> Clear All
            </button>
</div>

          <div className="space-y-2">
            <label>Paste your text here</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              placeholder="Paste your formatted text here..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label>WhatsApp Format</label>
              <button
                onClick={handleCopy}
                className={`action-button copy-button ${status.copied ? 'success-button' : ''}`}
                disabled={!convertedText || status.isProcessing}
              >
                {status.copied ? <Check size={16} /> : <Copy size={16} />}
                {status.copied ? 'Copied!' : 'Copy'}
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
            <div className="text-sm text-gray-500">
              Processing...
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WhatsAppListFormatter;