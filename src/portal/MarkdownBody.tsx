import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MarkdownBody.css";

/**
 * Renders model output as Markdown inside an AIResponseCard.
 *
 * Real NAI/OpenRouter completions often return headings, lists, and
 * emphasis. The design-system reset zeroes list-style globally, so this
 * wrapper puts bullets back for `.ai-md` only.
 */
export function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="ai-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeMarkdown(children)}</ReactMarkdown>
    </div>
  );
}

/**
 * Models often emit every bullet on one line (`... [1]. * **26-0043:**`).
 * Split those into real Markdown list items before parsing.
 */
export function normalizeMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\s+(#{1,6}\s)/g, "$1\n\n$2")
    .replace(/\s+[*-]\s+\*\*/g, "\n\n* **")
    .replace(/([.!?])\s+(\*\*\d[\d-]*\b)/g, "$1\n\n* $2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
