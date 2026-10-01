const { TABLE_IDS, listRecords } = require('../lib/feishu');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const records = await listRecords(TABLE_IDS.inspiration);
      const keywords = await listRecords(TABLE_IDS.keywords);
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
      return res.status(200).json({ ok: true, data: allData });
    }
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

