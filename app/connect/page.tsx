'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ExternalLink, ClipboardPaste } from 'lucide-react';

type Step = 'start' | 'waiting' | 'paste' | 'done' | 'error';

export default function ConnectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('start');
  const [pastedUrl, setPastedUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const openTikTok = () => {
    window.open('/api/auth/tiktok', '_blank');
    setStep('waiting');
  };

  const extractCode = (input: string): string | null => {
    try {
      // Try treating it as a full URL
      const url = new URL(input.trim());
      const code = url.searchParams.get('code');
      if (code) return code;
    } catch {
      // Not a URL — maybe they pasted just the code directly
    }
    // If it looks like a raw code (no spaces, reasonable length), use it directly
    const trimmed = input.trim();
    if (trimmed && !trimmed.includes(' ') && trimmed.length > 10) {
      return trimmed;
    }
    return null;
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    const code = extractCode(pastedUrl);

    if (!code) {
      setErrorMsg('Could not find the code in that URL. Make sure you copied the full address bar URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.success) {
        setStep('done');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again from step 1.');
        setStep('error');
      }
    } catch {
      setErrorMsg('Network error. Make sure the app is running and try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔗</div>
          <h1 className="text-2xl font-bold text-zinc-100">Connect TikTok</h1>
          <p className="text-zinc-400 text-sm mt-2">One-time setup — takes about 60 seconds</p>
        </div>

        {/* Step 1 */}
        {(step === 'start' || step === 'waiting' || step === 'paste' || step === 'error') && (
          <div className={`rounded-2xl p-5 mb-4 border ${step === 'start' ? 'bg-zinc-900 border-pink-500' : 'bg-zinc-900 border-zinc-700'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step !== 'start' ? 'bg-emerald-500 text-white' : 'bg-pink-500 text-white'}`}>
                {step !== 'start' ? '✓' : '1'}
              </div>
              <h2 className="font-semibold text-zinc-100">Open TikTok Login</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-4 ml-11">
              This opens a TikTok login page in a new tab. Log in with your TikTok account and tap <strong className="text-zinc-200">Confirm</strong>.
            </p>
            <button
              onClick={openTikTok}
              className="ml-11 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-pink-500 text-white font-semibold text-sm active:bg-pink-600"
            >
              <ExternalLink size={16} />
              Open TikTok Login
            </button>
          </div>
        )}

        {/* Step 2 */}
        {(step === 'waiting' || step === 'paste' || step === 'error') && (
          <div className={`rounded-2xl p-5 mb-4 border ${step === 'waiting' ? 'bg-zinc-900 border-pink-500' : 'bg-zinc-900 border-zinc-700'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${(step === 'paste' || step === 'error') ? 'bg-emerald-500 text-white' : 'bg-pink-500 text-white'}`}>
                {(step === 'paste' || step === 'error') ? '✓' : '2'}
              </div>
              <h2 className="font-semibold text-zinc-100">After approving on TikTok</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-3 ml-11">
              You&apos;ll land on a Postman page that says <strong className="text-zinc-200">&quot;Your call is authenticated&quot;</strong>. That&apos;s fine — just look at your browser&apos;s address bar and copy the entire URL.
            </p>
            <div className="ml-11 rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-xs text-zinc-400 font-mono break-all mb-4">
              https://oauth.pstmn.io/v1/callback?<strong className="text-amber-400">code=abc123...</strong>&amp;state=xyz
            </div>
            {step === 'waiting' && (
              <button
                onClick={() => setStep('paste')}
                className="ml-11 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-700 text-white font-semibold text-sm active:bg-zinc-600"
              >
                I&apos;ve approved it — next step →
              </button>
            )}
          </div>
        )}

        {/* Step 3 */}
        {(step === 'paste' || step === 'error') && (
          <div className="rounded-2xl p-5 mb-4 border bg-zinc-900 border-pink-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-pink-500 text-white">
                3
              </div>
              <h2 className="font-semibold text-zinc-100">Paste the URL here</h2>
            </div>
            <div className="ml-11">
              <textarea
                className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none"
                rows={3}
                placeholder="Paste the full URL from your browser here..."
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
              />
              {errorMsg && (
                <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || !pastedUrl.trim()}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-pink-500 text-white font-semibold text-sm active:bg-pink-600 disabled:opacity-50"
              >
                <ClipboardPaste size={16} />
                {loading ? 'Connecting…' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="rounded-2xl p-8 border bg-emerald-900/30 border-emerald-500 text-center">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-emerald-300 mb-2">TikTok Connected!</h2>
            <p className="text-zinc-400 text-sm">Taking you to your dashboard…</p>
          </div>
        )}

        {/* Retry */}
        {step === 'error' && (
          <button
            onClick={() => { setStep('start'); setPastedUrl(''); setErrorMsg(''); }}
            className="w-full mt-2 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
