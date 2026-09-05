import type { ReactNode } from "react";
import { Icon } from "@/icons";

type DisclaimerBarProps = {
  children?: ReactNode;
};

/**
 * "Draft — not evidence" disclaimer bar.
 *
 * RULE: every AI-generated artifact that an officer could mistake for
 * a finalized record MUST be visually wrapped in this disclaimer until
 * the officer explicitly accepts and signs it.
 *
 * See docs/AI-PATTERNS.md §"Disclaimers & accountability".
 */
export function DisclaimerBar({ children }: DisclaimerBarProps) {
  return (
    <div className="ai-disclaimer ai-disclaimer--inline" role="note">
      <Icon name="alert" size={16} />
      <span>
        {children ?? (
          <>
            AI-generated draft. Not evidence. Not yet part of the record.
            Officer review required before submission.
          </>
        )}
      </span>
    </div>
  );
}
