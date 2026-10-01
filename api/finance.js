const { TABLE_IDS, listRecords, createRecord, updateRecord, deleteRecord } = require('../lib/feishu');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const method = req.method;

    if (method === 'GET') {
      const records = await listRecords(TABLE_IDS.finance);
      return res.status(200).json({ ok: true, data: records });
    }

    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const record = await createRecord(TABLE_IDS.finance, {
        日期: body.date || new Date().toISOString().split('T')[0],
        类别: body.category ? [body.category] : [],
        金额: Number(body.amount) || 0,
        账户: body.account ? [body.account] : [],
        备注: body.note || ''
      });
      return res.status(200).json({ ok: true, data: record });
    }

    if (method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const record = await updateRecord(TABLE_IDS.finance, body.id, {
        日期: body.date,
        类别: body.category ? [body.category] : [],
        金额: Number(body.amount) || 0,
        账户: body.account ? [body.account] : [],
        备注: body.note || ''
      });
      return res.status(200).json({ ok: true, data: record });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      await deleteRecord(TABLE_IDS.finance, id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

