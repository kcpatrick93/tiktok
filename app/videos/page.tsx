'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Eye, TrendingUp, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Video {
  id: string;
  title: string;
  post_date: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avg_watch_seconds: number | null;
  full_watch_rate: number | null;
  traffic_foryou_pct: number | null;
  traffic_search_pct: number | null;
  traffic_profile_pct: number | null;
  product_tag: string | null;
  format_tag: string | null;
  sales: number | null;
  commission: number | null;
  gmv: number | null;
  gpm: number | null;
}

interface Product {
  id: number;
  name: string;
}

function gpmColor(gpm: number | null): string {
  if (gpm === null) return 'text-zinc-500';
  if (gpm >= 2.0) return 'text-emerald-400';
  if (gpm >= 0.5) return 'text-amber-400';
  return 'text-red-400';
}

function gpmBg(gpm: number | null): string {
  if (gpm === null) return 'bg-zinc-800';
  if (gpm >= 2.0) return 'bg-emerald-500/10';
  if (gpm >= 0.5) return 'bg-amber-500/10';
  return 'bg-red-500/10';
}

function VideoDetailModal({ video, tiktokUsername, onClose }: { video: Video; tiktokUsername: string | null; onClose: () => void }) {
  const daysAgo = Math.round(
    (Date.now() - new Date(video.post_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-end">
      <div className="w-full bg-zinc-900 rounded-t-3xl max-h-[85dvh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 px-4 pt-4 pb-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100 flex-1 pr-4 line-clamp-1">
            {video.title}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={tiktokUsername
                ? `https://www.tiktok.com/@${tiktokUsername}/video/${video.id}`
                : `https://www.tiktok.com/search?q=${encodeURIComponent(video.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-full bg-zinc-800 flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              TikTok
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center active:bg-zinc-700"
            >
              <X size={16} className="text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Thumbnail + basic info */}
          <div className="flex gap-3">
            <div className="w-20 h-28 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
              {video.thumbnail_url ? (
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  width={80}
                  height={112}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${gpmBg(video.gpm)}`}>
                <TrendingUp size={14} className={gpmColor(video.gpm)} />
                <span className={`text-base font-bold ${gpmColor(video.gpm)}`}>
                  {video.gpm != null ? `£${video.gpm.toFixed(2)}` : '—'} GPM
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Posted {daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`}
              </p>
              {video.product_tag && (
                <p className="text-xs">
                  <span className="text-zinc-500">Product: </span>
                  <span className="text-zinc-200">{video.product_tag}</span>
                </p>
              )}
              {video.format_tag && (
                <p className="text-xs">
                  <span className="text-zinc-500">Format: </span>
                  <span className="text-zinc-200">{video.format_tag}</span>
                </p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Views', value: video.views.toLocaleString() },
              { label: 'Likes', value: video.likes.toLocaleString() },
              { label: 'Comments', value: video.comments.toLocaleString() },
              { label: 'Shares', value: video.shares.toLocaleString() },
              {
                label: 'Sales',
                value: video.sales != null ? String(video.sales) : '—',
              },
              {
                label: 'GMV',
                value: video.gmv != null ? `£${video.gmv.toFixed(2)}` : '—',
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-800 rounded-xl p-3 text-center">
                <p className="text-xs text-zinc-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-zinc-100">{value}</p>
              </div>
            ))}
          </div>

          {/* Commission + rate */}
          {video.commission != null && (
            <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Commission</p>
                <p className="text-sm font-semibold text-zinc-100">
                  £{video.commission.toFixed(2)}
                </p>
              </div>
              {video.gmv != null && video.gmv > 0 && (() => {
                const rate = (video.commission / video.gmv) * 100;
                const color =
                  rate >= 8
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : rate >= 4
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-red-500/15 text-red-400';
                return (
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${color}`}>
                    {rate.toFixed(1)}% rate
                  </div>
                );
              })()}
            </div>
          )}

          {/* Watch time */}
          <div className="bg-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500 mb-2">Watch Performance</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-400">Avg watch time</p>
                <p className="text-sm font-semibold text-zinc-100 mt-0.5">
                  {video.avg_watch_seconds != null
                    ? `${video.avg_watch_seconds.toFixed(1)}s`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Full watch rate</p>
                <p className="text-sm font-semibold text-zinc-100 mt-0.5">
                  {video.full_watch_rate != null
                    ? `${(video.full_watch_rate * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Traffic sources */}
          {(video.traffic_foryou_pct != null ||
            video.traffic_search_pct != null ||
            video.traffic_profile_pct != null) && (
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-xs text-zinc-500 mb-2">Traffic Sources</p>
              <div className="space-y-2">
                {[
                  { label: 'For You', value: video.traffic_foryou_pct },
                  { label: 'Search', value: video.traffic_search_pct },
                  { label: 'Profile', value: video.traffic_profile_pct },
                ]
                  .filter(({ value }) => value != null)
                  .map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 w-14">{label}</span>
                      <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500 rounded-full"
                          style={{ width: `${((value ?? 0) * 100).toFixed(1)}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-300 w-10 text-right">
                        {((value ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DATE_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: 'all', label: 'All time' },
];

const SORT_OPTIONS = [
  { value: 'gpm', label: 'GPM' },
  { value: 'views', label: 'Views' },
  { value: 'sales', label: 'Sales' },
  { value: 'post_date', label: 'Date' },
];

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [tiktokUsername, setTiktokUsername] = useState<string | null>(null);

  const [productFilter, setProductFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [sortBy, setSortBy] = useState('gpm');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      days: dateRange,
      product: productFilter,
      format: formatFilter,
      sortBy,
    });
    try {
      const res = await fetch(`/api/videos?${params}`);
      const data = await res.json();
      setVideos(data);
    } finally {
      setLoading(false);
    }
  }, [dateRange, productFilter, formatFilter, sortBy]);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts);
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setTiktokUsername(d.tiktok_username || null));
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const sortedVideos = [...videos].sort((a, b) => {
    const mul = sortDir === 'desc' ? -1 : 1;
    if (sortBy === 'gpm') {
      if (a.gpm === null && b.gpm === null) return 0;
      if (a.gpm === null) return 1;
      if (b.gpm === null) return -1;
      return mul * (a.gpm - b.gpm);
    }
    if (sortBy === 'views') return mul * (a.views - b.views);
    if (sortBy === 'sales') {
      if (a.sales === null && b.sales === null) return 0;
      if (a.sales === null) return 1;
      if (b.sales === null) return -1;
      return mul * (a.sales - b.sales);
    }
    return mul * (new Date(a.post_date).getTime() - new Date(b.post_date).getTime());
  });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronDown size={12} className="text-zinc-600" />;
    return sortDir === 'desc' ? (
      <ChevronDown size={12} className="text-pink-400" />
    ) : (
      <ChevronUp size={12} className="text-pink-400" />
    );
  };

  const FORMAT_OPTIONS_FILTER = [
    'Shouty Hook',
    'Storytelling',
    'BOFU Text-Led',
    'Wife Skit',
    'Skit',
    'Other',
  ];

  return (
    <div className="min-h-dvh bg-zinc-950">
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-900 px-4 pt-12 pb-3">
        <h1 className="text-xl font-bold text-zinc-100">Videos</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{videos.length} videos</p>
      </div>

      {/* Filters */}
      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="shrink-0 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500"
        >
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="shrink-0 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500"
        >
          <option value="all">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          className="shrink-0 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500"
        >
          <option value="all">All formats</option>
          {FORMAT_OPTIONS_FILTER.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Sort header */}
      <div className="px-4 py-2 flex gap-2">
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => toggleSort(o.value)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortBy === o.value
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-transparent'
            }`}
          >
            {o.label}
            <SortIcon field={o.value} />
          </button>
        ))}
      </div>

      <div className="px-4 pb-28 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-zinc-900 rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : sortedVideos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No videos found.</p>
            <p className="text-zinc-600 text-xs mt-1">Try adjusting the filters.</p>
          </div>
        ) : (
          sortedVideos.map((video) => {
            const daysAgo = Math.round(
              (Date.now() - new Date(video.post_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="w-full bg-zinc-900 rounded-xl border border-zinc-800 p-3 flex items-center gap-3 active:bg-zinc-800 transition-colors text-left"
              >
                {/* Thumbnail */}
                <div className="w-10 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      width={40}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base">
                      🎵
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-100 truncate font-medium">{video.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Eye size={10} />
                      {video.views.toLocaleString()}
                    </span>
                    {video.format_tag && (
                      <span className="text-xs text-zinc-600 truncate">· {video.format_tag}</span>
                    )}
                    <span className="text-xs text-zinc-600 ml-auto shrink-0">{daysAgo}d</span>
                  </div>
                  {video.commission != null && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-zinc-400">
                        £{video.commission.toFixed(2)}
                      </span>
                      {video.gmv != null && video.gmv > 0 && (() => {
                        const rate = (video.commission / video.gmv) * 100;
                        const color =
                          rate >= 8
                            ? 'text-emerald-400'
                            : rate >= 4
                            ? 'text-amber-400'
                            : 'text-red-400';
                        return (
                          <span className={`text-xs font-semibold ${color}`}>
                            · {rate.toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* GPM badge */}
                <div
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold ${gpmBg(video.gpm)} ${gpmColor(video.gpm)}`}
                >
                  {video.gpm != null ? `£${video.gpm.toFixed(2)}` : '—'}
                </div>
              </button>
            );
          })
        )}
      </div>

      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          tiktokUsername={tiktokUsername}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
