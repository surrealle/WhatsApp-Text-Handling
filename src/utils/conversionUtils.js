export const convertToWhatsApp = (text) => {
  if (!text?.trim()) return "No content to format.";

  return text
    .split(/(?<=\n|^)(?=✅|❌|⚠️)/gm)
    .map((section) => {
      return section
        .replace(/\*\*(.*?)\*\*/g, "*$1*")
        .replace(/(?<!\*)\*((?!\*).+?)(?<!\*)\*/g, "_$1_")
        .replace(/^\* /gm, "• ");
    })
    .join("\n")
    .trim();
};
