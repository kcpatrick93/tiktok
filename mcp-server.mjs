#!/usr/bin/env node
/**
 * TikTok Dashboard MCP Server
 * Gives Claude Desktop direct read access to your dashboard SQLite database.
 *
 * Configure in ~/Library/Application Support/Claude/claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "tiktok-dashboard": {
 *       "command": "node",
 *       "args": ["/Users/kevinpatrick/Desktop/Claude Code/TikTok/tiktok-dashboard/mcp-server.mjs"]
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'dashboard.db');

function getDb() {
  const db = new Database(DB_PATH, { readonly: true });
  return db;
}

const server = new Server(
  { name: 'tiktok-dashboard', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_summary',
      description:
        'Get an overall summary of the TikTok dashboard: total videos, total commission earned, total sales, total GMV, and top-level stats.',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'get_top_videos',
      description:
        'Get the top performing videos sorted by a metric. Use this to find what content is working best.',
      inputSchema: {
        type: 'object',
        properties: {
          metric: {
            type: 'string',
            enum: ['commission', 'gpm', 'views', 'sales', 'gmv'],
            description: 'What to sort by. Default: gpm',
          },
          limit: {
            type: 'number',
            description: 'How many videos to return. Default: 10',
          },
          days: {
            type: 'number',
            description: 'Only include videos posted in the last N days. Omit for all time.',
          },
        },
        required: [],
      },
    },
    {
      name: 'get_product_breakdown',
      description:
        'Get sales, GMV, and commission broken down by product. Shows which products are making the most money.',
      inputSchema: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Only include videos posted in the last N days. Omit for all time.',
          },
        },
        required: [],
      },
    },
    {
      name: 'get_format_breakdown',
      description:
        'Get average GPM and total commission broken down by video format (e.g. Shouty Hook, Storytelling, BOFU Text-Led). Shows which formats convert best.',
      inputSchema: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Only include videos posted in the last N days. Omit for all time.',
          },
        },
        required: [],
      },
    },
    {
      name: 'search_videos',
      description:
        'Search for videos by title keyword, or filter by product tag or format tag.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term to match against video title' },
          product: { type: 'string', description: 'Filter by product name' },
          format: { type: 'string', description: 'Filter by format tag' },
          limit: { type: 'number', description: 'Max results. Default: 20' },
        },
        required: [],
      },
    },
    {
      name: 'get_video',
      description:
        'Get full details for a specific video including its transcript/script if one has been saved.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The TikTok video ID' },
        },
        required: ['id'],
      },
    },
    {
      name: 'get_monthly_trend',
      description:
        'Get commission and sales totals grouped by month, so you can see growth trends over time.',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'get_videos_with_transcripts',
      description:
        'Get all videos that have a script/transcript saved, along with their performance data. Useful for analysing what script patterns work.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max results. Default: 20' },
        },
        required: [],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const db = getDb();

  try {
    if (name === 'get_summary') {
      const totals = db.prepare(`
        SELECT
          COUNT(*) as total_videos,
          SUM(CASE WHEN commission IS NOT NULL THEN 1 ELSE 0 END) as videos_with_commission,
          ROUND(SUM(COALESCE(commission, 0)), 2) as total_commission,
          SUM(COALESCE(sales, 0)) as total_sales,
          ROUND(SUM(COALESCE(gmv, 0)), 2) as total_gmv,
          SUM(views) as total_views,
          ROUND(AVG(CASE WHEN gpm IS NOT NULL THEN gpm END), 2) as avg_gpm
        FROM videos
      `).get();

      const lastSync = db.prepare(
        "SELECT value FROM settings WHERE key = 'last_sync'"
      ).get();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { summary: totals, last_synced: lastSync?.value || 'Never' },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'get_top_videos') {
      const metric = args?.metric || 'gpm';
      const limit = args?.limit || 10;
      const days = args?.days;

      const validMetrics = { gpm: 'gpm', commission: 'commission', views: 'views', sales: 'sales', gmv: 'gmv' };
      const sortCol = validMetrics[metric] || 'gpm';

      let query = `
        SELECT id, title, post_date, views, product_tag, format_tag,
               sales, commission, gmv, gpm
        FROM videos
        WHERE ${sortCol} IS NOT NULL
        ${days ? `AND post_date >= datetime('now', '-${Number(days)} days')` : ''}
        ORDER BY ${sortCol} DESC
        LIMIT ?
      `;

      const videos = db.prepare(query).all(limit);
      return {
        content: [{ type: 'text', text: JSON.stringify(videos, null, 2) }],
      };
    }

    if (name === 'get_product_breakdown') {
      const days = args?.days;

      // From product entries table (multi-product per video)
      const fromEntries = db.prepare(`
        SELECT
          pe.product_tag,
          COUNT(DISTINCT pe.video_id) as video_count,
          SUM(COALESCE(pe.sales, 0)) as total_sales,
          ROUND(SUM(COALESCE(pe.gmv, 0)), 2) as total_gmv,
          ROUND(SUM(COALESCE(pe.commission, 0)), 2) as total_commission
        FROM video_product_entries pe
        JOIN videos v ON v.id = pe.video_id
        ${days ? `WHERE v.post_date >= datetime('now', '-${Number(days)} days')` : ''}
        GROUP BY pe.product_tag
        ORDER BY total_commission DESC
      `).all();

      // Also from videos.product_tag for videos that have no product entries
      const fromVideos = db.prepare(`
        SELECT
          product_tag,
          COUNT(*) as video_count,
          SUM(COALESCE(sales, 0)) as total_sales,
          ROUND(SUM(COALESCE(gmv, 0)), 2) as total_gmv,
          ROUND(SUM(COALESCE(commission, 0)), 2) as total_commission
        FROM videos
        WHERE product_tag IS NOT NULL
          AND id NOT IN (SELECT DISTINCT video_id FROM video_product_entries)
          ${days ? `AND post_date >= datetime('now', '-${Number(days)} days')` : ''}
        GROUP BY product_tag
        ORDER BY total_commission DESC
      `).all();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { from_product_entries: fromEntries, from_video_tags: fromVideos },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'get_format_breakdown') {
      const days = args?.days;

      const rows = db.prepare(`
        SELECT
          format_tag,
          COUNT(*) as video_count,
          ROUND(AVG(CASE WHEN gpm IS NOT NULL THEN gpm END), 2) as avg_gpm,
          ROUND(SUM(COALESCE(commission, 0)), 2) as total_commission,
          SUM(COALESCE(sales, 0)) as total_sales,
          ROUND(AVG(views), 0) as avg_views
        FROM videos
        WHERE format_tag IS NOT NULL
          ${days ? `AND post_date >= datetime('now', '-${Number(days)} days')` : ''}
        GROUP BY format_tag
        ORDER BY avg_gpm DESC NULLS LAST
      `).all();

      return {
        content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
      };
    }

    if (name === 'search_videos') {
      const query = args?.query || '';
      const product = args?.product || '';
      const format = args?.format || '';
      const limit = args?.limit || 20;

      const rows = db.prepare(`
        SELECT id, title, post_date, views, product_tag, format_tag,
               sales, commission, gmv, gpm,
               CASE WHEN transcript IS NOT NULL THEN 1 ELSE 0 END as has_transcript
        FROM videos
        WHERE 1=1
          ${query ? `AND title LIKE '%' || ? || '%'` : ''}
          ${product ? `AND product_tag = ?` : ''}
          ${format ? `AND format_tag = ?` : ''}
        ORDER BY post_date DESC
        LIMIT ?
      `).all(
        ...[
          query ? query : [],
          product ? product : [],
          format ? format : [],
          limit,
        ].flat()
      );

      return {
        content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
      };
    }

    if (name === 'get_video') {
      const id = args?.id;
      if (!id) throw new Error('id is required');

      const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
      if (!video) {
        return {
          content: [{ type: 'text', text: `No video found with id: ${id}` }],
        };
      }

      const productEntries = db
        .prepare('SELECT * FROM video_product_entries WHERE video_id = ?')
        .all(id);

      const monthlyStats = db
        .prepare(
          'SELECT * FROM video_monthly_stats WHERE video_id = ? ORDER BY year_month ASC'
        )
        .all(id);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ video, product_entries: productEntries, monthly_stats: monthlyStats }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_monthly_trend') {
      const rows = db.prepare(`
        SELECT
          strftime('%Y-%m', post_date) as month,
          COUNT(*) as videos_posted,
          ROUND(SUM(COALESCE(commission, 0)), 2) as total_commission,
          SUM(COALESCE(sales, 0)) as total_sales,
          ROUND(SUM(COALESCE(gmv, 0)), 2) as total_gmv,
          ROUND(AVG(CASE WHEN gpm IS NOT NULL THEN gpm END), 2) as avg_gpm
        FROM videos
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `).all();

      return {
        content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
      };
    }

    if (name === 'get_videos_with_transcripts') {
      const limit = args?.limit || 20;

      const rows = db.prepare(`
        SELECT id, title, post_date, views, product_tag, format_tag,
               sales, commission, gpm, transcript
        FROM videos
        WHERE transcript IS NOT NULL AND transcript != ''
        ORDER BY gpm DESC NULLS LAST
        LIMIT ?
      `).all(limit);

      return {
        content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  } finally {
    db.close();
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
