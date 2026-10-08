import { TABLE_IDS, listRecords, createRecord, updateRecord, deleteRecord, jsonResponse, handleOptions } from './functions/_shared/feishu.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    if (path.startsWith('/api/')) {
      const route = path.replace('/api/', '').split('/')[0];

      try {
        if (route === 'finance') {
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
        }

        if (route === 'schedule') {
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
        }

        if (route === 'life') {
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
        }

        if (route === 'notes') {
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
        }

        if (route === 'health') {
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
        }

        if (route === 'keywords') {
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
        }

        if (route === 'inspiration') {
          if (request.method === 'GET') {
            const records = await listRecords(env, TABLE_IDS.inspiration);
            const keywords = await listRecords(env, TABLE_IDS.keywords);
            const allData = {
              lastUpdated: new Date().toISOString().split('T')[0],
              inspiration: records.map(r => ({
                title: r.标题 || '',
                url: r.链接 || '',
                likes: r.点赞数 || 0,
                favorites: r.收藏数 || 0,
                date: r.发布日期 || '',
                platform: Array.isArray(r.平台) ? r.平台.join(',') : (r.平台 || ''),
                keyword: Array.isArray(r.关键词) ? r.关键词.join(',') : (r.关键词 || '')
              })),
              keywords: keywords.map(r => ({
                keyword: r.关键词 || '',
                platforms: Array.isArray(r.平台) ? r.平台 : [],
                status: Array.isArray(r.状态) ? r.状态[0] : (r.状态 || ''),
                note: r.备注 || ''
              })),
              finance: [],
              schedule: [],
              life: [],
              notes: [],
              health: []
            };
            return jsonResponse({ ok: true, data: allData });
          }
        }

        return jsonResponse({ ok: false, error: 'Route not found' }, 404);
      } catch (e) {
        return jsonResponse({ ok: false, error: e.message }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
