type StreamingIndicatorProps = {
  label?: string;
};

/**
 * Three-dot pulsing indicator used while an AI response is streaming.
 *
 * Animation is deliberately small (5px dots) so it does not feel like a
 * loading screen. The AISP aesthetic is utilitarian — overt loading
 * spinners would clash with everything else.
 */
export function StreamingIndicator({
  label = "Generating",
}: StreamingIndicatorProps) {
  return (
    <span className="ai-streaming" role="status" aria-live="polite">
      <span>{label}</span>
      <span className="ai-streaming__dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}
