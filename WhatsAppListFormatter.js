import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Undo, Redo, AlertCircle } from 'lucide-react';
import { debounce } from 'lodash';

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
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\u200B/g, '') // Remove zero-width spaces
      .replace(/[\u2018\u2019]/g, "'") // Smart quotes to regular quotes
      .replace(/[\u201C\u201D]/g, '"') // Smart double quotes to regular quotes
      .replace(/\s+$/gm, '') // Remove trailing spaces from each line
      .replace(/\t/g, '  ') // Convert tabs to spaces
      .replace(/\r\n/g, '\n'); // Normalize line endings
  };

  const processWordHtml = (node, depth = 0) => {
    if (!node) return '';

    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      let result = '';
      
      // Handle lists and bullet points
      if (node.tagName === 'P' && node.innerHTML.includes('•')) {
        result = '* ' + node.textContent.replace(/^[•\s]+/, '');
      } else if (node.tagName === 'LI') {
        result = '* ' + node.textContent;
      } else {
        // Process all child nodes
        for (const child of node.childNodes) {
          result += processWordHtml(child, depth + 1);
        }
      }

      // Add appropriate line breaks
      if (['P', 'DIV', 'LI', 'BR'].includes(node.tagName)) {
        result += '\n';
      }

      return result;
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
        // Process Word HTML content
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        processedText = processWordHtml(temp)
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      } else {
        // Process plain text content
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
          .replace(/\*\*(.*?)\*\*/g, '*$1*') // Bold
          .replace(/(?<!\*)\*((?!\*).+?)(?<!\*)\*/g, '_$1_') // Italic
          .replace(/^\* /gm, '• '); // Bullet points
      })
      .join('\n')
      .trim();
  }, []);

  useEffect(() => {
    debouncedConversion(input);
    setStatus(prev => ({ ...prev, charCount: input.length }));
  }, [input]);

  const debouncedConversion = useCallback(
    debounce((text) => {
      setConvertedText(convertToWhatsApp(text));
    }, 300),
    [convertToWhatsApp]
  );

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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>WhatsApp List Formatter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={handleUndo} 
              disabled={currentIndex <= 0} 
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={currentIndex >= history.length - 1} 
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Redo"
            >
              <Redo size={16} />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {status.charCount}/{MAX_CHARS} characters
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Paste your text here</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            className="w-full h-64 p-2 border rounded-md font-mono text-sm whitespace-pre-wrap"
            placeholder="Paste your formatted text here..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">WhatsApp Format</label>
            <button 
              onClick={handleCopy} 
              className="flex items-center gap-2 px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
              disabled={!convertedText || status.isProcessing}
            >
              {status.copied ? <Check size={16} /> : <Copy size={16} />}
              {status.copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="w-full min-h-64 p-2 border rounded-md bg-gray-50 font-mono text-sm whitespace-pre-wrap">
            {convertedText}
          </pre>
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
      </CardContent>
    </Card>
  );
};

export default WhatsAppListFormatter;