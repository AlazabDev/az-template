import React from 'react';
import MermaidDiagram from './MermaidDiagram';

interface AgentMessageContentProps {
  content: string;
}

type MessageSegment =
  | { type: 'text'; value: string }
  | { type: 'mermaid'; value: string }
  | { type: 'code'; value: string; language: string };

const splitMessage = (content: string): MessageSegment[] => {
  const segments: MessageSegment[] = [];
  const pattern = /```(mermaid|[\w+-]*)\s*\n([\s\S]*?)```/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > cursor) segments.push({ type: 'text', value: content.slice(cursor, match.index) });
    const language = match[1].toLowerCase();
    segments.push(language === 'mermaid'
      ? { type: 'mermaid', value: match[2] }
      : { type: 'code', language, value: match[2] });
    cursor = match.index + match[0].length;
  }

  if (cursor < content.length) segments.push({ type: 'text', value: content.slice(cursor) });
  return segments.length ? segments : [{ type: 'text', value: content }];
};

const renderText = (value: string) => value
  .replace(/^### (.*$)/gm, '▌ $1')
  .replace(/^## (.*$)/gm, '▌ $1')
  .replace(/^# (.*$)/gm, '▌ $1');

const AgentMessageContent: React.FC<AgentMessageContentProps> = ({ content }) => (
  <div className="space-y-2 text-sm leading-7">
    {splitMessage(content).map((segment, index) => {
      if (segment.type === 'mermaid') return <MermaidDiagram key={`mermaid-${index}`} code={segment.value} />;
      if (segment.type === 'code') return <pre key={`code-${index}`} className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-left text-xs text-slate-100" dir="ltr"><code>{segment.value.trim()}</code></pre>;
      return <p key={`text-${index}`} className="whitespace-pre-wrap">{renderText(segment.value)}</p>;
    })}
  </div>
);

export default AgentMessageContent;
