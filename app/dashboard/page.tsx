'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Trophy, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import AuthBanner from '@/components/AuthBanner';

interface DashboardData {
  thisMonth: {
    total_commission: number;
    total_sales: number;
    total_gmv: number;
    avg_watch_seconds: number;
  };
  lastMonth: {
    avg_watch_seconds: number;
  };
  bestGpm: { title: string; gpm: number } | null;
  products: Array<{
    product: string;
    total_commission: number;
    total_sales: number;
    total_gmv: number;
    avg_gpm: number;
    video_count: number;
  }>;
  formats: Array<{
    format: string;
    avg_gpm: number;
    avg_views: number;
    total_commission: number;
    total_gmv: number;
    video_count: number;
  }>;
  gpmOverTime: Array<{
    date: string;
    avg_gpm: number;
    video_count: number;
  }>;
}

function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500';

  return (
    <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      {sub && (
        <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
          {trend && <TrendIcon size={12} />}
          <span className="text-xs">{sub}</span>
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className="text-sm font-bold text-pink-400">£{payload[0].value.toFixed(2)} GPM</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const watchTrend =
    data && data.lastMonth.avg_watch_seconds > 0
      ? data.thisMonth.avg_watch_seconds > data.lastMonth.avg_watch_seconds
        ? 'up'
        : 'down'
      : 'neutral';

  const chartData = data?.gpmOverTime.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    gpm: parseFloat(d.avg_gpm.toFixed(2)),
  })) || [];

  return (
    <div className="min-h-dvh bg-zinc-950">
      <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-900 px-4 pt-12 pb-3">
        <h1 className="text-xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-xs text-zinc-500 mt-0.5">This month</p>
      </div>

      <div className="px-4 pt-4 pb-28 space-y-6">
        <AuthBanner />

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-zinc-900 rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          </div>
        ) : !data ? (
          <p className="text-center text-zinc-500 py-10">Failed to load data</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Commission"
                value={`£${data.thisMonth.total_commission.toFixed(2)}`}
              />
              <StatCard
                label="Total Sales"
                value={String(data.thisMonth.total_sales)}
              />
              <StatCard
                label="Total GMV"
                value={data.thisMonth.total_gmv > 0 ? `£${data.thisMonth.total_gmv.toFixed(2)}` : '—'}
                sub={
                  data.thisMonth.total_gmv > 0 && data.thisMonth.total_commission > 0
                    ? `${((data.thisMonth.total_commission / data.thisMonth.total_gmv) * 100).toFixed(1)}% commission rate`
                    : undefined
                }
              />
              <StatCard
                label="Best GPM Video"
                value={data.bestGpm ? `£${data.bestGpm.gpm.toFixed(2)}` : '—'}
                sub={data.bestGpm ? data.bestGpm.title.slice(0, 22) + (data.bestGpm.title.length > 22 ? '…' : '') : undefined}
              />
              <StatCard
                label="Avg Watch Time"
                value={
                  data.thisMonth.avg_watch_seconds
                    ? `${data.thisMonth.avg_watch_seconds.toFixed(1)}s`
                    : '—'
                }
                sub={
                  data.lastMonth.avg_watch_seconds > 0
                    ? `was ${data.lastMonth.avg_watch_seconds.toFixed(1)}s last month`
                    : undefined
                }
                trend={watchTrend}
              />
            </div>

            {/* GPM Chart */}
            {chartData.length > 0 && (
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-pink-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">GPM Over Time</h2>
                  <span className="text-xs text-zinc-500 ml-auto">Last 30 days</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#71717a' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `£${v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="gpm"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#ec4899', strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Products */}
            {data.products.length > 0 && (
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} className="text-amber-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">Top Products</h2>
                  <span className="text-xs text-zinc-500 ml-auto">by commission</span>
                </div>
                <div className="space-y-2">
                  {data.products.slice(0, 5).map((p, i) => (
                    <div key={p.product} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-600 w-4 shrink-0">{i + 1}</span>
                      <span className="text-sm text-zinc-200 flex-1 truncate">{p.product}</span>
                      {p.total_gmv > 0 && (
                        <div className="text-right shrink-0">
                          <p className="text-xs text-zinc-500">GMV</p>
                          <p className="text-sm font-semibold text-zinc-300">
                            £{p.total_gmv.toFixed(0)}
                          </p>
                        </div>
                      )}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-zinc-100">
                          £{p.total_commission.toFixed(2)}
                        </p>
                        <p className="text-xs text-zinc-500">{p.total_sales} sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Formats */}
            {data.formats.length > 0 && (
              <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-blue-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">Top Formats</h2>
                  <span className="text-xs text-zinc-500 ml-auto">avg GPM</span>
                </div>
                <div className="space-y-2">
                  {data.formats.map((f, i) => {
                    const commRate =
                      f.total_gmv > 0 ? (f.total_commission / f.total_gmv) * 100 : null;
                    const rateColor =
                      commRate == null
                        ? 'text-zinc-600'
                        : commRate >= 8
                        ? 'text-emerald-400'
                        : commRate >= 4
                        ? 'text-amber-400'
                        : 'text-red-400';
                    return (
                      <div key={f.format} className="flex items-center gap-3">
                        <span className="text-xs text-zinc-600 w-4 shrink-0">{i + 1}</span>
                        <span className="text-sm text-zinc-200 flex-1 truncate">{f.format}</span>
                        {commRate != null && (
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-semibold ${rateColor}`}>
                              {commRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-zinc-500">comm rate</p>
                          </div>
                        )}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-zinc-100">
                            £{f.avg_gpm.toFixed(2)}
                          </p>
                          <p className="text-xs text-zinc-500">avg GPM</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data.products.length === 0 && data.formats.length === 0 && (
              <div className="text-center py-10">
                <p className="text-zinc-500 text-sm">No data yet.</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Connect TikTok and enter sales data to see your dashboard.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
