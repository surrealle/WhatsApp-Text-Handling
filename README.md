
# WhatsApp Text Formatter

Ever had problems retaining the same format when copy+pasting from Word or other sources into WHatsApp desktop?
This is a **React-based web tool** to format text copied from Word and other sources into a **WhatsApp-friendly** format. It ensures that the structure and bullet points remain intact when pasted into WhatsApp.

---

## Features
- ✅ Preserves **formatting** when copying text from Word  
- ✅ Converts **bold** to `*bold*`, **italic** to `_italic_`  
- ✅ Ensures bullet points (`•`) are **kept properly formatted**  
- ✅ Provides **Undo & Redo** functionality  
- ✅ Includes a **Copy button** to quickly copy formatted text  

---

## Installation

### 1. Clone the Repository
```sh
git clone https://github.com/surrealle/whatsapp-text-formatter.git
cd whatsapp-text-formatter
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Run the App
```sh
npm start
```
The app should now be running at **`http://localhost:3000`**.

---

## Usage
1. **Paste** your text into the input field.  
2. The tool **automatically formats** the text.  
3. Click **"Copy"** to copy the formatted text.  
4. Paste it into **WhatsApp**, and the formatting remains intact.  

---

## Formatting Rules
| **Input** | **Output (WhatsApp Format)** |
|-----------|-----------------------------|
| **Bold** | `*Bold*` |
| *Italic* | `_Italic_` |
| ✅ Section Titles | Preserved |
| • Bullet points | Preserved |

---

## Tech Stack
- **React.js** (Frontend UI)
- **CSS Modules** (Styling)

---

## Troubleshooting
### Common Issues & Fixes
**1. Formatting is incorrect**  
- Ensure `processWordHtml` is correctly handling `innerHTML`.  
- Debug with `console.log(text)` before formatting.

**2. Undo/Redo doesn't work**  
- Ensure history state is properly updated when the text changes.

---

## Contributing
1. **Fork the repo**  
2. **Create a new branch** (`git checkout -b feature-name`)  
3. **Make your changes** and commit (`git commit -m "Added new feature"`)  
4. **Push** to your fork and submit a **Pull Request**  

---

## License
This project is **open-source** under the [MIT License](LICENSE).

---

## Acknowledgments
Built by **Nico**. 

---

Have a suggestion? Open an issue or create a pull request.  
