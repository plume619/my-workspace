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
      const records = await listRecords(TABLE_IDS.schedule);
      return res.status(200).json({ ok: true, data: records });
    }

    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const record = await createRecord(TABLE_IDS.schedule, {
        事项名称: body.title || '',
        日期: body.date || new Date().toISOString().split('T')[0],
        截止时间: body.deadline || '',
        状态: body.status ? [body.status] : ['待完成'],
        优先级: body.priority ? [body.priority] : ['中'],
        备注: body.note || ''
      });
      return res.status(200).json({ ok: true, data: record });
    }

    if (method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const fields = {};
      if (body.title !== undefined) fields.事项名称 = body.title;
      if (body.date !== undefined) fields.日期 = body.date;
      if (body.deadline !== undefined) fields.截止时间 = body.deadline;
      if (body.status !== undefined) fields.状态 = [body.status];
      if (body.priority !== undefined) fields.优先级 = [body.priority];
      if (body.note !== undefined) fields.备注 = body.note;
      const record = await updateRecord(TABLE_IDS.schedule, body.id, fields);
      return res.status(200).json({ ok: true, data: record });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      await deleteRecord(TABLE_IDS.schedule, id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

