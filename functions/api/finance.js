import { TABLE_IDS, listRecords, createRecord, updateRecord, deleteRecord, jsonResponse, handleOptions } from '../_shared/feishu.js';

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);

  // 处理 OPTIONS 预检
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    if (request.method === 'GET') {
      const records = await listRecords(env, TABLE_IDS.finance);
      return jsonResponse({ ok: true, data: records });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const record = await createRecord(env, TABLE_IDS.finance, {
        日期: body.date || new Date().toISOString().split('T')[0],
        类别: body.category ? [body.category] : [],
        金额: Number(body.amount) || 0,
        账户: body.account ? [body.account] : [],
        备注: body.note || ''
      });
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const record = await updateRecord(env, TABLE_IDS.finance, body.id, {
        日期: body.date,
        类别: body.category ? [body.category] : [],
        金额: Number(body.amount) || 0,
        账户: body.account ? [body.account] : [],
        备注: body.note || ''
      });
      return jsonResponse({ ok: true, data: record });
    }

    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      await deleteRecord(env, TABLE_IDS.finance, id);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
