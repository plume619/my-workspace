const { TABLE_IDS, listRecords, createRecord, deleteRecord } = require('../lib/feishu');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const method = req.method;

    if (method === 'GET') {
      const records = await listRecords(TABLE_IDS.keywords);
      return res.status(200).json({ ok: true, data: records });
    }

    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const record = await createRecord(TABLE_IDS.keywords, {
        关键词: body.keyword || '',
        平台: body.platforms || [],
        状态: [body.status || '启用'],
        备注: body.note || ''
      });
      return res.status(200).json({ ok: true, data: record });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      await deleteRecord(TABLE_IDS.keywords, id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

