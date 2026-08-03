import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { CalendarDays, GitBranch } from "lucide-react";

/** Turn [[Full Name]] mentions into links to the family tree. */
function linkifyMembers(text: string) {
  return text.replace(/\[\[([^\]]+)\]\]/g, (_m, name: string) => {
    const clean = String(name).trim();
    return `[${clean}](/family-tree?member=${encodeURIComponent(clean)})`;
  });
}

function TreeDiagram({ text }: { text: string }) {
  return (
    <div className="my-3 rounded-xl border border-border bg-background/60 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
        <GitBranch className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Family lineage</span>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] sm:text-xs leading-5 font-mono text-foreground whitespace-pre">
        {text.replace(/\n$/, "")}
      </pre>
    </div>
  );
}

function Timeline({ text }: { text: string }) {
  const rows = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("|");
      return i === -1
        ? { year: "", event: l }
        : { year: l.slice(0, i).trim(), event: l.slice(i + 1).trim() };
    });

  return (
    <div className="my-3 rounded-xl border border-border bg-background/60 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50">
        <CalendarDays className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Timeline</span>
      </div>
      <ol className="p-4 space-y-3">
        {rows.map((r, i) => (
          <li key={i} className="relative pl-6">
            <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-primary" />
            {i < rows.length - 1 && (
              <span className="absolute left-[4px] top-4 bottom-[-14px] w-px bg-border" />
            )}
            <p className="text-xs font-semibold text-primary">{r.year}</p>
            <p className="text-sm text-foreground leading-relaxed">{r.event}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const MaggieMessage = ({ content }: { content: string }) => (
  <div className="text-sm leading-relaxed text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) =>
          href?.startsWith("/") ? (
            <Link to={href} className="text-primary font-medium underline underline-offset-2">
              {children}
            </Link>
          ) : (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
              {children}
            </a>
          ),
        h1: ({ children }) => <h3 className="font-display text-base font-semibold mt-3 mb-1">{children}</h3>,
        h2: ({ children }) => <h3 className="font-display text-base font-semibold mt-3 mb-1">{children}</h3>,
        h3: ({ children }) => <h4 className="font-display text-sm font-semibold mt-3 mb-1">{children}</h4>,
        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="w-full text-xs border border-border rounded-lg">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="border border-border px-2 py-1 bg-muted/50 text-left">{children}</th>,
        td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
        code: ({ className, children, ...props }: any) => {
          const lang = /language-(\w+)/.exec(className || "")?.[1];
          const text = String(children ?? "");
          if (lang === "tree") return <TreeDiagram text={text} />;
          if (lang === "timeline") return <Timeline text={text} />;
          if (!className) {
            return (
              <code className="px-1 py-0.5 rounded bg-muted text-[0.85em] font-mono" {...props}>
                {children}
              </code>
            );
          }
          return (
            <pre className="my-2 p-3 rounded-xl bg-muted overflow-x-auto text-xs font-mono whitespace-pre">
              {text.replace(/\n$/, "")}
            </pre>
          );
        },
      }}
    >
      {linkifyMembers(content)}
    </ReactMarkdown>
  </div>
);
