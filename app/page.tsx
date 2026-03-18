'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { CheckCircle2, Eye, Calendar, Save, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import AuthBanner from '@/components/AuthBanner';

interface Video {
  id: string;
  title: string;
  post_date: string;
  thumbnail_url: string;
  views: number;
  product_tag: string | null;
  format_tag: string | null;
  sales: number | null;
  commission: number | null;
  gmv: number | null;
  sales_updated_at: string | null;
  transcript: string | null;
}

interface Product {
  id: number;
  name: string;
}

interface MonthlyStat {
  year_month: string;
  sales: number | null;
  gmv: number | null;
  commission: number | null;
}

interface ProductEntry {
  id: number;
  video_id: string;
  product_tag: string;
  sales: number | null;
  gmv: number | null;
  commission: number | null;
}

const FORMAT_OPTIONS = [
  'Shouty Hook',
  'Storytelling',
  'BOFU Text-Led',
  'Wife Skit',
  'Skit',
  'Other',
];

/** Generate list of "YYYY-MM" strings from startMonth to endMonth inclusive */
function generateMonthRange(startMonth: string, endMonth: string): string[] {
  const months: string[] = [];
  const [startYear, startMon] = startMonth.split('-').map(Number);
  const [endYear, endMon] = endMonth.split('-').map(Number);
  let year = startYear;
  let mon = startMon;
  while (year < endYear || (year === endYear && mon <= endMon)) {
    months.push(`${year}-${String(mon).padStart(2, '0')}`);
    mon += 1;
    if (mon > 12) {
      mon = 1;
      year += 1;
    }
  }
  return months;
}

function formatMonthLabel(yearMonth: string): string {
  const [year, mon] = yearMonth.split('-').map(Number);
  const d = new Date(year, mon - 1, 1);
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// ---- MonthlyStatsRow sub-component ----
function MonthlyStatsRow({
  videoId,
  yearMonth,
  initialData,
  onSaved,
}: {
  videoId: string;
  yearMonth: string;
  initialData: MonthlyStat | undefined;
  onSaved: (updated: MonthlyStat[]) => void;
}) {
  const [sales, setSales] = useState(
    initialData?.sales != null ? String(initialData.sales) : ''
  );
  const [gmv, setGmv] = useState(
    initialData?.gmv != null ? String(initialData.gmv) : ''
  );
  const [commission, setCommission] = useState(
    initialData?.commission != null ? String(initialData.commission) : ''
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset saved tick after 2s
  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/monthly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year_month: yearMonth,
          sales: sales !== '' ? Number(sales) : null,
          gmv: gmv !== '' ? Number(gmv) : null,
          commission: commission !== '' ? Number(commission) : null,
        }),
      });
      if (res.ok) {
        const updatedStats: MonthlyStat[] = await res.json();
        setSaved(true);
        onSaved(updatedStats);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-300">
          {formatMonthLabel(yearMonth)}
        </span>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-60'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 size={11} />
              Saved
            </>
          ) : saving ? (
            '…'
          ) : (
            <>
              <Save size={11} />
              Save
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-zinc-500 mb-1 block">Sales</label>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="0"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 placeholder-zinc-600"
          />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 mb-1 block">GMV (£)</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">
              £
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={gmv}
              onChange={(e) => setGmv(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-5 pr-2 py-2 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 placeholder-zinc-600"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 mb-1 block">Comm (£)</label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">
              £
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-5 pr-2 py-2 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 placeholder-zinc-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- ProductEntryRow sub-component ----
function ProductEntryRow({
  entry,
  products,
  videoId,
  onUpdated,
  onDeleted,
  onProductAdded,
}: {
  entry: ProductEntry;
  products: Product[];
  videoId: string;
  onUpdated: (updatedEntries: ProductEntry[]) => void;
  onDeleted: (updatedEntries: ProductEntry[]) => void;
  onProductAdded: (product: Product) => void;
}) {
  const isNew = entry.id < 0;
  const [productTag, setProductTag] = useState(entry.product_tag || '');
  const [sales, setSales] = useState(entry.sales != null ? String(entry.sales) : '');
  const [gmv, setGmv] = useState(entry.gmv != null ? String(entry.gmv) : '');
  const [commission, setCommission] = useState(
    entry.commission != null ? String(entry.commission) : ''
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Inline "add new product" state
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [addingProductLoading, setAddingProductLoading] = useState(false);
  const newProductInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const handleProductSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__add_new__') {
      setAddingProduct(true);
      setNewProductName('');
      setTimeout(() => newProductInputRef.current?.focus(), 0);
    } else {
      setProductTag(val);
    }
  };

  const handleAddProductConfirm = async () => {
    const trimmed = newProductName.trim();
    if (!trimmed) {
      setAddingProduct(false);
      return;
    }
    setAddingProductLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const newProduct: Product = await res.json();
        onProductAdded(newProduct);
        setProductTag(newProduct.name);
      }
    } finally {
      setAddingProductLoading(false);
      setAddingProduct(false);
      setNewProductName('');
    }
  };

  const handleAddProductKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddProductConfirm();
    else if (e.key === 'Escape') {
      setAddingProduct(false);
      setNewProductName('');
    }
  };

  const handleSave = async () => {
    if (!productTag) return;
    setSaving(true);
    try {
      const payload = {
        product_tag: productTag,
        sales: sales !== '' ? Number(sales) : null,
        gmv: gmv !== '' ? Number(gmv) : null,
        commission: commission !== '' ? Number(commission) : null,
      };

      if (isNew) {
        const res = await fetch(`/api/videos/${videoId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updatedEntries: ProductEntry[] = await res.json();
          setSaved(true);
          onUpdated(updatedEntries);
        }
      } else {
        const res = await fetch(`/api/videos/${videoId}/products`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: entry.id, ...payload }),
        });
        if (res.ok) {
          const updatedEntries: ProductEntry[] = await res.json();
          setSaved(true);
          onUpdated(updatedEntries);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      // Remove local-only blank row without API call
      onDeleted([]);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/products`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id }),
      });
      if (res.ok) {
        const updatedEntries: ProductEntry[] = await res.json();
        onDeleted(updatedEntries);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 py-1">
      {/* Product dropdown / add new input */}
      <div className="flex-1 min-w-0">
        {addingProduct ? (
          <div className="flex gap-1">
            <input
              ref={newProductInputRef}
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              onKeyDown={handleAddProductKeyDown}
              placeholder="Product name…"
              disabled={addingProductLoading}
              className="flex-1 min-w-0 bg-zinc-800 border border-pink-500 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none placeholder-zinc-600 disabled:opacity-60"
            />
            <button
              onClick={handleAddProductConfirm}
              disabled={addingProductLoading}
              className="shrink-0 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors"
            >
              {addingProductLoading ? '…' : '✓'}
            </button>
          </div>
        ) : (
          <select
            value={productTag}
            onChange={handleProductSelectChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500"
          >
            <option value="">Select…</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
            <option value="__add_new__">＋ Add new product…</option>
          </select>
        )}
      </div>

      {/* Sales */}
      <input
        type="number"
        min="0"
        inputMode="numeric"
        placeholder="Sales"
        value={sales}
        onChange={(e) => setSales(e.target.value)}
        className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg px-1.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 placeholder-zinc-600"
      />

      {/* GMV */}
      <div className="relative w-16">
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">£</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          value={gmv}
          onChange={(e) => setGmv(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-4 pr-1 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 placeholder-zinc-600"
        />
      </div>

      {/* Commission */}
      <div className="relative w-16">
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">£</span>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-4 pr-1 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 placeholder-zinc-600"
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || saved || !productTag}
        className={`shrink-0 flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          saved
            ? 'bg-emerald-600 text-white'
            : 'bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-40'
        }`}
      >
        {saved ? <CheckCircle2 size={11} /> : saving ? '…' : <Save size={11} />}
      </button>

      {/* Remove button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 disabled:opacity-40"
      >
        {deleting ? '…' : '×'}
      </button>
    </div>
  );
}

// ---- ProductEntriesSection sub-component ----
function ProductEntriesSection({
  videoId,
  products,
  onEntriesChanged,
  onProductAdded,
}: {
  videoId: string;
  products: Product[];
  onEntriesChanged: () => void;
  onProductAdded: (product: Product) => void;
}) {
  const [entries, setEntries] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/videos/${videoId}/products`)
      .then((r) => r.json())
      .then((data: ProductEntry[]) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [videoId]);

  const handleUpdated = useCallback(
    (updatedEntries: ProductEntry[]) => {
      setEntries(updatedEntries);
      onEntriesChanged();
    },
    [onEntriesChanged]
  );

  const handleDeleted = useCallback(
    (updatedEntries: ProductEntry[], deletedId?: number) => {
      if (deletedId != null && deletedId < 0) {
        // Remove local blank row
        setEntries((prev) => prev.filter((e) => e.id !== deletedId));
      } else {
        setEntries(updatedEntries);
        onEntriesChanged();
      }
    },
    [onEntriesChanged]
  );

  const handleAddProduct = () => {
    const blankEntry: ProductEntry = {
      id: -Date.now(),
      video_id: videoId,
      product_tag: '',
      sales: null,
      gmv: null,
      commission: null,
    };
    setEntries((prev) => [...prev, blankEntry]);
  };

  const totalSales = entries.filter((e) => e.id > 0).reduce((s, e) => s + (e.sales ?? 0), 0);
  const totalGmv = entries.filter((e) => e.id > 0).reduce((s, e) => s + (e.gmv ?? 0), 0);
  const totalCommission = entries.filter((e) => e.id > 0).reduce((s, e) => s + (e.commission ?? 0), 0);
  const hasMultiple = entries.filter((e) => e.id > 0).length > 1;

  if (loading) {
    return <div className="h-8 bg-zinc-800/50 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-0.5">
      {entries.map((entry) => (
        <ProductEntryRow
          key={entry.id}
          entry={entry}
          products={products}
          videoId={videoId}
          onUpdated={handleUpdated}
          onDeleted={(updatedEntries) => {
            if (entry.id < 0) {
              handleDeleted(updatedEntries, entry.id);
            } else {
              handleDeleted(updatedEntries);
            }
          }}
          onProductAdded={onProductAdded}
        />
      ))}

      <button
        onClick={handleAddProduct}
        className="text-xs text-pink-400 hover:text-pink-300 transition-colors pt-1"
      >
        + Add product
      </button>

      {hasMultiple && (
        <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
          Total: {totalSales} sales · £{totalGmv.toFixed(2)} GMV · £{totalCommission.toFixed(2)} commission
        </div>
      )}
    </div>
  );
}

// ---- VideoCard ----
function VideoCard({
  video,
  products,
  tiktokUsername,
  onSaved,
  onDeleted,
  onProductAdded,
}: {
  video: Video;
  products: Product[];
  tiktokUsername: string | null;
  onSaved: (id: string) => void;
  onDeleted: (id: string) => void;
  onProductAdded: (product: Product) => void;
}) {
  const [format, setFormat] = useState(video.format_tag || '');
  const [formatSaving, setFormatSaving] = useState(false);
  const [formatSaved, setFormatSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState(video.transcript || '');
  const [transcriptSaving, setTranscriptSaving] = useState(false);
  const [transcriptSaved, setTranscriptSaved] = useState(false);
  const hasExistingData = video.sales != null || video.commission != null;

  // Monthly breakdown state
  const videoMonth = new Date(video.post_date).toISOString().slice(0, 7);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const isOldVideo = videoMonth < currentMonth;

  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [monthlyLoaded, setMonthlyLoaded] = useState(false);

  useEffect(() => {
    if (!isOldVideo) return;
    fetch(`/api/videos/${video.id}/monthly`)
      .then((r) => r.json())
      .then((data: MonthlyStat[]) => {
        setMonthlyStats(data);
        setMonthlyLoaded(true);
      })
      .catch(() => setMonthlyLoaded(true));
  }, [isOldVideo, video.id]);

  const monthRange = isOldVideo
    ? generateMonthRange(videoMonth, currentMonth)
    : [];

  // Derive totals from monthly stats
  const totalSales = monthlyStats.reduce((s, r) => s + (r.sales ?? 0), 0);
  const totalGmv = monthlyStats.reduce((s, r) => s + (r.gmv ?? 0), 0);
  const totalCommission = monthlyStats.reduce(
    (s, r) => s + (r.commission ?? 0),
    0
  );
  const hasAnyMonthlyData = monthlyStats.length > 0;

  const handleMonthlySaved = useCallback((updated: MonthlyStat[]) => {
    setMonthlyStats(updated);
    onSaved(video.id);
  }, [onSaved, video.id]);

  const handleFormatChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    setFormat(newFormat);
    setFormatSaving(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format_tag: newFormat || null }),
      });
      if (res.ok) {
        setFormatSaved(true);
        setTimeout(() => setFormatSaved(false), 2000);
        onSaved(video.id);
      }
    } finally {
      setFormatSaving(false);
    }
  };

  const handleTranscriptSave = async () => {
    setTranscriptSaving(true);
    try {
      await fetch(`/api/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript || null }),
      });
      setTranscriptSaved(true);
      setTimeout(() => setTranscriptSaved(false), 2000);
    } finally {
      setTranscriptSaving(false);
    }
  };

  const daysAgo = Math.round(
    (Date.now() - new Date(video.post_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const postLabel =
    daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  const updatedBadge = (() => {
    if (!video.sales_updated_at) return null;
    const d = Math.round(
      (Date.now() - new Date(video.sales_updated_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (d === 0) return 'Updated today';
    if (d === 1) return 'Updated yesterday';
    return `Updated ${d} days ago`;
  })();

  // Commission rate badge — derived from monthly totals (old) or product entries (new)
  // For old videos we still compute from monthly stats; for new videos we show nothing
  // here since ProductEntriesSection handles it inline.
  const commissionRateBadge = (() => {
    if (!isOldVideo) return null;
    const gmvNum = totalGmv > 0 ? totalGmv : null;
    const commNum = totalCommission > 0 ? totalCommission : null;
    if (gmvNum != null && commNum != null && gmvNum > 0) {
      const rate = (commNum / gmvNum) * 100;
      const color =
        rate >= 8
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          : rate >= 4
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          : 'bg-red-500/15 text-red-400 border-red-500/30';
      return { rate, color };
    }
    return null;
  })();

  return (
    <div
      className={`bg-zinc-900 rounded-2xl overflow-hidden border transition-all duration-300 ${
        'border-zinc-800'
      }`}
    >
      <div className="flex gap-3 p-4">
        <a
          href={tiktokUsername
            ? `https://www.tiktok.com/@${tiktokUsername}/video/${video.id}`
            : `https://www.tiktok.com/search?q=${encodeURIComponent(video.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-20 rounded-lg overflow-hidden bg-zinc-800 shrink-0 relative group block"
          title={tiktokUsername ? 'Open in TikTok' : 'Set your @handle to link directly'}
        >
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title}
              width={64}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-zinc-600 text-2xl">🎵</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        </a>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 flex-1">
              {video.title}
            </p>
            {/* Delete button */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="shrink-0 p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                title="Delete video"
              >
                <Trash2 size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={async () => {
                    setDeleting(true);
                    await fetch(`/api/videos/${video.id}`, { method: 'DELETE' });
                    onDeleted(video.id);
                  }}
                  disabled={deleting}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg font-semibold disabled:opacity-60"
                >
                  {deleting ? '…' : 'Delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Calendar size={11} />
              {postLabel}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Eye size={11} />
              {video.views.toLocaleString()}
            </span>
            {isOldVideo && (
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                Monthly breakdown
              </span>
            )}
            {updatedBadge ? (
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                {updatedBadge}
              </span>
            ) : hasExistingData ? null : (
              <span className="text-xs text-zinc-600 italic">Not yet entered</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Format dropdown — always shown */}
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Format</label>
          <div className="flex items-center gap-2">
            <select
              value={format}
              onChange={handleFormatChange}
              disabled={formatSaving}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-pink-500 disabled:opacity-60"
            >
              <option value="">Select…</option>
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {formatSaved && (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            )}
          </div>
        </div>

        {isOldVideo ? (
          /* ---- OLD VIDEOS: Products section + monthly breakdown ---- */
          <>
            {/* Products section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-zinc-400">Products</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <ProductEntriesSection
                videoId={video.id}
                products={products}
                onEntriesChanged={() => onSaved(video.id)}
                onProductAdded={onProductAdded}
              />
            </div>

            {/* Monthly breakdown */}
            {!monthlyLoaded ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-zinc-800/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {monthRange.map((ym) => {
                  const existing = monthlyStats.find((s) => s.year_month === ym);
                  return (
                    <MonthlyStatsRow
                      key={ym}
                      videoId={video.id}
                      yearMonth={ym}
                      initialData={existing}
                      onSaved={handleMonthlySaved}
                    />
                  );
                })}

                {/* Totals row */}
                {hasAnyMonthlyData && (
                  <div className="rounded-xl border border-zinc-700/30 bg-zinc-800/20 px-3 py-2.5">
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <span className="text-xs font-medium text-zinc-500">Total</span>
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-600 mb-0.5">Sales</p>
                        <p className="text-xs font-semibold text-zinc-400">
                          {totalSales}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-600 mb-0.5">GMV</p>
                        <p className="text-xs font-semibold text-zinc-400">
                          £{totalGmv.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-600 mb-0.5">Comm</p>
                        <p className="text-xs font-semibold text-zinc-400">
                          £{totalCommission.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {commissionRateBadge && (
                      <div className="mt-2 flex justify-end">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${commissionRateBadge.color}`}
                        >
                          {commissionRateBadge.rate.toFixed(1)}% commission rate
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* ---- NEW VIDEOS: Product entries are the sole source of truth ---- */
          <>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-zinc-500">Products</span>
              </div>
              {/* Column headers */}
              <div className="flex items-center gap-1.5 mb-1 px-0">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-zinc-600">Product</span>
                </div>
                <div className="w-14 text-center">
                  <span className="text-[10px] text-zinc-600">Sales</span>
                </div>
                <div className="w-16 text-center">
                  <span className="text-[10px] text-zinc-600">GMV</span>
                </div>
                <div className="w-16 text-center">
                  <span className="text-[10px] text-zinc-600">Comm</span>
                </div>
                {/* spacers for save + remove buttons */}
                <div className="w-7" />
                <div className="w-7" />
              </div>
              <ProductEntriesSection
                videoId={video.id}
                products={products}
                onEntriesChanged={() => onSaved(video.id)}
                onProductAdded={onProductAdded}
              />
            </div>
          </>
        )}

        {/* Transcript section */}
        <div className="border-t border-zinc-800 pt-3">
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>{transcript ? '📝 Script saved' : 'Add script / transcript'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-auto transition-transform ${showTranscript ? 'rotate-180' : ''}`}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showTranscript && (
            <div className="mt-2 space-y-2">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your script or TikTok auto-captions here…"
                rows={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-pink-500 placeholder-zinc-600 resize-none leading-relaxed"
              />
              <button
                onClick={handleTranscriptSave}
                disabled={transcriptSaving || transcriptSaved}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  transcriptSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-60'
                }`}
              >
                {transcriptSaved ? (
                  <><CheckCircle2 size={12} /> Saved</>
                ) : transcriptSaving ? '…' : (
                  <><Save size={12} /> Save script</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DailyUpdatePage() {
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [tiktokUsername, setTiktokUsername] = useState<string | null>(null);

  // Derive available months from allVideos
  const availableMonths = (() => {
    const seen = new Set<string>();
    const months: { value: string; label: string }[] = [];
    for (const v of allVideos) {
      const d = new Date(v.post_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!seen.has(key)) {
        seen.add(key);
        months.push({
          value: key,
          label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
        });
      }
    }
    return months;
  })();

  // Filter videos by selected month + search
  useEffect(() => {
    let filtered = allVideos;
    if (selectedMonth !== 'all') {
      filtered = filtered.filter((v) => {
        const d = new Date(v.post_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === selectedMonth;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((v) => v.title.toLowerCase().includes(q));
    }
    setVideos(filtered);
  }, [selectedMonth, search, allVideos]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, pRes, sRes] = await Promise.all([
        fetch('/api/videos?pendingOnly=true'),
        fetch('/api/products'),
        fetch('/api/settings'),
      ]);
      const [vData, pData, sData] = await Promise.all([vRes.json(), pRes.json(), sRes.json()]);
      setAllVideos(vData);
      setProducts(pData);
      setTiktokUsername(sData.tiktok_username || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVideoSaved = useCallback((id: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, sales_updated_at: new Date().toISOString() } : v
      )
    );
  }, []);

  const handleVideoDeleted = useCallback((id: string) => {
    setAllVideos((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const handleProductAdded = useCallback((newProduct: Product) => {
    setProducts((prev) => {
      if (prev.some((p) => p.id === newProduct.id)) return prev;
      return [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name));
    });
  }, []);

  const totalShown = videos.length;
  const withSalesData = videos.filter((v) => v.sales != null).length;

  return (
    <div className="min-h-dvh bg-zinc-950">
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-900 px-4 pt-12 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-zinc-100">Daily Update</h1>
          {availableMonths.length > 1 && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-pink-500"
            >
              <option value="all">All time</option>
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by caption…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-8 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          )}
        </div>
        {totalShown > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${totalShown > 0 ? (withSalesData / totalShown) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs text-zinc-400 shrink-0">
              {withSalesData} of {totalShown} have sales data
            </span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-28 space-y-4">
        <AuthBanner />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">No videos found</h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs">
              No videos from the last 365 days. Sync your TikTok account to get started.
            </p>
          </div>
        ) : (
          videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              products={products}
              tiktokUsername={tiktokUsername}
              onSaved={handleVideoSaved}
              onDeleted={handleVideoDeleted}
              onProductAdded={handleProductAdded}
            />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
