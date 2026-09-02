/* ============================================================
   SkillG frontend — vanilla JS
   ============================================================ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const ICONS = {
  grid: '<svg viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.2" height="5.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="9.3" y="1.5" width="5.2" height="5.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="1.5" y="9.3" width="5.2" height="5.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="9.3" y="9.3" width="5.2" height="5.2" rx="1.4" stroke="currentColor" stroke-width="1.4"/></svg>',
  clock: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.4V8l2.4 1.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  folder: '<svg viewBox="0 0 16 16" fill="none"><path d="M1.5 4.2c0-.8.6-1.4 1.4-1.4h3l1.6 1.7h5.6c.8 0 1.4.6 1.4 1.4v5.9c0 .8-.6 1.4-1.4 1.4H2.9c-.8 0-1.4-.6-1.4-1.4V4.2Z" stroke="currentColor" stroke-width="1.35"/></svg>',
  agent: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.4" r="2.7" stroke="currentColor" stroke-width="1.4"/><path d="M3 13.4c.5-2.3 2.6-3.6 5-3.6s4.5 1.3 5 3.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  refresh: '<svg viewBox="0 0 16 16" fill="none"><path d="M13.2 8A5.2 5.2 0 1 1 8 2.8c1.5 0 2.8.6 3.7 1.6L13.2 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M13.2 2.6V6H9.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
// 分类线性图标（统一中性灰，靠蓝色表达选中）
const CAT_ICONS = {
  feishu: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 4.5h12M2 8h12M2 11.5h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="13" cy="11.5" r="1.4" stroke="currentColor" stroke-width="1.3"/></svg>',
  medical: '<svg viewBox="0 0 16 16" fill="none"><path d="M8 2.5v11M2.5 8h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="1.2" y="1.2" width="13.6" height="13.6" rx="3.4" stroke="currentColor" stroke-width="1.2"/></svg>',
  legal: '<svg viewBox="0 0 16 16" fill="none"><path d="M5 2.5h6M8 2.5v2.2M3.5 4.7h9M4.2 4.7 2.4 9a2.6 2.6 0 0 0 3.6 0L4.2 4.7Zm7.6 0-1.8 4.3a2.6 2.6 0 0 0 3.6 0L11.8 4.7ZM4 13.5h8" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  academic: '<svg viewBox="0 0 16 16" fill="none"><path d="m8 2 6.2 3L8 8 1.8 5 8 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M4 6.6V10c0 1 1.8 2.1 4 2.1s4-1.1 4-2.1V6.6M14.2 5v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  finance: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 12.2 5.4 8.8l2.6 2.4L14 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.4 5H14v3.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ecom: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 3h2.2l1.3 7.4h7.6L14.5 5H4.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.4" cy="13" r="1.1" stroke="currentColor" stroke-width="1.2"/><circle cx="12" cy="13" r="1.1" stroke="currentColor" stroke-width="1.2"/></svg>',
  media: '<svg viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="m6.5 6.3 3.4 1.7-3.4 1.7V6.3Z" fill="currentColor"/></svg>',
  creative: '<svg viewBox="0 0 16 16" fill="none"><path d="M11.6 2.6 13.4 4.4 5.6 12.2 3 13l.8-2.6L11.6 2.6Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10.4 3.8 12.2 5.6" stroke="currentColor" stroke-width="1.3"/></svg>',
  office: '<svg viewBox="0 0 16 16" fill="none"><path d="M3 2.5h7l3 3v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9.8 2.6v3h3M4.8 8.6h6.4M4.8 11h4.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  data: '<svg viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="9.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="1.5" y="9.5" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.3"/></svg>',
  product: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2.4" stroke="currentColor" stroke-width="1.3"/></svg>',
  dev: '<svg viewBox="0 0 16 16" fill="none"><path d="m5.8 5.4-3 2.6 3 2.6M10.2 5.4l3 2.6-3 2.6M9 3.6 7 12.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  system: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.4" stroke="currentColor" stroke-width="1.35"/><path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.6 3.6l1.5 1.5M10.9 10.9l1.5 1.5M12.4 3.6l-1.5 1.5M5.1 10.9l-1.5 1.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>',
  game: '<svg viewBox="0 0 16 16" fill="none"><rect x="1.6" y="4.6" width="12.8" height="7.2" rx="3.6" stroke="currentColor" stroke-width="1.3"/><path d="M5 7.4v2M4 8.4h2M10.4 8h.01M11.8 9.4h.01" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  other: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.3"/><path d="M6 6.2c.2-.8 1-1.3 2-1.3 1.2 0 2 .7 2 1.6 0 1-1 1.3-2 1.6-1 .3-1.5.8-1.5 1.7M8 11.4h.01" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
};

const state = { data: null, nav: 'all', query: '', sort: 'name', detailId: null, firstLoad: true };

async function api(path, body) {
  const opt = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
  const r = await fetch(path, opt);
  return r.json();
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const fmtDate = ts => ts ? new Date(ts * 1000).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';
const catIcon = c => CAT_ICONS[c] || CAT_ICONS.other;
const catLabel = c => state.data?.cat_labels?.[c] || '其他';
const monogram = name => { const t = (name || '?').trim(); return /[A-Za-z]/.test(t[0]) ? t.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() : t[0]; };

/* ---------------- 导航与列表 ---------------- */
function renderNav() {
  const d = state.data;
  $('#count-all').textContent = d.skills.length;
  const recent = getRecent();
  $('#count-recent').textContent = recent.length;
  $('#cat-nav').innerHTML = d.categories.map(c => `
    <button class="nav-item ${state.nav === c.id ? 'active' : ''}" data-view="${c.id}">
      <span class="nav-ico">${catIcon(c.id)}</span>
      <span class="nav-label">${esc(c.label)}</span>
      <span class="nav-count">${c.count}</span>
    </button>`).join('');
  $$('#cat-nav .nav-item, .nav-item[data-view]').forEach(b => b.onclick = () => {
    state.nav = b.dataset.view;
    state.detailId = null;
    syncNavActive(); render();
  });
}
function syncNavActive() {
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === state.nav));
}
function getRecent() {
  if (!state.data) return [];
  return [...state.data.skills].sort((a, b) => b.mtime - a.mtime).slice(0, 15);
}
function visibleSkills() {
  const d = state.data;
  let list;
  if (state.nav === 'all') list = d.skills;
  else if (state.nav === 'recent') list = getRecent();
  else list = d.skills.filter(s => s.category === state.nav);
  const q = state.query.trim().toLowerCase();
  if (q) list = list.filter(s =>
    s.name.toLowerCase().includes(q) || s.dirname.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q));
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'),
    time: (a, b) => b.mtime - a.mtime,
    source: (a, b) => a.root_label.localeCompare(b.root_label, 'zh-Hans-CN') || a.name.localeCompare(b.name, 'zh-Hans-CN'),
  };
  return [...list].sort(sorters[state.sort] || sorters.name);
}
function isInstalledAnywhere(s) {
  return Object.values(s.agents || {}).some(a => a.installed && !a.here);
}

function render() {
  if (!state.data) return;
  renderNav();
  const list = visibleSkills();
  const titles = { all: '全部技能', recent: '最近新增' };
  const title = titles[state.nav] || catLabel(state.nav);
  $('#view-title').textContent = title;
  const qHint = state.query ? `匹配 “${esc(state.query)}” · ` : '';
  $('#view-sub').textContent = `${qHint}共 ${list.length} 个技能`;

  const content = $('#content');
  if (state.nav === 'all' && !state.query) {
    const d = state.data;
    const installed = d.skills.filter(isInstalledAnywhere).length;
    content.innerHTML = `<div class="content-inner">
      <div class="stat-row">
        <div class="stat-card"><div class="stat-num">${d.skills.length}</div><div class="stat-label">已收录技能</div></div>
        <div class="stat-card"><div class="stat-num">${d.categories.length}</div><div class="stat-label">自动分类</div></div>
        <div class="stat-card"><div class="stat-num">${d.roots.length}</div><div class="stat-label">来源目录</div></div>
        <div class="stat-card"><div class="stat-num">${installed}</div><div class="stat-label">已安装到其他智能体</div></div>
      </div>
      ${cardGrid(list)}
    </div>`;
  } else {
    content.innerHTML = `<div class="content-inner">${list.length ? cardGrid(list) : emptyHtml()}</div>`;
  }
  $$('.skill-card').forEach(c => c.onclick = () => openDetail(c.dataset.id));
}
function emptyHtml() {
  return `<div class="empty"><div class="empty-big">没有匹配的技能</div><div>换个关键词，或在左侧切换分类</div></div>`;
}
function cardGrid(list) {
  return `<div class="grid">${list.map(cardHtml).join('')}</div>`;
}
function cardHtml(s) {
  const installed = isInstalledAnywhere(s);
  return `<button class="skill-card" data-id="${s.id}">
    <div class="card-head">
      <div class="monogram">${esc(monogram(s.name))}</div>
      <div class="card-title-wrap">
        <div class="card-name">${esc(s.name)}</div>
        <div class="card-dir">${esc(s.dirname)}</div>
      </div>
      ${s.version ? `<span class="ver-chip">v${esc(s.version)}</span>` : ''}
    </div>
    <div class="card-desc">${esc(s.description)}</div>
    <div class="card-foot">
      <span class="cat-chip">${esc(catLabel(s.category))}</span>
      <span class="dot-sep"></span>
      <span class="src-chip">${esc(s.root_label)}</span>
      ${installed ? `<span class="installed-chip">已安装</span>` : ''}
    </div>
  </button>`;
}

/* ---------------- 详情 ---------------- */
async function openDetail(id) {
  state.detailId = id;
  $('#detail').hidden = false;
  $('#detail-body').innerHTML = `<div class="loading">加载中…</div>`;
  const d = await api('/api/skill_detail?id=' + encodeURIComponent(id));
  if (d.error || state.detailId !== id) return;
  renderDetail(d);
}
function closeDetail() {
  state.detailId = null;
  $('#detail').hidden = true;
}
function renderDetail(s) {
  const catOptions = Object.entries(state.data.cat_labels)
    .map(([cid, label]) => `<option value="${cid}" ${cid === s.category ? 'selected' : ''}>${esc(label)}</option>`).join('');
  const agentRows = state.data.agents.length ? state.data.agents.map(a => {
    const st = s.agents?.[a.id] || { installed: false, here: false };
    return `<div class="agent-row">
      <div class="agent-info">
        <div class="agent-name">${esc(a.name)}</div>
        <div class="agent-path">${esc(a.path)}</div>
      </div>
      ${st.here ? `<span class="agent-state">原始位置</span>`
        : st.installed
          ? `<span class="agent-state">已安装</span><button class="btn btn-pearl btn-sm js-uninstall" data-agent="${a.id}">移除</button>`
          : `<span class="agent-state absent">未安装</span><button class="btn btn-primary btn-sm js-install" data-agent="${a.id}">安装</button>`}
    </div>`;
  }).join('') : '<div style="color:var(--ink-48);font-size:13px">还没有智能体目标，点左下角“智能体管理”添加。</div>';

  $('#detail-actions').innerHTML = `
    <button class="btn btn-pearl" id="d-open-dir">打开目录</button>
    <button class="btn btn-pearl" id="d-open-md">打开 SKILL.md</button>`;
  $('#d-open-dir').onclick = () => api('/api/open', { path: s.path });
  $('#d-open-md').onclick = () => api('/api/open', { path: s.skill_md });

  $('#detail-body').innerHTML = `<div class="detail-inner">
    <div class="d-header">
      <div class="d-name">${esc(s.name)}</div>
      <div class="d-dir">${esc(s.path)}</div>
      <div class="d-chips">
        <span class="d-chip blue">${esc(catLabel(s.category))}</span>
        ${s.version ? `<span class="d-chip">版本 ${esc(s.version)}</span>` : ''}
        <span class="d-chip">${s.file_count} 个文件 · ${s.size_kb} KB</span>
        <span class="d-chip">更新于 ${fmtDate(s.mtime)}</span>
        ${s.license ? `<span class="d-chip">${esc(s.license.slice(0, 40))}</span>` : ''}
        <label class="d-chip" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">
          手动改分类
          <select id="cat-select" style="border:none;background:transparent;font-family:inherit;font-size:12.5px;color:var(--primary);outline:none">${catOptions}</select>
        </label>
      </div>
    </div>

    <div class="d-section">
      <div class="d-section-title">用途说明</div>
      <div class="d-desc">${esc(s.description)}</div>
      ${s.bins?.length ? `<div style="margin-top:12px;font-size:13px;color:var(--ink-48)">依赖命令：${s.bins.map(b => `<code style="background:rgba(0,0,0,.05);border-radius:5px;padding:1px 7px;margin-right:6px">${esc(b)}</code>`).join('')}</div>` : ''}
    </div>

    <div class="d-section">
      <div class="d-section-title">安装到智能体 <span class="hint">把整个技能目录复制到目标智能体的 skills 目录</span></div>
      ${agentRows}
    </div>

    <div class="d-section">
      <div class="d-section-title">基本信息</div>
      <dl class="kv">
        <dt>来源</dt><dd>${esc(s.root_label)}</dd>
        <dt>目录名</dt><dd>${esc(s.dirname)}</dd>
        <dt>完整路径</dt><dd>${esc(s.path)}<span class="row-actions">
          <button class="text-btn" id="copy-path">复制</button>
          <button class="text-btn" id="open-path">在资源管理器显示</button></span></dd>
        <dt>自动分类</dt><dd>${esc(catLabel(s.auto_category))}${s.auto_category !== s.category ? '（你已手动调整）' : ''}</dd>
        ${s.also_in?.length ? `<dt>同时挂载于</dt><dd>${s.also_in.map(a => `${esc(a.root_label)}`).join('、')}（软链接/副本，已合并显示）</dd>` : ''}
      </dl>
    </div>

    <div class="d-section">
      <div class="d-section-title">文件结构</div>
      ${treeHtml(s.tree)}
    </div>

    <div class="d-section">
      <div class="d-section-title">技能文档原文 <span class="hint">SKILL.md</span></div>
      <div class="doc-md" id="doc-md">${renderMarkdown(s.doc || '')}</div>
    </div>
  </div>`;

  $('#copy-path').onclick = () => copyText(s.path);
  $('#open-path').onclick = () => api('/api/open', { path: s.path });
  $('#cat-select').onchange = async e => {
    await api('/api/set_category', { id: s.id, category: e.target.value });
    await reload(false);
    openDetail(s.id);
    toast(['已调整分类', '新分类已记住，下次扫描保持不变'], [], 2200);
  };
  $$('.js-install').forEach(b => b.onclick = () => doInstall(s, b.dataset.agent, false));
  $$('.js-uninstall').forEach(b => b.onclick = () => doUninstall(s, b.dataset.agent));
}

function treeHtml(tree) {
  if (!tree || !tree.length) return '<div style="color:var(--ink-48);font-size:13px">空目录</div>';
  const row = n => n.dir
    ? `<li><span class="dir"><svg viewBox="0 0 16 16" width="12" height="12" style="vertical-align:-1px;margin-right:3px"><path d="M1.5 4.2c0-.8.6-1.4 1.4-1.4h3l1.6 1.7h5.6c.8 0 1.4.6 1.4 1.4v5.9c0 .8-.6 1.4-1.4 1.4H2.9c-.8 0-1.4-.6-1.4-1.4V4.2Z" fill="none" stroke="currentColor" stroke-width="1.35"/></svg>${esc(n.name)}/</span>${n.children?.length ? `<ul>${n.children.slice(0, 30).map(c => `<li>${esc(c)}</li>`).join('')}${n.children.length > 30 ? '<li>…</li>' : ''}</ul>` : ''}</li>`
    : `<li>${esc(n.name)}</li>`;
  return `<ul class="tree">${tree.map(row).join('')}</ul>`;
}

async function doInstall(s, agentId, overwrite) {
  const r = await api('/api/install', { id: s.id, agent_id: agentId, overwrite });
  if (!r.ok && r.error && r.error.includes('已存在')) {
    confirmModal('目标已存在同名技能，是否覆盖？', '覆盖会用当前版本替换目标目录中的全部文件。', async () => {
      const r2 = await api('/api/install', { id: s.id, agent_id: agentId, overwrite: true });
      finishInstall(r2, s);
    });
    return;
  }
  finishInstall(r, s);
}
function finishInstall(r, s) {
  if (r.ok) { toast(['安装完成', r.target || ''], [], 2400); reload(false).then(() => openDetail(s.id)); }
  else alertModal('安装失败', r.error || '未知错误');
}
async function doUninstall(s, agentId) {
  const ag = state.data.agents.find(a => a.id === agentId);
  confirmModal(`从「${ag?.name || '目标'}」移除该技能？`, '将删除目标目录中这份技能副本，原始位置的技能不受影响。', async () => {
    const r = await api('/api/uninstall', { id: s.id, agent_id: agentId });
    if (r.ok) { toast(['已移除'], [], 1800); reload(false).then(() => openDetail(s.id)); }
    else alertModal('移除失败', r.error || '未知错误');
  });
}

/* ---------------- 极简 Markdown ---------------- */
function renderMarkdown(src) {
  if (!src) return '';
  let s = src;
  const fm = s.match(/^---[\s\S]*?\n---\s*\n?/);
  if (fm) s = s.slice(fm[0].length);
  const codeBlocks = [];
  s = s.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(`<pre><code>${esc(code.replace(/\n$/, ''))}</code></pre>`);
    return ` BLOCK${codeBlocks.length - 1} `;
  });
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // 表格
  s = s.replace(/(^\|.*\|\n(?:\|\s*:?-{2,}.*\|\n)(?:\|.*\|\n?)+)/gm, block => {
    const lines = block.trim().split('\n');
    const head = lines[0].split('|').slice(1, -1).map(x => x.trim());
    const rows = lines.slice(2).map(l => l.split('|').slice(1, -1).map(x => x.trim()));
    return `<table><thead><tr>${head.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  });
  const lines = s.split('\n');
  let html = '', inUl = false, inOl = false, inQuote = false;
  const closeLists = () => { if (inUl) { html += '</ul>'; inUl = false; } if (inOl) { html += '</ol>'; inOl = false; } };
  const closeQuote = () => { if (inQuote) { html += '</blockquote>'; inQuote = false; } };
  for (let line of lines) {
    const t = line.trim();
    if (!t) { closeLists(); closeQuote(); continue; }
    let m;
    if ((m = t.match(/^#{1,6}\s+(.*)/))) { closeLists(); closeQuote(); html += `<h${m[0].split(' ')[0].length}>${inline(m[1])}</h${m[0].split(' ')[0].length}>`; continue; }
    if (/^(-{3,}|\*{3,})$/.test(t)) { closeLists(); closeQuote(); html += '<hr>'; continue; }
    if ((m = t.match(/^>\s?(.*)/))) { closeLists(); if (!inQuote) { html += '<blockquote>'; inQuote = true; } html += `<p>${inline(m[1])}</p>`; continue; }
    if ((m = t.match(/^[-*]\s+(.*)/))) { closeQuote(); if (!inUl) { html += '<ul>'; inUl = true; } html += `<li>${inline(m[1])}</li>`; continue; }
    if ((m = t.match(/^\d+[.、]\s*(.*)/))) { closeQuote(); if (!inOl) { html += '<ol>'; inOl = true; } html += `<li>${inline(m[1])}</li>`; continue; }
    closeLists(); closeQuote();
    if (/ BLOCK\d+ /.test(t)) { html += t; } else html += `<p>${inline(t)}</p>`;
  }
  closeLists(); closeQuote();
  html = html.replace(/ BLOCK(\d+) /g, (_, i) => codeBlocks[+i]);
  return html;
}
function inline(t) {
  return t
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

/* ---------------- 弹窗 ---------------- */
function modalOpen(inner) {
  $('#modal').innerHTML = inner;
  $('#modal-mask').hidden = false;
  $('#modal-mask').onclick = e => { if (e.target === $('#modal-mask')) modalClose(); };
}
function modalClose() { $('#modal-mask').hidden = true; }
function alertModal(title, msg) {
  modalOpen(`<div class="modal-head"><div class="modal-title">${esc(title)}</div><button class="modal-close">×</button></div>
    <div class="modal-body" style="color:var(--ink-80);font-size:14px;line-height:1.6">${esc(msg)}</div>
    <div class="modal-foot"><button class="btn btn-primary" id="m-ok">好</button></div>`);
  $('#m-ok').onclick = modalClose;
  $('.modal-close').onclick = modalClose;
}
function confirmModal(title, msg, onOk) {
  modalOpen(`<div class="modal-head"><div class="modal-title">${esc(title)}</div></div>
    <div class="modal-body" style="color:var(--ink-80);font-size:14px;line-height:1.6">${esc(msg)}</div>
    <div class="modal-foot"><button class="btn btn-pearl" id="m-cancel">取消</button>
    <button class="btn btn-primary" id="m-ok">确认</button></div>`);
  $('#m-cancel').onclick = modalClose;
  $('#m-ok').onclick = () => { modalClose(); onOk(); };
}

/* ---------- 来源目录管理 ---------- */
// ＋按钮：调用后端弹出系统原生文件夹选择器，把选中路径填进输入框
function bindPickBtns() {
  $$('[data-pick]').forEach(btn => {
    btn.onclick = async () => {
      const input = document.getElementById(btn.dataset.pick);
      const labelInput = btn.dataset.label ? document.getElementById(btn.dataset.label) : null;
      const old = btn.textContent;
      btn.disabled = true; btn.textContent = '…';
      try {
        const init = input && input.value ? encodeURIComponent(input.value) : '';
        const r = await (await fetch('/api/pick_dir' + (init ? '?initial=' + init : ''))).json();
        if (r.ok && r.path) {
          input.value = r.path;
          // 名称留空时，自动用文件夹名补一个建议名
          if (labelInput && !labelInput.value.trim()) {
            labelInput.value = r.path.split(/[\\/]/).filter(Boolean).pop() || '';
          }
          input.focus();
        } else if (r.error) {
          toast([r.error], [], 2600);
        }
      } catch (e) {
        toast(['无法打开文件夹选择器，请手动粘贴路径'], [], 2600);
      } finally {
        btn.disabled = false; btn.textContent = old;
      }
    };
  });
}

function openRootsModal() {
  const rows = state.data.roots.map(r => `<div class="list-row">
    <div class="grow"><div class="name">${esc(r.label)} ${r.exists ? '' : '<span class="badge-missing">目录不存在</span>'}</div>
      <div class="path">${esc(r.path)}</div></div>
    <button class="btn btn-pearl btn-sm" data-open="${esc(r.path)}">打开</button>
    ${r.builtin ? '' : `<button class="btn btn-pearl btn-sm" data-del="${r.id}">移除</button>`}
  </div>`).join('');
  modalOpen(`<div class="modal-head"><div class="modal-title">来源目录</div><button class="modal-close">×</button></div>
    <div class="modal-body">
      <div style="font-size:13px;color:var(--ink-48);margin-bottom:10px">SkillG 会扫描这些目录下的技能；新放入的技能将被自动识别分类。</div>
      ${rows}
      <div style="border-top:1px solid var(--divider-soft);margin-top:12px;padding-top:14px">
        <div class="field"><label>显示名称</label><input id="nr-label" placeholder="例如：工作项目技能"></div>
        <div class="field"><label>目录绝对路径</label><div class="path-row"><input id="nr-path" placeholder="例如 D:\\my-skills"><button type="button" class="pick-btn" data-pick="nr-path" data-label="nr-label" title="打开文件夹选择器">＋</button></div></div>
        <div class="err" id="nr-err"></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-pearl" id="m-cancel">关闭</button>
      <button class="btn btn-primary" id="nr-add">添加并扫描</button></div>`);
  $('.modal-close').onclick = modalClose;
  $('#m-cancel').onclick = modalClose;
  bindPickBtns();
  $$('[data-open]').forEach(b => b.onclick = () => api('/api/open', { path: b.dataset.open }));
  $$('[data-del]').forEach(b => b.onclick = async () => {
    await api('/api/del_root', { id: b.dataset.del }); await reload(); openRootsModal();
  });
  $('#nr-add').onclick = async () => {
    const label = $('#nr-label').value.trim(), path = $('#nr-path').value.trim();
    const r = await api('/api/add_root', { label, path });
    if (!r.ok) { $('#nr-err').textContent = r.error || '添加失败'; return; }
    modalClose(); await reload(); render();
    toast(['已添加来源目录', path], [], 2200);
  };
}

/* ---------- 智能体管理 ---------- */
function openAgentsModal() {
  const rows = state.data.agents.map(a => `<div class="list-row">
    <div class="grow"><div class="name">${esc(a.name)}</div><div class="path">${esc(a.path)}</div></div>
    <button class="btn btn-pearl btn-sm" data-open="${esc(a.path)}">打开</button>
    <button class="btn btn-pearl btn-sm" data-del="${a.id}">删除</button>
  </div>`).join('') || '<div style="color:var(--ink-48;font-size:13px">暂无</div>';
  modalOpen(`<div class="modal-head"><div class="modal-title">智能体管理</div><button class="modal-close">×</button></div>
    <div class="modal-body">
      <div style="font-size:13px;color:var(--ink-48);margin-bottom:10px">“安装技能”会把技能目录复制到所选智能体的 skills 目录中。</div>
      ${rows}
      <div style="border-top:1px solid var(--divider-soft);margin-top:12px;padding-top:14px">
        <div class="field"><label>智能体名称</label><input id="na-name" placeholder="例如：写作 Agent"></div>
        <div class="field"><label>skills 目录绝对路径</label><div class="path-row"><input id="na-path" placeholder="例如 C:\\Users\\me\\.agents\\skills"><button type="button" class="pick-btn" data-pick="na-path" data-label="na-name" title="打开文件夹选择器">＋</button></div></div>
        <div class="err" id="na-err"></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-pearl" id="m-cancel">关闭</button>
      <button class="btn btn-primary" id="na-add">添加智能体</button></div>`);
  $('.modal-close').onclick = modalClose;
  $('#m-cancel').onclick = modalClose;
  bindPickBtns();
  $$('[data-open]').forEach(b => b.onclick = () => api('/api/open', { path: b.dataset.open }));
  $$('[data-del]').forEach(b => b.onclick = async () => {
    await api('/api/del_agent', { id: b.dataset.del }); await reload(); openAgentsModal();
  });
  $('#na-add').onclick = async () => {
    const name = $('#na-name').value.trim(), path = $('#na-path').value.trim();
    const r = await api('/api/add_agent', { name, path });
    if (!r.ok) { $('#na-err').textContent = r.error || '添加失败'; return; }
    modalClose(); await reload();
    toast(['已添加智能体', name], [], 2000);
  };
}

/* ---------------- Toast ---------------- */
function toast(lines, actions = [], duration = 3200) {
  const wrap = $('#toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div><div class="t-title">${esc(lines[0] || '')}</div>` +
    (lines[1] ? `<div class="t-sub">${esc(lines[1])}</div>` : '') + `</div>
    <div class="t-actions">${actions.map((a, i) =>
      `<button class="t-btn ${i === 0 ? 'blue' : 'ghost'}" data-i="${i}">${esc(a.label)}</button>`).join('')}
    ${actions.length ? '' : '<button class="t-btn ghost" data-close="1">知道了</button>'}</div>`;
  wrap.appendChild(el);
  el.querySelectorAll('button').forEach(b => b.onclick = () => {
    const i = b.dataset.i;
    if (i !== undefined) actions[+i].fn();
    dismiss();
  });
  const timer = setTimeout(dismiss, duration);
  function dismiss() { clearTimeout(timer); el.classList.add('toast-out'); setTimeout(() => el.remove(), 260); }
}

async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast(['已复制到剪贴板'], [], 1400); }
  catch { const i = document.createElement('input'); i.value = t; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); }
}

/* ---------------- 数据轮询 ---------------- */
async function reload(renderList = true) {
  state.data = await api('/api/state');
  if (renderList && !state.detailId) render();
  else renderNav();
  updateWatchUI();
}
function updateWatchUI() {
  const on = state.data.watching;
  $('#watch-dot').classList.toggle('on', on);
  $('#watch-dot').classList.toggle('off', !on);
  $('#watch-text').textContent = on ? '已开启实时监听' : '监听已关闭';
  $('#watch-toggle').textContent = on ? '关闭' : '开启';
}
async function poll() {
  try {
    const d = await api('/api/state');
    const prevVer = state.data?.version;
    const hadRecents = (state.data?.recently_found?.length || 0) > 0;
    state.data = d;
    if (!state.detailId) render(); else renderNav();
    updateWatchUI();
    if (!state.firstLoad && d.version !== prevVer && d.recently_found?.length) {
      const names = d.recently_found.slice(0, 3).map(r => `${r.name} → ${r.category_label}`).join('；');
      const more = d.recently_found.length > 3 ? ` 等 ${d.recently_found.length} 个` : '';
      toast(['检测到新技能，已自动归类', names + more], [
        { label: '查看', fn: () => { state.nav = 'recent'; syncNavActive(); render(); api('/api/seen'); } },
        { label: '知道了', fn: () => api('/api/seen') },
      ], 8000);
    }
    state.firstLoad = false;
  } catch (e) { /* 服务未就绪时忽略 */ }
}

/* ---------------- 事件绑定 ---------------- */
$('#search').addEventListener('input', e => { state.query = e.target.value; render(); });
$('#detail-back').onclick = closeDetail;
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#modal-mask').hidden) modalClose(); else if (!$('#detail').hidden) closeDetail(); } });
$('#sort-seg').onclick = e => {
  const b = e.target.closest('.seg-item'); if (!b) return;
  $$('#sort-seg .seg-item').forEach(x => x.classList.toggle('active', x === b));
  state.sort = b.dataset.sort; render();
};
$('#btn-rescan').onclick = async e => {
  const btn = e.currentTarget;
  btn.disabled = true; btn.textContent = '扫描中…';
  const r = await api('/api/rescan');
  state.data = r.state; render();
  toast(['扫描完成', `共收录 ${r.total} 个技能`], [], 2000);
  btn.disabled = false;
  btn.innerHTML = '<span data-ico="refresh"></span>立即重新扫描';
  injectFootIcons();
};
$('#btn-roots').onclick = openRootsModal;
$('#btn-agents').onclick = openAgentsModal;
$('#watch-toggle').onclick = async () => {
  const on = !state.data.watching;
  await api('/api/set_watch', { on });
  await reload();
};
function injectFootIcons() {
  $('#btn-roots span[data-ico]').innerHTML = ICONS.folder;
  $('#btn-agents span[data-ico]').innerHTML = ICONS.agent;
  $('#btn-rescan span[data-ico]').innerHTML = ICONS.refresh;
  $$('.nav-item[data-view="all"] .nav-ico').forEach(e => e.innerHTML = ICONS.grid);
  $$('.nav-item[data-view="recent"] .nav-ico').forEach(e => e.innerHTML = ICONS.clock);
}

(async function init() {
  // 静态图标
  document.querySelectorAll('[data-ico]').forEach(el => { if (ICONS[el.dataset.ico]) el.innerHTML = ICONS[el.dataset.ico]; });
  await reload();
  injectFootIcons();
  setInterval(poll, 5000);
  // 深链：?open=<id> 直达技能详情；?modal=agents|roots 直达弹窗（便于书签/排障）
  const q = new URLSearchParams(location.search);
  if (q.get('modal') === 'agents') openAgentsModal();
  if (q.get('modal') === 'roots') openRootsModal();
  const openId = q.get('open');
  if (openId) openDetail(openId);
})();
