import { TABLE_IDS, listRecords, createRecord, deleteRecord, jsonResponse, handleOptions } from '../_shared/feishu.js';

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    if (request.method === 'GET') {
      const records = await listRecords(env, TABLE_IDS.life);
      return jsonResponse({ ok: true, data: records });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const record = await createRecord(env, TABLE_IDS.life, {
        内容: body.content || '',
        日期: body.date || new Date().toISOString().split('T')[0],
        心情: body.mood ? [body.mood] : [],
        图片: body.image || ''
      });
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      await deleteRecord(env, TABLE_IDS.life, id);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
