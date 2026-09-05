import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MarkdownBody.css";

/**
 * Renders model output as Markdown inside an AIResponseCard.
 *
 * Real NAI/OpenRouter completions often return headings, lists, and
 * emphasis. Simulated fixtures are mostly plain paragraphs — those
 * still render as normal text.
 */
export function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="ai-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeMarkdown(children)}</ReactMarkdown>
    </div>
  );
}

/** Split jammed list markers / headings so GFM can parse them. */
export function normalizeMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\s+(#{1,6}\s)/g, "$1\n\n$2")
    .replace(/([^\n])\s+\*\s+\*\*/g, "$1\n* **")
    .replace(/([^\n])\s+-\s+\*\*/g, "$1\n- **")
    .trim();
}
