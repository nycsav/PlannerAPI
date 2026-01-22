import { useMakeRenderFunction } from "@copilotkit/react-core";
import { FileText, Zap, Target, ExternalLink, BookOpen } from "lucide-react";

export function IntelligenceBriefRenderer() {
  useMakeRenderFunction({
    name: "intelligence-brief",
    render: ({ data, status }) => {
      if (status !== "complete") {
        return (
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-6 bg-bureau-border rounded w-3/4"></div>
            <div className="h-4 bg-bureau-border rounded w-full"></div>
            <div className="h-4 bg-bureau-border rounded w-5/6"></div>
            <div className="h-4 bg-bureau-border rounded w-4/6"></div>
          </div>
        );
      }

      const { summary, signals, actions, frameworks, sources } = data;

      return (
        <div className="intelligence-brief-card border-2 border-bureau-border rounded-sm bg-white p-6 space-y-8 shadow-sm">
          {/* Summary Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-bureau-signal" />
              <h3 className="font-display text-sm font-bold text-planner-navy uppercase tracking-wide">
                Summary
              </h3>
            </div>
            <p className="font-sans text-base text-bureau-ink leading-relaxed">
              {summary}
            </p>
          </section>

          {/* Key Signals Section */}
          {signals && signals.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-bureau-signal" />
                <h3 className="font-display text-sm font-bold text-planner-navy uppercase tracking-wide">
                  Key Signals
                </h3>
              </div>
              <ul className="space-y-3">
                {signals.map((signal: any, i: number) => (
                  <li
                    key={i}
                    className="font-sans text-base text-bureau-ink flex items-start gap-3 leading-relaxed"
                  >
                    <span className="text-bureau-signal font-bold mt-0.5 shrink-0">•</span>
                    <span>{typeof signal === 'string' ? signal : signal.summary || signal.title || 'Signal'}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Moves for Leaders Section */}
          {actions && actions.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-bureau-signal" />
                <h3 className="font-display text-sm font-bold text-planner-navy uppercase tracking-wide">
                  Moves for Leaders
                </h3>
              </div>
              <ul className="space-y-3">
                {actions.map((action: any, i: number) => (
                  <li
                    key={i}
                    className="font-sans text-base text-bureau-ink flex items-start gap-3 leading-relaxed"
                  >
                    <span className="text-bureau-signal font-bold mt-0.5 shrink-0">•</span>
                    <span>{typeof action === 'string' ? action : action.description || action.title || 'Action'}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Sources Section */}
          {sources && sources.length > 0 && (
            <section className="border-t-2 border-bureau-border pt-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-bureau-signal" />
                <h3 className="font-display text-sm font-bold text-planner-navy uppercase tracking-wide">
                  Sources
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sources.map((src: any, i: number) => {
                  const url = src.url || src.sourceUrl || '#';
                  const title = src.title || src.sourceName || `Source ${i + 1}`;

                  let hostname = '';
                  try {
                    hostname = new URL(url).hostname;
                  } catch {
                    hostname = url;
                  }

                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 p-3 rounded-sm border border-bureau-border hover:border-bureau-signal hover:bg-blue-50 transition-all"
                    >
                      <span className="font-mono text-xs font-bold text-bureau-signal shrink-0 mt-0.5">
                        [{i + 1}]
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-sm font-semibold text-bureau-ink group-hover:text-bureau-signal line-clamp-2 mb-1">
                          {title}
                        </p>
                        <p className="font-mono text-xs text-bureau-slate truncate">
                          {hostname}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-bureau-slate group-hover:text-bureau-signal shrink-0 mt-1" />
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Frameworks Section (if provided) */}
          {frameworks && frameworks.length > 0 && (
            <section className="border-t-2 border-bureau-border pt-6">
              <h3 className="font-display text-sm font-bold text-planner-navy uppercase tracking-wide mb-4">
                Strategic Frameworks
              </h3>
              <div className="space-y-4">
                {frameworks.map((framework: any, i: number) => (
                  <div key={i} className="p-4 border border-bureau-border rounded-sm">
                    <h4 className="font-display text-xs font-bold text-bureau-slate uppercase tracking-wider mb-2">
                      {framework.label || `Framework ${i + 1}`}
                    </h4>
                    {framework.actions && framework.actions.length > 0 && (
                      <ul className="space-y-2">
                        {framework.actions.map((action: string, j: number) => (
                          <li key={j} className="font-sans text-sm text-bureau-ink flex items-start gap-2">
                            <span className="text-bureau-signal">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }
  });

  return null;
}
