import { TABLE_IDS, listRecords, jsonResponse, handleOptions } from '../_shared/feishu.js';

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;

  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    if (request.method === 'GET') {
      const records = await listRecords(env, TABLE_IDS.inspiration);
      const keywords = await listRecords(env, TABLE_IDS.keywords);
      const allData = {
        lastUpdated: new Date().toISOString().split('T')[0],
        inspiration: records.map(r => ({
          title: r.标题 || '',
          url: r.链接 || '',
          likes: r.点赞数 || 0,
          favorites: r.收藏数 || 0,
          date: r.发布日期 || '',
          platform: Array.isArray(r.平台) ? r.平台.join(',') : (r.平台 || ''),
          keyword: Array.isArray(r.关键词) ? r.关键词.join(',') : (r.关键词 || '')
        })),
        keywords: keywords.map(r => ({
          keyword: r.关键词 || '',
          platforms: Array.isArray(r.平台) ? r.平台 : [],
          status: Array.isArray(r.状态) ? r.状态[0] : (r.状态 || ''),
          note: r.备注 || ''
        })),
        finance: [],
        schedule: [],
        life: [],
        notes: [],
        health: []
      };
      return jsonResponse({ ok: true, data: allData });
    }
    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
