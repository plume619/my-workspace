// Cloudflare Pages 版本的飞书多维表格工具库
// 使用 ES 模块，通过参数传入环境变量

export const TABLE_IDS = {
  finance: 'tblgNSkENmSbQ3lB',
  quickTemplate: 'tblBe0sWMyBeA2QY',
  schedule: 'tblmtwdAQtULlCui',
  life: 'tblBtI2XatHc9Bis',
  notes: 'tbl0zQsrjoJXRk5Y',
  health: 'tblCiEcOO8JhuAA4',
  keywords: 'tblkMBroLMP8Eikp',
  inspiration: 'tblsVu8PHDIve3v1'
};

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    var preview = text.substring(0, 300);
    throw new Error('JSON解析失败: ' + e.message + ' | 响应前300字符: ' + preview);
  }
}

async function getTenantToken(env) {
  const FEISHU_APP_ID = env.FEISHU_APP_ID;
  const FEISHU_APP_SECRET = env.FEISHU_APP_SECRET;
  
  const resp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    })
  });
  const text = await resp.text();
  const data = parseJson(text);
  if (data.code !== 0) throw new Error('获取token失败: ' + data.msg);
  return data.tenant_access_token;
}

export async function listRecords(env, tableId) {
  const FEISHU_BASE_ID = env.FEISHU_BASE_ID;
  const token = await getTenantToken(env);
  
  var allRecords = [];
  var pageToken = null;
  
  do {
    var url = 'https://open.feishu.cn/open-apis/bitable/v1/app/' + FEISHU_BASE_ID + '/tables/' + tableId + '/records?page_size=100' + (pageToken ? '&page_token=' + pageToken : '');
    
    const resp = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    const text = await resp.text();
    const data = parseJson(text);
    if (data.code !== 0) throw new Error('查询失败: ' + data.msg);
    
    var items = (data.data && data.data.items) ? data.data.items : [];
    var records = items.map(function(item) {
      return Object.assign({ id: item.record_id }, item.fields);
    });
    
    allRecords = allRecords.concat(records);
    pageToken = data.data && data.data.page_token;
    if (!data.data || !data.data.has_more) break;
    
  } while (pageToken);
  
  return allRecords;
}

export async function createRecord(env, tableId, fields) {
  const FEISHU_BASE_ID = env.FEISHU_BASE_ID;
  const token = await getTenantToken(env);
  
  const resp = await fetch('https://open.feishu.cn/open-apis/bitable/v1/app/' + FEISHU_BASE_ID + '/tables/' + tableId + '/records', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: fields })
  });
  const text = await resp.text();
  const data = parseJson(text);
  if (data.code !== 0) throw new Error('创建失败: ' + data.msg);
  return Object.assign({ id: data.data.record.record_id }, data.data.record.fields);
}

export async function updateRecord(env, tableId, recordId, fields) {
  const FEISHU_BASE_ID = env.FEISHU_BASE_ID;
  const token = await getTenantToken(env);
  
  const resp = await fetch('https://open.feishu.cn/open-apis/bitable/v1/app/' + FEISHU_BASE_ID + '/tables/' + tableId + '/records/' + recordId, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: fields })
  });
  const text = await resp.text();
  const data = parseJson(text);
  if (data.code !== 0) throw new Error('更新失败: ' + data.msg);
  return Object.assign({ id: data.data.record.record_id }, data.data.record.fields);
}

export async function deleteRecord(env, tableId, recordId) {
  const FEISHU_BASE_ID = env.FEISHU_BASE_ID;
  const token = await getTenantToken(env);
  
  const resp = await fetch('https://open.feishu.cn/open-apis/bitable/v1/app/' + FEISHU_BASE_ID + '/tables/' + tableId + '/records/' + recordId, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });
  const text = await resp.text();
  const data = parseJson(text);
  if (data.code !== 0) throw new Error('删除失败: ' + data.msg);
  return true;
}

// 统一的 CORS 响应头
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// 生成 JSON 响应
export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders
    }
  });
}

// 处理 OPTIONS 预检请求
export function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS
  });
}
