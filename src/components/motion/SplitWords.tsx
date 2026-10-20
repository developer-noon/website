import type { ElementType } from 'react';

/**
 * Renders text as separately animatable words (picked up by PageMotion via `data-fx="words"`).
 * Splitting happens in markup, not by mutating the DOM, so React stays in control.
 * Screen readers get the sentence once through `aria-label`.
 */
export default function SplitWords({ text, as: Tag = 'span', className = '' }: { text: string; as?: ElementType; className?: string }) {
  const words = text.split(' ');
  return (
    <Tag className={className} aria-label={text} data-fx="words">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} aria-hidden="true" className="inline-block overflow-hidden py-[0.12em] -my-[0.12em] align-bottom">
          <span data-word className="inline-block will-change-transform">{word}</span>
          {index < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
