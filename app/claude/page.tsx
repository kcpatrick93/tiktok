'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function ClaudePage() {
  const [report, setReport] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/claude', { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setReport(data.report);
        setGeneratedAt(data.generatedAt);
      }
    } catch {
      setError('Failed to connect. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  // Format report text into sections
  const formatReport = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold headers (lines starting with ** or ALL CAPS short lines)
      if (line.match(/^\*\*(.+)\*\*$/) || line.match(/^[A-Z][A-Z\s]+:$/)) {
        return (
          <p key={i} className="text-zinc-100 font-semibold text-sm mt-4 mb-1">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // Bullet points
      if (line.match(/^[-•*]\s/)) {
        return (
          <p key={i} className="text-zinc-300 text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-pink-400 leading-relaxed">
            {line.replace(/^[-•*]\s/, '')}
          </p>
        );
      }
      // Empty lines
      if (!line.trim()) return <div key={i} className="h-2" />;
      // Regular text
      return (
        <p key={i} className="text-zinc-300 text-sm leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-dvh bg-zinc-950">
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-900 px-4 pt-12 pb-3">
        <h1 className="text-xl font-bold text-zinc-100">Ask Claude</h1>
        <p className="text-xs text-zinc-500 mt-0.5">AI-powered performance analysis</p>
      </div>

      <div className="px-4 pt-6 pb-28 space-y-4">
        {/* Generate button */}
        <button
          onClick={generateReport}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold text-base flex items-center justify-center gap-3 active:opacity-90 disabled:opacity-70 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Analysing your data…
            </>
          ) : (
            <>
              <Sparkles size={20} />
              {report ? 'Generate New Report' : 'Generate Report'}
            </>
          )}
        </button>

        {loading && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-zinc-400">Claude is reviewing your last 30 days of data…</p>
            <p className="text-xs text-zinc-600 mt-1">This takes about 10 seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-sm text-red-400 font-medium">Something went wrong</p>
            <p className="text-xs text-red-400/70 mt-1">{error}</p>
          </div>
        )}

        {report && !loading && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Report header */}
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <Sparkles size={14} className="text-pink-400" />
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">
                Weekly Report
              </span>
              {formattedTime && (
                <span className="ml-auto flex items-center gap-1 text-xs text-zinc-500">
                  <Clock size={11} />
                  {formattedTime}
                </span>
              )}
            </div>

            {/* Report content */}
            <div className="px-4 py-4 space-y-0.5">
              {formatReport(report)}
            </div>
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-violet-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-200">Ready to analyse</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">
              Tap Generate Report to get a plain-English breakdown of what&apos;s working and what to film next.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
