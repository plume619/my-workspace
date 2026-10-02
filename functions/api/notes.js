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
      const records = await listRecords(env, TABLE_IDS.notes);
      return jsonResponse({ ok: true, data: records });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const record = await createRecord(env, TABLE_IDS.notes, {
        书名文章名: body.title || '',
        类型: body.type ? [body.type] : [],
        作者: body.author || '',
        状态: body.status ? [body.status] : ['想读'],
        笔记内容: body.note || '',
        金句摘录: body.quote || '',
        链接: body.link || ''
      });
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const fields = {};
      if (body.title !== undefined) fields.书名文章名 = body.title;
      if (body.type !== undefined) fields.类型 = [body.type];
      if (body.author !== undefined) fields.作者 = body.author;
      if (body.status !== undefined) fields.状态 = [body.status];
      if (body.note !== undefined) fields.笔记内容 = body.note;
      if (body.quote !== undefined) fields.金句摘录 = body.quote;
      if (body.link !== undefined) fields.链接 = body.link;
      const record = await updateRecord(env, TABLE_IDS.notes, body.id, fields);
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      await deleteRecord(env, TABLE_IDS.notes, id);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
