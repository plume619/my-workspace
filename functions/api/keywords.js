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
      const records = await listRecords(env, TABLE_IDS.keywords);
      return jsonResponse({ ok: true, data: records });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const record = await createRecord(env, TABLE_IDS.keywords, {
        关键词: body.keyword || '',
        平台: body.platforms || [],
        状态: [body.status || '启用'],
        备注: body.note || ''
      });
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      await deleteRecord(env, TABLE_IDS.keywords, id);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
