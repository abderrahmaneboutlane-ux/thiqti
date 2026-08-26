"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Bold
        strong: ({ children }) => (
          <strong className="font-bold text-slate-900">{children}</strong>
        ),
        // Italic
        em: ({ children }) => (
          <em className="italic text-slate-700">{children}</em>
        ),
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-corporate underline decoration-corporate/30 underline-offset-2 transition hover:decoration-corporate"
          >
            {children}
          </a>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="mt-1 space-y-0.5 pl-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-1 space-y-0.5 list-decimal pl-4">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex gap-1.5 text-sm leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-corporate/40" />
            <span>{children}</span>
          </li>
        ),
        // Headers
        h1: ({ children }) => (
          <h1 className="mt-3 text-lg font-bold text-slate-900">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-2.5 text-base font-bold text-slate-900">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-2 text-sm font-bold text-slate-900">{children}</h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="text-sm leading-relaxed text-slate-700">{children}</p>
        ),
        // Code blocks
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="mt-2 block overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-xs text-slate-200">
                {children}
              </code>
            );
          }
          return (
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-corporate">
              {children}
            </code>
          );
        },
        // Pre (code blocks wrapper)
        pre: ({ children }) => (
          <pre className="mt-2">{children}</pre>
        ),
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="mt-2 border-l-4 border-corporate/30 pl-3 text-sm italic text-slate-500">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => <hr className="my-3 border-slate-200" />,
        // Tables (GitHub Flavored Markdown)
        table: ({ children }) => (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-slate-200">{children}</thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-slate-100 last:border-0">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left font-bold text-slate-900">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-slate-700">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
