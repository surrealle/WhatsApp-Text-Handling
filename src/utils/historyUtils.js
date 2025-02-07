export const addToHistory = (
  text,
  history,
  setHistory,
  setCurrentIndex,
  MAX_HISTORY_LENGTH
) => {
  setHistory((prevHistory) => {
    // ✅ Ensure first entry is stored
    if (prevHistory.length === 0) {
      setCurrentIndex(0);
      return [text];
    }

    // ✅ Prevent duplicate consecutive entries
    if (prevHistory[prevHistory.length - 1] === text) {
      return prevHistory;
    }

    // ✅ Append new entry without overwriting old ones
    const newHistory = [...prevHistory, text];

    // ✅ Ensure history doesn't exceed max length
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory.shift();
    }

    // ✅ Set index to the latest entry
    setCurrentIndex(newHistory.length - 1);

    return newHistory;
  });
};

export const handleUndo = (
  currentIndex,
  history,
  setCurrentIndex,
  setInput
) => {
  if (currentIndex > 0) {
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    setInput(history[newIndex]); // ✅ Restore previous input
  } else {
  }
};

export const handleRedo = (
  currentIndex,
  history,
  setCurrentIndex,
  setInput
) => {
  if (currentIndex < history.length - 1) {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setInput(history[newIndex]); // ✅ Restore next input
  } else {
  }
};
