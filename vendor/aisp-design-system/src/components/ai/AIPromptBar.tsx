import {
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon } from "@/icons";

type AIPromptBarProps = {
  placeholder?: string;
  hint?: ReactNode;
  disabled?: boolean;
  busy?: boolean;
  /** Buttons rendered before the Send button (e.g. source selector trigger). */
  leftActions?: ReactNode;
  /** Called when the user submits a prompt (Enter or Send). */
  onSubmit: (prompt: string) => void;
};

/**
 * Prompt input where the officer composes an AI request.
 *
 * Submits on Enter; Shift+Enter inserts a newline. The visible hint
 * line below the textarea is the canonical place to put the
 * "not-evidence" reminder for chat-style use cases.
 */
export function AIPromptBar({
  placeholder = "Ask AISP…",
  hint = "AI output is a draft. Verify against the underlying records before acting.",
  disabled,
  busy,
  leftActions,
  onSubmit,
}: AIPromptBarProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled || busy) return;
    onSubmit(trimmed);
    setValue("");
    ref.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="ai-prompt-bar">
        <textarea
          ref={ref}
          className="ai-prompt-bar__textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          disabled={disabled}
          aria-label="Prompt"
        />
        <div className="ai-prompt-bar__actions">
          {leftActions}
          <button
            type="submit"
            className="btn btn--ai btn--sm"
            disabled={disabled || busy || value.trim().length === 0}
            aria-label="Send prompt"
          >
            <Icon name="send" size={14} />
            Send
          </button>
        </div>
      </div>
      {hint && <div className="ai-prompt-bar__hint">{hint}</div>}
    </form>
  );
}
