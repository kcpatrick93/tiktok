'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface StatusData {
  authenticated: boolean;
  lastSync: string | null;
  autoSynced: boolean;
  tiktok_username: string | null;
}

export default function AuthBanner() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(console.error);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/sync', { method: 'POST' });
      const updated = await fetch('/api/status').then((r) => r.json());
      setStatus(updated);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveUsername = async () => {
    const trimmed = usernameInput.replace(/^@/, '').trim();
    if (!trimmed) return;
    setSavingUsername(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktok_username: trimmed }),
      });
      const data = await res.json();
      setStatus((prev) => prev ? { ...prev, tiktok_username: data.tiktok_username } : prev);
      setEditingUsername(false);
      setUsernameInput('');
    } finally {
      setSavingUsername(false);
    }
  };

  if (!status) return null;

  if (!status.authenticated) {
    return (
      <div className="mx-4 mb-4 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100">Connect your TikTok account</p>
            <p className="text-xs text-zinc-400 mt-0.5">Video data syncs automatically once connected.</p>
            <a
              href="/connect"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-pink-500 text-white text-sm font-semibold active:bg-pink-600"
            >
              Connect TikTok
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-2 space-y-2">
      {/* Sync row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle size={14} className="text-emerald-400" />
          <span className="text-xs text-zinc-400">
            {status.lastSync
              ? `Synced ${formatRelativeTime(status.lastSync)}`
              : 'Connected'}
          </span>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium active:bg-zinc-700 disabled:opacity-50"
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </div>

      {/* Username row — only shown if not set or being edited */}
      {(!status.tiktok_username || editingUsername) && (
        <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2.5">
          <span className="text-xs text-zinc-400 shrink-0">
            {status.tiktok_username ? 'Change @handle:' : '👆 Set your TikTok @handle to make thumbnails clickable:'}
          </span>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveUsername();
              if (e.key === 'Escape') { setEditingUsername(false); setUsernameInput(''); }
            }}
            placeholder="@yourhandle"
            autoFocus
            className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 placeholder-zinc-600"
          />
          <button
            onClick={handleSaveUsername}
            disabled={savingUsername || !usernameInput.trim()}
            className="shrink-0 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
          >
            {savingUsername ? '…' : 'Save'}
          </button>
          {editingUsername && (
            <button
              onClick={() => { setEditingUsername(false); setUsernameInput(''); }}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Show stored username with edit option */}
      {status.tiktok_username && !editingUsername && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500">@{status.tiktok_username}</span>
          <button
            onClick={() => { setEditingUsername(true); setUsernameInput(status.tiktok_username || ''); }}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2"
          >
            change
          </button>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
