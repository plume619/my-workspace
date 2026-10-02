import { TABLE_IDS, listRecords, createRecord, updateRecord, deleteRecord, jsonResponse, handleOptions } from '../_shared/feishu.js';

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    if (request.method === 'GET') {
      const records = await listRecords(env, TABLE_IDS.schedule);
      return jsonResponse({ ok: true, data: records });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const record = await createRecord(env, TABLE_IDS.schedule, {
        事项名称: body.title || '',
        日期: body.date || new Date().toISOString().split('T')[0],
        截止时间: body.deadline || '',
        状态: body.status ? [body.status] : ['待完成'],
        优先级: body.priority ? [body.priority] : ['中'],
        备注: body.note || ''
      });
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const fields = {};
      if (body.title !== undefined) fields.事项名称 = body.title;
      if (body.date !== undefined) fields.日期 = body.date;
      if (body.deadline !== undefined) fields.截止时间 = body.deadline;
      if (body.status !== undefined) fields.状态 = [body.status];
      if (body.priority !== undefined) fields.优先级 = [body.priority];
      if (body.note !== undefined) fields.备注 = body.note;
      const record = await updateRecord(env, TABLE_IDS.schedule, body.id, fields);
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      await deleteRecord(env, TABLE_IDS.schedule, id);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
