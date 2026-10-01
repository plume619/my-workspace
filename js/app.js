// ===== 雾感薰衣草工作台 · 交互脚本 =====

let WORKSPACE_DATA = null;
const API_BASE = '';

async function apiCall(path, options = {}) {
  try {
    const resp = await fetch(`${API_BASE}/api/${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    const data = await resp.json();
    return data;
  } catch (e) {
    console.error(`API call failed (${path}):`, e);
    return { ok: false, error: e.message };
  }
}

async function loadData() {
  try {
    const resp = await fetch('./data/data.json?v=' + Date.now());
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    WORKSPACE_DATA = await resp.json();
    renderAll();
  } catch (e) {
    console.warn('静态数据加载失败，尝试API:', e);
    const result = await apiCall('inspiration');
    if (result.ok) {
      WORKSPACE_DATA = result.data;
    } else {
      WORKSPACE_DATA = { inspiration: [], keywords: [], finance: [], schedule: [], life: [], notes: [], health: [] };
    }
    renderAll();
  }
  loadRealtimeData();
}

async function loadRealtimeData() {
  const [finance, schedule, life, notes, health] = await Promise.all([
    apiCall('finance'),
    apiCall('schedule'),
    apiCall('life'),
    apiCall('notes'),
    apiCall('health')
  ]);
  if (finance.ok) WORKSPACE_DATA.finance = finance.data;
  if (schedule.ok) WORKSPACE_DATA.schedule = schedule.data;
  if (life.ok) WORKSPACE_DATA.life = life.data;
  if (notes.ok) WORKSPACE_DATA.notes = notes.data;
  if (health.ok) WORKSPACE_DATA.health = health.data;
  renderRealtimeData();
}

function formatNumber(n) {
  if (!n || n === 0) return '—';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return '未知';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDaysAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff < 7) return diff + '天前';
  if (diff < 30) return Math.floor(diff / 7) + '周前';
  return formatDate(dateStr);
}

document.addEventListener('DOMContentLoaded', function() {
  initGreeting();
  initDate();
  initNavigation();
  initTabs();
  initCalendar();
  initModals();
  initMobileMenu();
  loadData();
  initQuickActions();
  initFormDefaults();
});

function initFormDefaults() {
  const today = new Date().toISOString().split('T')[0];
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    if (!input.value) input.value = today;
  });
}

function renderAll() {
  renderHomeInspiration();
  renderInspirationPage();
  renderKeywordsPage();
  renderHomeStats();
}

function renderRealtimeData() {
  renderFinancePage();
  renderSchedulePage();
  renderLifePage();
  renderNotesPage();
  renderHealthPage();
  renderHomeStats();
  renderHomeSchedule();
  renderHomeLife();
}

function renderHomeSchedule() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.schedule) return;
  const container = document.getElementById('homeSchedule');
  if (!container) return;
  const records = WORKSPACE_DATA.schedule;
  if (records.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-tertiary);">暂无待办事项</div>';
    return;
  }
  container.innerHTML = records.slice(0, 5).map(r => `
    <div class="list-item">
      <div class="list-item__icon">📌</div>
      <div class="list-item__content">
        <div class="list-item__title">${r.事项名称 || '—'}</div>
        <div class="list-item__desc">${Array.isArray(r.优先级) ? r.优先级[0] : '中'}优先级 · ${r.截止时间 || r.日期 || '—'}</div>
      </div>
      <span class="tag ${Array.isArray(r.状态) && r.状态[0] === '已完成' ? 'tag--success' : 'tag--warning'}">${Array.isArray(r.状态) ? r.状态[0] : '待完成'}</span>
    </div>
  `).join('');
}

function renderHomeLife() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.life) return;
  const container = document.getElementById('homeLife');
  if (!container) return;
  const records = WORKSPACE_DATA.life;
  if (records.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-tertiary);">还没有生活记录</div>';
    return;
  }
  container.innerHTML = records.slice(0, 5).map(r => `
    <div class="list-item">
      <div class="list-item__icon">✨</div>
      <div class="list-item__content">
        <div class="list-item__title">${(r.内容 || '').substring(0, 50)}</div>
        <div class="list-item__desc">${formatDate(r.日期)} ${Array.isArray(r.心情) && r.心情[0] ? '· 心情：' + r.心情[0] : ''}</div>
      </div>
    </div>
  `).join('');
}

function renderHomeStats() {
  if (!WORKSPACE_DATA) return;
  const inspirationCount = WORKSPACE_DATA.inspiration ? WORKSPACE_DATA.inspiration.length : 0;
  const scheduleCount = WORKSPACE_DATA.schedule ? WORKSPACE_DATA.schedule.length : 0;
  const financeRecords = WORKSPACE_DATA.finance || [];
  const monthExpense = financeRecords.reduce((sum, r) => sum + (Number(r.金额) || 0), 0);
  const healthCount = WORKSPACE_DATA.health ? WORKSPACE_DATA.health.length : 0;

  const statSchedule = document.getElementById('statSchedule');
  if (statSchedule) statSchedule.textContent = scheduleCount;
  const statFinance = document.getElementById('statFinance');
  if (statFinance) statFinance.textContent = '¥' + monthExpense;
  const statHealth = document.getElementById('statHealth');
  if (statHealth) statHealth.textContent = healthCount;

  const monthExpenseEl = document.getElementById('monthExpense');
  if (monthExpenseEl) monthExpenseEl.textContent = '¥' + monthExpense;
  const monthCountEl = document.getElementById('monthCount');
  if (monthCountEl) monthCountEl.textContent = financeRecords.length;
  const dailyAvgEl = document.getElementById('dailyAvg');
  if (dailyAvgEl) dailyAvgEl.textContent = '¥' + (financeRecords.length > 0 ? Math.round(monthExpense / 30) : 0);

  const healthCountEl = document.getElementById('healthCount');
  if (healthCountEl) healthCountEl.textContent = healthCount;
  const healthDurationEl = document.getElementById('healthDuration');
  if (healthDurationEl) {
    const totalDuration = (WORKSPACE_DATA.health || []).reduce((sum, r) => sum + (Number(r.时长) || 0), 0);
    healthDurationEl.textContent = totalDuration;
  }
  const monthCheckinEl = document.getElementById('monthCheckin');
  if (monthCheckinEl) monthCheckinEl.textContent = healthCount;
}

// ===== 灵感抓取渲染 =====
function renderHomeInspiration() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.inspiration) return;
  const container = document.getElementById('homeInspiration');
  if (!container) return;
  const items = WORKSPACE_DATA.inspiration.slice(0, 4);
  if (items.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-tertiary);">暂无灵感数据，等待自动抓取...</div>';
    return;
  }
  container.innerHTML = items.map(item => {
    const tagClass = getPlatformTagClass(item.platform);
    return `
    <div class="inspiration-card">
      <div class="inspiration-card__header">
        <span class="tag ${tagClass}">${item.platform}</span>
        <span class="inspiration-card__date">${getDaysAgo(item.date)}</span>
      </div>
      <div class="inspiration-card__title">
        <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
      </div>
      <div class="inspiration-card__stats">
        <span class="inspiration-card__stat">❤️ ${formatNumber(item.likes)}</span>
        <span class="inspiration-card__stat">⭐ ${formatNumber(item.favorites)}</span>
      </div>
    </div>`;
  }).join('');
}

function getPlatformTagClass(platform) {
  const map = {
    'B站': 'tag--lavender',
    'LOFTER': 'tag--lavender',
    '小红书': 'tag--pink',
    '微博': 'tag--warning',
    '抖音': 'tag--success',
  };
  return map[platform] || 'tag--lavender';
}

function renderInspirationPage() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.inspiration) return;
  const tbody = document.getElementById('inspirationTableBody');
  if (!tbody) return;
  const sorted = [...WORKSPACE_DATA.inspiration].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-tertiary);">暂无数据</td></tr>';
    return;
  }
  tbody.innerHTML = sorted.map(item => `
    <tr>
      <td><a href="${item.url}" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:none;">${item.title}</a></td>
      <td style="text-align:center;">${formatNumber(item.likes)}</td>
      <td style="text-align:center;">${formatNumber(item.favorites)}</td>
      <td style="text-align:center;">${formatDate(item.date)}</td>
      <td style="text-align:center;"><span class="tag ${getPlatformTagClass(item.platform)}">${item.platform}</span></td>
      <td style="text-align:center;">${item.keyword || '—'}</td>
    </tr>
  `).join('');
}

function renderKeywordsPage() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.keywords) return;
  const container = document.getElementById('keywordsList');
  if (!container) return;
  if (WORKSPACE_DATA.keywords.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-tertiary);">暂无关键词，请在飞书表格中添加</div>';
    return;
  }
  container.innerHTML = WORKSPACE_DATA.keywords.map(kw => `
    <div class="keyword-card">
      <div class="keyword-card__name">${kw.keyword}</div>
      <div class="keyword-card__platforms">
        ${(kw.platforms || []).map(p => `<span class="tag tag--lavender" style="margin-right:4px;">${p}</span>`).join('')}
      </div>
      <div class="keyword-card__status">
        <span class="tag ${kw.status === '启用' ? 'tag--success' : 'tag--secondary'}">${kw.status}</span>
        ${kw.note ? `<span style="margin-left:8px;color:var(--text-tertiary);font-size:12px;">${kw.note}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// ===== 记账渲染 =====
function renderFinancePage() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.finance) return;
  const tbody = document.getElementById('financeTableBody');
  if (!tbody) return;
  const records = WORKSPACE_DATA.finance;
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-tertiary);">暂无记账记录，点击上方按钮记一笔吧~</td></tr>';
    return;
  }
  tbody.innerHTML = records.slice(-10).reverse().map(r => `
    <tr>
      <td>${r.备注 || '—'}</td>
      <td style="text-align:center;">${Array.isArray(r.类别) ? r.类别.join('') : (r.类别 || '—')}</td>
      <td style="text-align:right;color:var(--danger);">-¥${r.金额 || 0}</td>
      <td style="text-align:center;">${formatDate(r.日期)}</td>
    </tr>
  `).join('');
}

// ===== 日程渲染 =====
function renderSchedulePage() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.schedule) return;
  const container = document.getElementById('scheduleList');
  if (!container) return;
  const records = WORKSPACE_DATA.schedule;
  if (records.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-tertiary);">暂无待办事项</div>';
    return;
  }
  container.innerHTML = records.map(r => `
    <div class="todo-item">
      <div class="todo-item__checkbox ${Array.isArray(r.状态) && r.状态[0] === '已完成' ? 'done' : ''}"></div>
      <div class="todo-item__content">
        <div class="todo-item__title">${r.事项名称 || '—'}</div>
        <div class="todo-item__meta">截止：${r.截止时间 || r.日期 || '—'} · ${Array.isArray(r.优先级) ? r.优先级[0] : '中'}</div>
      </div>
    </div>
  `).join('');
}

// ===== 生活记录渲染 =====
function renderLifePage() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.life) return;
  const container = document.getElementById('lifeTimeline');
  if (!container) return;
  const records = WORKSPACE_DATA.life;
  if (records.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-tertiary);">还没有生活记录，发一条试试~</div>';
    return;
  }
  container.innerHTML = records.map(r => `
    <div class="life-card">
      <div class="life-card__content">${r.内容 || ''}</div>
      <div class="life-card__meta">
        <span>${formatDate(r.日期)}</span>
        ${Array.isArray(r.心情) && r.心情[0] ? `<span>心情：${r.心情[0]}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// ===== 读书笔记渲染 =====
function renderNotesPage() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.notes) return;
  const container = document.getElementById('notesList');
  if (!container) return;
  const records = WORKSPACE_DATA.notes;
  if (records.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-tertiary);">还没有读书笔记</div>';
    return;
  }
  container.innerHTML = records.map(r => `
    <div class="note-card">
      <div class="note-card__title">${r.书名文章名 || '—'}</div>
      <div class="note-card__meta">${Array.isArray(r.类型) ? r.类型.join('') : ''} · ${r.作者 || '—'}</div>
      ${r.笔记内容 ? `<div class="note-card__content">${r.笔记内容}</div>` : ''}
      ${r.金句摘录 ? `<div class="note-card__quote">"${r.金句摘录}"</div>` : ''}
    </div>
  `).join('');
}

// ===== 健康锻炼渲染 =====
function renderHealthPage() {
  if (!WORKSPACE_DATA || !WORKSPACE_DATA.health) return;
  const container = document.getElementById('healthLog');
  if (!container) return;
  const records = WORKSPACE_DATA.health;
  if (records.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-tertiary);">还没有运动记录，去打卡吧~</div>';
    return;
  }
  container.innerHTML = records.slice(-10).reverse().map(r => `
    <div class="health-log-item">
      <span class="tag tag--success">${Array.isArray(r.运动项目) ? r.运动项目[0] : '—'}</span>
      <span>${r.时长 || 0}分钟</span>
      <span>${formatDate(r.日期)}</span>
      <span class="tag ${Array.isArray(r.状态) && r.状态[0] === '已完成' ? 'tag--success' : 'tag--warning'}">${Array.isArray(r.状态) ? r.状态[0] : '—'}</span>
    </div>
  `).join('');
}

// ===== 快速操作按钮 =====
function initQuickActions() {
  document.addEventListener('click', async function(e) {
    const quickBtn = e.target.closest('.quick-record-btn');
    if (quickBtn) {
      const name = quickBtn.dataset.name;
      const amount = quickBtn.dataset.amount;
      const category = quickBtn.dataset.category;
      if (name && amount) {
        await apiCall('finance', {
          method: 'POST',
          body: JSON.stringify({ note: name, amount: parseFloat(amount), category: category })
        });
        showToast(`已记录：${name} ¥${amount}`);
        const result = await apiCall('finance');
        if (result.ok) {
          WORKSPACE_DATA.finance = result.data;
          renderFinancePage();
        }
      }
    }

    const checkinBtn = e.target.closest('.checkin-card__btn');
    if (checkinBtn) {
      const exercise = checkinBtn.dataset.exercise;
      if (exercise) {
        checkinBtn.classList.toggle('done');
        const isDone = checkinBtn.classList.contains('done');
        if (isDone) {
          checkinBtn.textContent = '✓';
          await apiCall('health', {
            method: 'POST',
            body: JSON.stringify({ exercise, duration: 5, status: '已完成' })
          });
          showToast(`${exercise} 打卡成功！`);
        } else {
          checkinBtn.textContent = '○';
        }
      } else {
        checkinBtn.classList.toggle('done');
        checkinBtn.textContent = checkinBtn.classList.contains('done') ? '✓' : '○';
      }
    }

    const submitFinance = e.target.closest('#submitFinance');
    if (submitFinance) {
      e.preventDefault();
      const form = document.getElementById('financeForm');
      if (!form) return;
      const formData = new FormData(form);
      const payload = {
        note: formData.get('note') || '',
        amount: parseFloat(formData.get('amount')) || 0,
        category: formData.get('category') || '其他',
        account: formData.get('account') || '现金',
        date: formData.get('date') || new Date().toISOString().split('T')[0]
      };
      if (!payload.amount) {
        showToast('请输入金额');
        return;
      }
      const result = await apiCall('finance', { method: 'POST', body: JSON.stringify(payload) });
      if (result.ok) {
        showToast('记账成功！');
        closeModal('financeModal');
        const data = await apiCall('finance');
        if (data.ok) {
          WORKSPACE_DATA.finance = data.data;
          renderFinancePage();
        }
      } else {
        showToast('记账失败：' + (result.error || ''));
      }
    }

    const submitSchedule = e.target.closest('#submitSchedule');
    if (submitSchedule) {
      e.preventDefault();
      const form = document.getElementById('scheduleForm');
      if (!form) return;
      const formData = new FormData(form);
      const payload = {
        title: formData.get('title') || '',
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        deadline: formData.get('deadline') || '',
        priority: formData.get('priority') || '中',
        note: formData.get('note') || ''
      };
      if (!payload.title) {
        showToast('请输入事项名称');
        return;
      }
      const result = await apiCall('schedule', { method: 'POST', body: JSON.stringify(payload) });
      if (result.ok) {
        showToast('日程添加成功！');
        closeModal('scheduleModal');
        const data = await apiCall('schedule');
        if (data.ok) {
          WORKSPACE_DATA.schedule = data.data;
          renderSchedulePage();
        }
      } else {
        showToast('添加失败：' + (result.error || ''));
      }
    }

    const submitLife = e.target.closest('#submitLife');
    if (submitLife) {
      e.preventDefault();
      const form = document.getElementById('lifeForm');
      if (!form) return;
      const formData = new FormData(form);
      const payload = {
        content: formData.get('content') || '',
        mood: formData.get('mood') || '',
        date: new Date().toISOString().split('T')[0]
      };
      if (!payload.content) {
        showToast('请输入内容');
        return;
      }
      const result = await apiCall('life', { method: 'POST', body: JSON.stringify(payload) });
      if (result.ok) {
        showToast('发布成功！');
        closeModal('lifeModal');
        const data = await apiCall('life');
        if (data.ok) {
          WORKSPACE_DATA.life = data.data;
          renderLifePage();
        }
      } else {
        showToast('发布失败：' + (result.error || ''));
      }
    }

    const submitNote = e.target.closest('#submitNote');
    if (submitNote) {
      e.preventDefault();
      const form = document.getElementById('noteForm');
      if (!form) return;
      const formData = new FormData(form);
      const payload = {
        title: formData.get('title') || '',
        type: formData.get('type') || '读书',
        author: formData.get('author') || '',
        status: formData.get('status') || '想读',
        note: formData.get('note') || '',
        quote: formData.get('quote') || '',
        link: formData.get('link') || ''
      };
      if (!payload.title) {
        showToast('请输入书名/文章名');
        return;
      }
      const result = await apiCall('notes', { method: 'POST', body: JSON.stringify(payload) });
      if (result.ok) {
        showToast('笔记添加成功！');
        closeModal('noteModal');
        const data = await apiCall('notes');
        if (data.ok) {
          WORKSPACE_DATA.notes = data.data;
          renderNotesPage();
        }
      } else {
        showToast('添加失败：' + (result.error || ''));
      }
    }
  });
}

// ===== Toast 提示 =====
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:12px 24px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;font-size:14px;transition:opacity 0.3s;opacity:0;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ===== 问候语 =====
function initGreeting() {
  const hour = new Date().getHours();
  const greetingEl = document.getElementById('greeting');
  let greeting = '你好';
  if (hour < 6) greeting = '凌晨好 🌙';
  else if (hour < 9) greeting = '早上好 🌅';
  else if (hour < 12) greeting = '上午好 ☀️';
  else if (hour < 14) greeting = '中午好 🍱';
  else if (hour < 18) greeting = '下午好 🌸';
  else if (hour < 22) greeting = '晚上好 🌆';
  else greeting = '晚安 🌙';
  if (greetingEl) greetingEl.textContent = greeting;
}

function initDate() {
  const dateEl = document.getElementById('currentDate');
  const now = new Date();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
  if (dateEl) dateEl.textContent = dateStr;
}

function initNavigation() {
  const navLinks = document.querySelectorAll('.sidebar__nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('data-page');
      navigateTo(targetPage);
    });
  });
}

function navigateTo(pageName) {
  const navLinks = document.querySelectorAll('.sidebar__nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    if (page.id === `page-${pageName}`) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initTabs() {
  const tabGroups = document.querySelectorAll('.tabs');
  tabGroups.forEach(group => {
    const tabs = group.querySelectorAll('.tab');
    const tabContents = group.parentElement.querySelectorAll('.tab-content');
    tabs.forEach((tab) => {
      tab.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        tabContents.forEach(content => {
          if (content.id === targetTab) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
      });
    });
  });
}

let currentCalendarDate = new Date();

function initCalendar() {
  renderCalendar();
}

function renderCalendar() {
  const calendarDays = document.getElementById('calendarDays');
  const calendarTitle = document.getElementById('calendarTitle');
  if (!calendarDays || !calendarTitle) return;
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  calendarTitle.textContent = `${year}年${month + 1}月`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  let html = '';
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar__day calendar__day--other">${daysInPrevMonth - i}</div>`;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
    let classes = 'calendar__day';
    if (isToday) classes += ' calendar__day--today';
    html += `<div class="${classes}">${day}</div>`;
  }
  const totalCells = firstDay + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    html += `<div class="calendar__day calendar__day--other">${i}</div>`;
  }
  calendarDays.innerHTML = html;
}

function changeMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendar();
}

function initModals() {
  const overlays = document.querySelectorAll('.modal-overlay');
  overlays.forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal(this.id);
      }
    });
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      overlays.forEach(overlay => {
        if (overlay.classList.contains('active')) {
          closeModal(overlay.id);
        }
      });
    }
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showQuickRecord(name, amount, category) {
  openModal('financeModal');
}

function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768) {
    if (menuBtn) menuBtn.style.display = 'flex';
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });
  }
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      if (menuBtn) menuBtn.style.display = 'none';
      if (sidebar) sidebar.classList.remove('open');
    } else {
      if (menuBtn) menuBtn.style.display = 'flex';
    }
  });
}
