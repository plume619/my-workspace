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
      const records = await listRecords(TABLE_IDS.notes);
      return res.status(200).json({ ok: true, data: records });
    }

    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const record = await createRecord(TABLE_IDS.notes, {
        书名文章名: body.title || '',
        类型: body.type ? [body.type] : [],
        作者: body.author || '',
        状态: body.status ? [body.status] : ['想读'],
        笔记内容: body.note || '',
        金句摘录: body.quote || '',
        链接: body.link || ''
      });
      return res.status(200).json({ ok: true, data: record });
    }

    if (method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const fields = {};
      if (body.title !== undefined) fields.书名文章名 = body.title;
      if (body.type !== undefined) fields.类型 = [body.type];
      if (body.author !== undefined) fields.作者 = body.author;
      if (body.status !== undefined) fields.状态 = [body.status];
      if (body.note !== undefined) fields.笔记内容 = body.note;
      if (body.quote !== undefined) fields.金句摘录 = body.quote;
      if (body.link !== undefined) fields.链接 = body.link;
      const record = await updateRecord(TABLE_IDS.notes, body.id, fields);
      return res.status(200).json({ ok: true, data: record });
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      await deleteRecord(TABLE_IDS.notes, id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

