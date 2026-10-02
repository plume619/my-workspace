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
      const records = await listRecords(env, TABLE_IDS.health);
      return jsonResponse({ ok: true, data: records });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const record = await createRecord(env, TABLE_IDS.health, {
        运动项目: body.exercise ? [body.exercise] : [],
        日期: body.date || new Date().toISOString().split('T')[0],
        时长: Number(body.duration) || 0,
        状态: body.status ? [body.status] : ['已完成'],
        备注: body.note || ''
      });
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const fields = {};
      if (body.exercise !== undefined) fields.运动项目 = [body.exercise];
      if (body.date !== undefined) fields.日期 = body.date;
      if (body.duration !== undefined) fields.时长 = Number(body.duration);
      if (body.status !== undefined) fields.状态 = [body.status];
      if (body.note !== undefined) fields.备注 = body.note;
      const record = await updateRecord(env, TABLE_IDS.health, body.id, fields);
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      await deleteRecord(env, TABLE_IDS.health, id);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
