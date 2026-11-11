(() => {
  'use strict';

  const STORAGE_KEY = 'sunny-home-content-v1';
  const SCHEDULE_KEY = 'sunny-home-spurs-v1';
  const SCHEDULE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/24/schedule';
  const SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
  const STANDINGS_URL = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?type=0&level=2';
  const MIGU_URL = 'https://www.miguvideo.com/';
  // Published match IDs from Migu's official schedule, retrieved 2026-11-09.
  // Match on Beijing date, opponent and home/away to distinguish repeat fixtures.
  const MIGU_MATCHES = [
    { date: '2026-11-08', opponent: '开拓者', homeAway: 'away', matchId: '120000588367' },
    { date: '2026-11-10', opponent: '太阳', homeAway: 'away', matchId: '120000588381' },
    { date: '2026-11-12', opponent: '公牛', homeAway: 'away', matchId: '120000588394' },
    { date: '2026-11-14', opponent: '勇士', homeAway: 'home', matchId: '120000590162' }
  ];
  const DEFAULT_PROFILE = {
    siteName: 'Vertex',
    nickname: "Xu Mingchen",
    bio: 'Vertex——连接想法与生活的地方。',
    avatar: null
  };
  const TEAM_NAMES = {
    ATL: '老鹰', BOS: '凯尔特人', BKN: '篮网', CHA: '黄蜂', CHI: '公牛',
    CLE: '骑士', DAL: '独行侠', DEN: '掘金', DET: '活塞', GS: '勇士', GSW: '勇士',
    HOU: '火箭', IND: '步行者', LAC: '快船', LAL: '湖人', MEM: '灰熊', MIA: '热火',
    MIL: '雄鹿', MIN: '森林狼', NO: '鹈鹕', NOP: '鹈鹕', NY: '尼克斯', NYK: '尼克斯',
    OKC: '雷霆', ORL: '魔术', PHI: '76人', PHX: '太阳', POR: '开拓者', SAC: '国王',
    SA: '马刺', SAS: '马刺', TOR: '猛龙', UTAH: '爵士', UTA: '爵士', WSH: '奇才', WAS: '奇才'
  };
  const ICONS = {
    'arrow-left': '<path d="M19 12H5m7-7-7 7 7 7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
    pen: '<path d="m15 4 5 5M4 20l5-1 12-12a2.1 2.1 0 0 0-5-5L4 15l-1 6Z"/>',
    edit: '<path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7M16 3l5 5M10 14l-1 4 4-1L22 8a2.8 2.8 0 0 0-4-4Z"/>',
    'arrow-down': '<path d="M12 4v16m-6-6 6 6 6-6"/>',
    'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    'folder-plus': '<path d="M3 8V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8h18M12 11v6m-3-3h6"/>',
    folder: '<path d="M3 8V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8h18"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
    sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>',
    refresh: '<path d="M20 7A8 8 0 0 0 6 4L3 7m0-5v5h5M4 17a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    play: '<path d="m8 4 12 8-12 8Z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const icon = name => `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`;
  const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  function hydrateIcons(parent = document) {
    $$('[data-icon]', parent).forEach(element => { element.innerHTML = icon(element.dataset.icon); });
  }

  let toastTimer;
  function toast(message) {
    const element = $('#toast');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 4200);
  }

  function emptyState() {
    return { profile: { ...DEFAULT_PROFILE }, projects: [], posts: [] };
  }

  // Capture authored markup before rendering the route, schedule or dialogs.
  const originalHtml = '<!doctype html>\n' + document.documentElement.outerHTML;
  const savedContent = document.querySelector('#site-content');
  let fileRevision = savedContent.dataset.revision || '';
  let fileState = savedContent.textContent.trim() ? JSON.parse(savedContent.textContent) : emptyState();
  let siteFile;
  let fileSavePending = false;
  const canWriteHtml = window.isSecureContext && window.self === window.top && typeof window.showSaveFilePicker === 'function';
  const htmlName = location.protocol === 'file:' ? decodeURIComponent(location.pathname.split('/').pop()) : 'index.html';

  function readState() {
    let cached;
    try { cached = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { /* The HTML still works without storage. */ }

    const saved = cached && (cached.fileRevision || '') === fileRevision ? cached : JSON.parse(JSON.stringify(fileState));
    if (!Array.isArray(saved.projects) || !Array.isArray(saved.posts)) throw new Error('无法读取已保存的内容。');
    return { ...saved, profile: { ...DEFAULT_PROFILE, ...saved.profile } };
  }

  function buildHtml(doc, next, revision) {
    const content = doc.querySelector('#site-content');
    content.dataset.revision = revision;
    content.textContent = JSON.stringify(next).replace(/</g, '\\u003c');
    doc.title = next.profile.siteName + ' · 灵感在此交汇';
    for (const [attr, value] of [['site-name', next.profile.siteName], ['nickname', next.profile.nickname], ['bio', next.profile.bio]]) {
      doc.querySelectorAll('[data-' + attr + ']').forEach(node => { node.textContent = value; });
    }
    doc.querySelector('.brand').setAttribute('aria-label', next.profile.siteName + '首页');
    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  }

  async function saveHtml(change, download = false) {
    if (fileSavePending) throw new Error('正在保存，请稍候。');
    fileSavePending = true;
    let writer;
    try {
      const next = readState();
      change(next);
      delete next.fileRevision;
      const revision = uid();
      let source = originalHtml;
      let handle;
      if (canWriteHtml && !download) {
        handle = siteFile || await window.showSaveFilePicker({
          suggestedName: htmlName, types: [{ description: '网页文件', accept: { 'text/html': ['.html', '.htm'] } }]
        });
        writer = await handle.createWritable({ mode: 'exclusive' });
        const existing = await handle.getFile();
        if (existing.size) {
          source = await existing.text();
          const prior = new DOMParser().parseFromString(source, 'text/html').querySelector('#site-content');
          if (!prior) throw new Error('所选文件不是这个版本的网站。请选择当前打开的 HTML，或另存为新文件。');
          if ((prior.dataset.revision || '') !== fileRevision) throw new Error('该网页已被更新。请重新打开最新文件后再修改，或下载当前修改的副本。');
        }
      }
      const doc = new DOMParser().parseFromString(source, 'text/html');
      const html = buildHtml(doc, next, revision);
      if (handle) {
        await writer.write(html);
        await writer.close();
        writer = null;
        siteFile = handle;
        fileRevision = revision;
      } else {
        const href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = href;
        link.download = htmlName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(href), 60000);
      }
      fileState = next;
      state = next;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, fileRevision }));
      } catch { /* The file or downloaded copy already contains the full edit. */ }
      renderContent();
      return handle ? '已写入 ' + handle.name : '已发起 HTML 下载。请用下载的文件替换原网页。';
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('已取消保存，文件未修改。');
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') throw new Error('浏览器未允许写入文件，请使用“下载 HTML 副本”。');
      throw error;
    } finally {
      if (writer) await writer.abort().catch(() => {});
      fileSavePending = false;
    }
  }

  let state;
  try {
    state = readState();
  } catch {
    state = emptyState();
    setTimeout(() => toast('浏览器存储暂不可用，保存时请留意提示。'), 500);
  }

  function commit(change) {
    const next = readState();
    change(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, fileRevision }));
    } catch {
      throw new Error('保存失败，浏览器存储可能已满或被禁用。请减少图片大小后重试，当前输入仍已保留。');
    }
    state = next;
    renderContent();
  }

  function validImage(image) {
    return image && /^data:image\/(png|jpeg|webp|gif);base64,/.test(image.src || '') && Number(image.width) > 0 && Number(image.height) > 0;
  }

  function imageMarkup(image, alt, className = '') {
    if (!validImage(image)) return '';
    return `<img class="${className}" src="${escape(image.src)}" width="${Number(image.width)}" height="${Number(image.height)}" alt="${escape(alt)}" loading="lazy">`;
  }

  function avatarMarkup() {
    return validImage(state.profile.avatar) ? imageMarkup(state.profile.avatar, '我的头像') : escape(state.profile.nickname === DEFAULT_PROFILE.nickname ? '我' : [...state.profile.nickname][0] || '我');
  }

  function safeProjectUrl(value) {
    const input = String(value || '').trim();
    if (!input || /[\u0000-\u001f\\]/.test(input) || input.startsWith('//')) return null;
    try {
      if (/^https?:\/\//i.test(input)) {
        const url = new URL(input);
        return url.hostname ? url.href : null;
      }
      if (/^[a-z][a-z\d+.-]*:/i.test(input) || input.startsWith('#') || input.startsWith('?')) return null;
      const resolved = new URL(input, location.href);
      if (resolved.origin !== location.origin) return null;
      return input;
    } catch {
      return null;
    }
  }

  function renderProfile() {
    $$('[data-site-name]').forEach(element => { element.textContent = state.profile.siteName; });
    $$('[data-nickname]').forEach(element => { element.textContent = state.profile.nickname; });
    $$('[data-bio]').forEach(element => { element.textContent = state.profile.bio; });
    $$('[data-avatar]').forEach(element => { element.innerHTML = avatarMarkup(); });
    $('.brand').setAttribute('aria-label', `${state.profile.siteName}首页`);
    document.title = `${state.profile.siteName} · 灵感在此交汇`;
  }

  function renderProjects() {
    $('#project-count').textContent = state.projects.length;
    const list = $('#project-list');
    list.classList.toggle('has-projects', state.projects.length > 0);
    if (!state.projects.length) {
      list.innerHTML = `<div class="project-empty"><div class="empty-folder">${icon('folder-plus')}</div><h3>第一个作品，正在路上</h3><p>每一个有趣的项目，都从一个小小的想法开始。</p><button class="button outline" data-action="add-project">${icon('plus')}添加我的第一个项目</button><span class="empty-hint">支持项目网址或本站项目路径</span></div>`;
      return;
    }
    list.innerHTML = state.projects.map(project => {
      const url = safeProjectUrl(project.url);
      const cover = validImage(project.cover) ? imageMarkup(project.cover, `${project.title}项目封面`) : icon('folder');
      return `<article class="project-card"><a class="project-cover ${validImage(project.cover) ? '' : 'empty-cover'}" href="${escape(url || '#projects')}" target="_blank" rel="noopener noreferrer" aria-label="打开${escape(project.title)}">${cover}</a><div class="project-body"><h3><a href="${escape(url || '#projects')}" target="_blank" rel="noopener noreferrer">${escape(project.title)}</a></h3><p class="od-clamp-2">${escape(project.description || '一个新鲜出炉的小项目。')}</p><div class="project-actions"><button class="text-button" data-action="project-detail" data-id="${escape(project.id)}">项目详情${icon('arrow-up-right')}</button><div class="project-tools"><button class="icon-button" data-action="edit-project" data-id="${escape(project.id)}" aria-label="编辑${escape(project.title)}">${icon('edit')}</button><button class="icon-button" data-action="delete-project" data-id="${escape(project.id)}" aria-label="删除${escape(project.title)}">${icon('trash')}</button></div></div></div></article>`;
    }).join('');
  }

  function postDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date);
  }

  function renderPosts() {
    $('#post-count').textContent = state.posts.length;
    const list = $('#post-list');
    if (!state.posts.length) {
      list.innerHTML = `<div class="moments-empty"><span class="empty-spark">${icon('sparkles')}</span><p>生活里总有一些小事，值得写下来。</p><span>你的第一条碎碎念，从这里开始。</span></div>`;
      return;
    }
    list.innerHTML = state.posts.map(post => {
      const images = (post.images || []).filter(validImage);
      const gallery = images.length ? `<div class="post-photos ${images.length === 1 ? 'single' : ''}">${images.map((photo, index) => `<button data-action="photo" data-id="${escape(post.id)}" data-index="${index}" aria-label="查看第${index + 1}张配图">${imageMarkup(photo, `心得配图 ${index + 1}`)}</button>`).join('')}</div>` : '';
      return `<article class="post"><div class="post-header od-row"><span class="avatar">${avatarMarkup()}</span><div class="od-field od-fill"><span class="post-name">${escape(state.profile.nickname)}</span><time class="post-date" datetime="${escape(post.createdAt)}">${postDate(post.createdAt)}${post.edited ? ' · 已编辑' : ''}</time></div><div class="post-tools"><button class="icon-button" data-action="edit-post" data-id="${escape(post.id)}" aria-label="编辑这条心得">${icon('edit')}</button><button class="icon-button" data-action="delete-post" data-id="${escape(post.id)}" aria-label="删除这条心得">${icon('trash')}</button></div></div><p class="post-text">${escape(post.text)}</p>${gallery}<div class="post-footer"><span class="post-tag">${escape(post.tag || '日常')}</span><button class="text-button ${post.liked ? 'liked' : ''}" data-action="like-post" data-id="${escape(post.id)}" aria-pressed="${Boolean(post.liked)}">${icon('heart')}${post.liked ? '已喜欢' : '喜欢'}</button></div></article>`;
    }).join('');
  }

  function renderContent() {
    renderProfile();
    renderProjects();
    renderPosts();
    renderHomeUpdates();
  }

  function renderHomeUpdates() {
    const project = state.projects[0];
    const post = state.posts[0];
    $('#home-project-title').textContent = project?.title || '让想法，开始成形。';
    $('#home-project-title').classList.toggle('od-clamp-2', Boolean(project));
    $('#home-project-note').textContent = project ? '打开作品集，看看最近在做什么。' : '下一个想法，从这里开始。';
    $('#home-project-status').textContent = project ? `${state.projects.length} 个作品 · 持续生长` : "Ideas, taking shape.";
    $('#home-moment-preview').textContent = post?.text || '给今天，留一点空白。';
    $('#home-moment-preview').classList.toggle('od-clamp-2', Boolean(post));
    $('#home-moment-count').innerHTML = `${post ? `${state.posts.length} 条生活记录` : '开始记录日常'}${icon('arrow-right')}`;
    const updates = [
      ...state.posts.slice(0, 2).map(item => ({ ...item, kind: 'post', title: item.text })),
      ...state.projects.slice(0, 1).map(item => ({ ...item, kind: 'project' }))
    ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    $('#home-updates').innerHTML = updates.length ? updates.map(item => `<button class="update-row" data-action="${item.kind}-detail" data-id="${escape(item.id)}"><span class="update-type">${item.kind === 'project' ? 'NEW PROJECT' : 'LITTLE MOMENT'}</span><span class="od-field"><strong class="od-clamp-2">${escape(item.title)}</strong><small>${escape(postDate(item.createdAt))} · ${item.kind === 'project' ? '作品' : escape(item.tag || '日常')}</small></span>${icon('arrow-up-right')}</button>`).join('') : `<div class="updates-empty"><div class="od-field"><strong>Vertex 的下一页，由此开始。</strong><p>记录一个瞬间，或分享一个作品。</p></div><button class="text-button" data-action="compose">记录第一刻${icon('arrow-up-right')}</button></div>`;
  }

  const editorDialog = $('#editor-dialog');
  const editorForm = $('#editor-form');
  let editor = { kind: '', id: null, images: [], loading: false };
  let editorGeneration = 0;

  function field(id, label, value = '', options = {}) {
    const { required = false, multiline = false, maxLength = 120, placeholder = '', help = '' } = options;
    const attributes = `id="${id}" name="${id}" ${required ? 'required' : ''} maxlength="${maxLength}" aria-describedby="${id}-error ${id}-help" placeholder="${escape(placeholder)}"`;
    const control = multiline ? `<textarea ${attributes}>${escape(value)}</textarea>` : `<input ${attributes} value="${escape(value)}">`;
    return `<div class="field"><label for="${id}">${label}<span>${required ? '必填' : '选填'}</span></label>${control}<span class="field-help" id="${id}-help">${help}</span><span class="field-error" id="${id}-error"></span></div>`;
  }

  function fileField(label, multiple = false) {
    return `<div class="field"><label for="image-file">${label}<span>选填</span></label><input id="image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" ${multiple ? 'multiple' : ''} aria-describedby="image-help"><span class="field-help" id="image-help">JPG、PNG、WebP 或 GIF，单张不超过 2 MB${multiple ? '，最多 3 张' : ''}。</span><span id="file-loading" class="file-loading" role="status"></span><div class="file-preview" id="file-preview"></div></div>`;
  }

  function openEditor(kind, id = null) {
    editorGeneration++;
    let title;
    let content;
    let images = [];
    if (kind === 'project') {
      const project = state.projects.find(item => item.id === id) || {};
      title = id ? '编辑项目' : '添加一个新作品';
      content = field('project-title', '项目名称', project.title, { required: true, maxLength: 50, placeholder: '给你的作品起个名字' }) + field('project-url', '项目地址', project.url, { required: true, maxLength: 2000, placeholder: 'https://example.com 或 ./projects/demo/index.html', help: '打开项目时会跳转到此地址。本站项目需放入对应目录，并保留运行所需资源。' }) + field('project-description', '项目介绍', project.description, { multiline: true, maxLength: 1000, placeholder: '这个作品做了什么？有什么有趣的细节？' }) + fileField('项目封面');
      images = validImage(project.cover) ? [project.cover] : [];
    } else if (kind === 'post') {
      const post = state.posts.find(item => item.id === id) || {};
      title = id ? '编辑这条碎碎念' : '记录此刻的小美好';
      content = field('post-text', '想说的话', post.text, { required: true, multiline: true, maxLength: 3000, placeholder: '一个新灵感，一件小事，或是一场精彩的比赛…' }) + `<div class="field"><label for="post-tag">记录分类</label><select id="post-tag" name="post-tag">${['日常', '灵感', '设计', '看球'].map(tag => `<option ${post.tag === tag ? 'selected' : ''}>${tag}</option>`).join('')}</select></div>` + fileField('添加配图', true);
      images = (post.images || []).filter(validImage);
    } else {
      title = '编辑我的主页';
      content = field('site-name', '网站名称', state.profile.siteName, { required: true, maxLength: 10 }) + field('nickname', '我的昵称', state.profile.nickname, { required: true, maxLength: 20 }) + field('bio', '个人简介', state.profile.bio, { multiline: true, maxLength: 160 }) + fileField('我的头像');
      images = validImage(state.profile.avatar) ? [state.profile.avatar] : [];
    }
    editor = { kind, id, images, loading: false };
    $('#editor-title').textContent = title;
    $('#editor-body').innerHTML = content;
    $('#form-error').textContent = '';
    $('#save-button').disabled = false;
    $('#save-button').textContent = canWriteHtml ? '保存到 HTML' : '下载修改后的 HTML';
    $('#download-copy').hidden = !canWriteHtml;
    $('#save-help').textContent = canWriteHtml
      ? '首次保存时，请选中正在使用的网页文件并确认替换。'
      : '下载后用新文件替换原网页，修改即可随文件保留。';
    renderFilePreview();
    editorDialog.showModal();
  }

  function renderFilePreview() {
    $('#file-preview').innerHTML = editor.images.map((image, index) => `<div class="preview-item">${imageMarkup(image, `已选图片 ${index + 1}`)}<button type="button" data-action="remove-image" data-index="${index}">移除图片</button></div>`).join('');
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) return reject(new Error('请选择 JPG、PNG、WebP 或 GIF 图片。'));
      if (file.size > 2 * 1024 * 1024) return reject(new Error(`“${file.name}”超过 2 MB，请选择更小的图片。`));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('图片读取失败，请重新选择。'));
      reader.onload = () => {
        const image = new Image();
        image.onload = () => resolve({ src: reader.result, width: image.naturalWidth, height: image.naturalHeight, name: file.name });
        image.onerror = () => reject(new Error('这张图片无法打开，请更换图片。'));
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  editorForm.addEventListener('change', async event => {
    if (event.target.id !== 'image-file') return;
    const files = [...event.target.files];
    if (!files.length) return;
    const maxImages = editor.kind === 'post' ? 3 : 1;
    const previous = maxImages === 1 ? [] : editor.images;
    if (previous.length + files.length > maxImages) {
      $('#form-error').textContent = `最多添加 ${maxImages} 张图片，请移除一张后再选择。`;
      event.target.value = '';
      return;
    }
    const generation = editorGeneration;
    editor.loading = true;
    $('#save-button').disabled = true;
    $('#file-loading').textContent = '正在读取图片…';
    $('#form-error').textContent = '';
    try {
      const images = await Promise.all(files.map(readImage));
      if (generation !== editorGeneration) return;
      editor.images = [...previous, ...images];
      renderFilePreview();
    } catch (error) {
      if (generation === editorGeneration) $('#form-error').textContent = error.message;
    } finally {
      if (generation === editorGeneration) {
        editor.loading = false;
        $('#save-button').disabled = false;
        $('#file-loading').textContent = '';
        event.target.value = '';
      }
    }
  });

  function validateField(input) {
    const errorElement = $(`#${input.id}-error`);
    if (!errorElement) return true;
    let message = '';
    if (input.required && !input.value.trim()) message = '请填写此项后再保存。';
    if (input.id === 'project-url' && input.value.trim() && !safeProjectUrl(input.value)) message = '请输入 http(s) 网站地址或本站相对路径，例如 ./projects/demo/index.html。';
    errorElement.textContent = message;
    input.setAttribute('aria-invalid', Boolean(message));
    return !message;
  }

  editorForm.addEventListener('focusout', event => {
    if (event.target.matches('input, textarea')) validateField(event.target);
  });

  editorForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (editor.loading || fileSavePending) return;
    const invalid = $$('input:not([type=file]), textarea', editorForm).filter(input => !validateField(input));
    if (invalid.length) {
      $('#form-error').innerHTML = `请先完善以下内容：${invalid.map(input => `<a href="#${input.id}">${escape($(`label[for="${input.id}"]`, editorForm).childNodes[0].textContent)}</a>`).join('、')}`;
      invalid[0].focus();
      return;
    }
    const values = new FormData(editorForm);
    const value = name => String(values.get(name) || '').trim();
    const saveButton = $('#save-button');
    const previousLabel = saveButton.textContent;
    const downloadCopy = event.submitter?.id === 'download-copy';
    saveButton.disabled = true;
    $('#download-copy').disabled = true;
    saveButton.textContent = '正在保存…';
    $('#form-error').textContent = '';
    try {
      const message = await saveHtml(next => {
        if (editor.kind === 'profile') {
          next.profile = { siteName: value('site-name'), nickname: value('nickname'), bio: value('bio'), avatar: editor.images[0] || null };
          return;
        }
        const collection = editor.kind === 'project' ? next.projects : next.posts;
        const existingIndex = collection.findIndex(item => item.id === editor.id);
        if (editor.id && existingIndex === -1) throw new Error('这条内容已在另一窗口中删除。请关闭窗口后重新添加。');
        const existing = existingIndex >= 0 ? collection[existingIndex] : {};
        const shared = { ...existing, id: editor.id || uid(), createdAt: existing.createdAt || new Date().toISOString() };
        const entry = editor.kind === 'project'
          ? { ...shared, title: value('project-title'), url: safeProjectUrl(value('project-url')), description: value('project-description'), cover: editor.images[0] || null }
          : { ...shared, text: value('post-text'), tag: value('post-tag'), images: editor.images, edited: Boolean(editor.id), liked: Boolean(existing.liked) };
        if (existingIndex >= 0) collection[existingIndex] = entry;
        else collection.unshift(entry);
      }, downloadCopy);
      closeDialog(editorDialog);
      toast(message);
    } catch (error) {
      $('#form-error').textContent = error.message;
    } finally {
      $('#download-copy').disabled = false;
      saveButton.disabled = false;
      saveButton.textContent = previousLabel;
    }
  });

  let pendingDelete = null;
  function confirmDelete(kind, id) {
    pendingDelete = { kind, id };
    $('#confirm-title').textContent = kind === 'project' ? '删除这个项目？' : '删除这条心得？';
    $('#confirm-dialog').showModal();
  }

  $('#confirm-delete').addEventListener('click', async () => {
    if (!pendingDelete || fileSavePending) return;
    try {
      const message = await saveHtml(next => {
        const key = pendingDelete.kind === 'project' ? 'projects' : 'posts';
        next[key] = next[key].filter(item => item.id !== pendingDelete.id);
      });
      closeDialog($('#confirm-dialog'));
      pendingDelete = null;
      toast(message);
    } catch (error) {
      closeDialog($('#confirm-dialog'));
      toast(error.message);
    }
  });

  function showDetail(title, body) {
    $('#detail-title').textContent = title;
    $('#detail-body').innerHTML = body;
    $('#detail-dialog').showModal();
  }

  function showAbout() {
    location.hash = '/about';
  }

  // A bundled snapshot keeps the schedule available when the network is unavailable.
  const bundled = window.SPURS_SNAPSHOT || { games: [], season: '', updatedAt: '' };
  let schedule = bundled;
  try {
    const cached = JSON.parse(localStorage.getItem(SCHEDULE_KEY) || 'null');
    if (cached && Array.isArray(cached.games) && Date.parse(cached.updatedAt) > Date.parse(bundled.updatedAt)) schedule = cached;
  } catch { /* The bundled snapshot remains available. */ }
  let games = schedule.games.filter(game => Number.isFinite(Date.parse(game.date))).map(game => ({ ...game, observedAt: game.observedAt || schedule.updatedAt }));
  let season = schedule.season;
  let scheduleUpdatedAt = schedule.updatedAt;
  let lastStatusUpdate = null;
  let refreshRunning = false;
  let scheduleFilter = 'upcoming';
  let visibleGames = 12;

  function dateParts(value) {
    const parts = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
    return Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  }

  function teamName(team) {
    return TEAM_NAMES[team?.abbreviation] || team?.name || '对手待定';
  }

  function spurs(game) { return game.competitors.find(team => String(team.id) === '24'); }
  function opponent(game) { return game.competitors.find(team => String(team.id) !== '24'); }
  function gameState(game) { return game.status?.type?.state; }
  function isFresh(game) { return Date.now() - Date.parse(game.observedAt) < 120000; }
  function isLive(game) { return gameState(game) === 'in' && isFresh(game); }

  function gameLabel(game) {
    const type = game.status?.type;
    if (type?.name === 'STATUS_POSTPONED') return '已延期';
    if (type?.name === 'STATUS_CANCELED') return '已取消';
    if (gameState(game) === 'post') return '已结束';
    if (isLive(game)) return '进行中';
    if (gameState(game) === 'in' || Date.parse(game.date) < Date.now()) return '待更新';
    return '未开赛';
  }

  // ESPN team marks are bundled by team ID so cached games also work offline.
  const teamMarks = {"24":"assets/teams/24.webp","25":"assets/teams/25.webp","10":"assets/teams/10.webp","6":"assets/teams/6.webp","23":"assets/teams/23.webp","26":"assets/teams/26.webp","16":"assets/teams/16.webp","22":"assets/teams/22.webp","21":"assets/teams/21.webp","4":"assets/teams/4.webp","9":"assets/teams/9.webp","8":"assets/teams/8.webp","12":"assets/teams/12.webp","3":"assets/teams/3.webp","13":"assets/teams/13.webp","2":"assets/teams/2.webp","15":"assets/teams/15.webp","28":"assets/teams/28.webp","5":"assets/teams/5.webp","17":"assets/teams/17.webp","18":"assets/teams/18.webp","1":"assets/teams/1.webp","29":"assets/teams/29.webp","30":"assets/teams/30.webp","27":"assets/teams/27.webp","11":"assets/teams/11.webp","14":"assets/teams/14.webp","19":"assets/teams/19.webp","7":"assets/teams/7.webp","20":"assets/teams/20.webp"};

  function teamLogo(team) {
    const src = teamMarks[team?.id];
    return src ? `<img class="team-mark" src="${src}" width="28" height="28" alt="">` : '';
  }

  function inlineMatchup(game) {
    const teamWithName = team => `<span class="team-with-name">${teamLogo(team)}${escape(teamName(team))}</span>`;
    return `<span class="inline-matchup">${teamWithName(spurs(game))}<span class="match-divider">vs</span>${teamWithName(opponent(game))}</span>`;
  }

  function statusMarkup(game) {
    return isLive(game)
      ? '<span class="live-badge"><i class="live-dot" aria-hidden="true"></i>进行中</span>'
      : escape(gameLabel(game));
  }

  function matchupTitle(game) {
    return `${teamName(spurs(game))} vs ${teamName(opponent(game))}`;
  }

  function gameScore(game) {
    const homeTeam = spurs(game);
    const awayTeam = opponent(game);
    return `${homeTeam?.score || '0'} : ${awayTeam?.score || '0'}`;
  }

  function futureGames() {
    return games.filter(game => gameState(game) !== 'post' && game.status?.type?.name !== 'STATUS_CANCELED' && Date.parse(game.date) >= Date.now() - 6 * 60 * 60 * 1000).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  }

  function validMiguRoom(value) {
    try {
      const url = new URL(String(value || '').trim());
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
      if (url.hostname !== 'miguvideo.com' && !url.hostname.endsWith('.miguvideo.com')) return null;
      const isMatchPage = /^\/p\/live\/\d+\/?$/.test(url.pathname);
      const isLegacyPage = /^\/mgs\/(website|msite)\/prd\/(sportLive|liveDetail)\.html$/.test(url.pathname)
        && ['mgdbId', 'mgdbid', 'cid'].some(key => /^\d+$/.test(url.searchParams.get(key) || ''));
      const isSharedRoom = url.pathname === '/mgs/share/livingWidget/prd/home.html'
        && Boolean(url.searchParams.get('newLiveRoomId'));
      if (!isMatchPage && !isLegacyPage && !isSharedRoom) return null;
      url.protocol = 'https:';
      return url.href;
    } catch {
      return null;
    }
  }

  function miguRoomFor(game) {
    const saved = validMiguRoom(state.watchLinks?.[game.id]);
    if (saved) return saved;
    const date = dateParts(game.date);
    const dateKey = `${date.year}-${date.month}-${date.day}`;
    const match = MIGU_MATCHES.find(item => item.date === dateKey
      && item.opponent === teamName(opponent(game))
      && item.homeAway === spurs(game)?.homeAway);
    return match ? `${MIGU_URL}p/live/${match.matchId}` : null;
  }

  function gameDetailButton(game, className) {
    return `<button type="button" class="${className}" data-action="game-detail" data-id="${escape(game.id)}">比赛详情</button>`;
  }

  function watchButton(game, className) {
    const url = miguRoomFor(game);
    if (!url) {
      return gameDetailButton(game, 'button ' + className);
    }
    const label = gameState(game) === 'post' ? '打开本场比赛' : '进入咪咕直播间';
    return `<a class="button ${className}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${icon('play')}${label}${icon('arrow-up-right')}</a>`;
  }

  function renderSchedule() {
    const upcoming = futureGames();
    const featured = games.find(isLive) || upcoming[0] || [...games].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
    const container = $('#featured-game');
    if (!featured) {
      container.innerHTML = `<p>暂未获取到马刺赛程</p><a class="button watch-button" href="https://www.nba.com/spurs/schedule" target="_blank" rel="noopener noreferrer">查看官方赛程${icon('arrow-up-right')}</a>`;
      $('#home-spurs-preview').innerHTML = '<span class="home-game-title">等待下一个比赛日</span><span class="home-game-meta">进入赛事页刷新赛程，或查看官方信息。</span>';
    } else {
      const date = dateParts(featured.date);
      const ownTeam = spurs(featured);
      const otherTeam = opponent(featured);
      const live = isLive(featured);
      const result = gameState(featured) === 'post' || live;
      const tip = live ? '正在为热爱上场' : gameState(featured) === 'post' ? '最近一场比赛' : '下一场，一起为马刺加油';
      container.innerHTML = `<div class="featured-top"><span class="game-kicker">${tip}</span><span class="game-state">${statusMarkup(featured)}</span></div><div class="matchup"><div class="matchup-team">${teamLogo(ownTeam)}<strong>马刺</strong><span>SAN ANTONIO</span></div><span class="versus ${result ? 'score' : ''}">${result ? gameScore(featured) : 'VS'}</span><div class="matchup-team">${teamLogo(otherTeam)}<strong>${escape(teamName(otherTeam))}</strong><span>${escape(otherTeam?.abbreviation || '')}</span></div></div><p class="matchup-date">${Number(date.month)} 月 ${Number(date.day)} 日 ${date.weekday} · ${featured.timeValid === false ? '时间待定' : `${date.hour}:${date.minute}`} · ${ownTeam?.homeAway === 'home' ? '主场' : '客场'}</p>${watchButton(featured, 'watch-button')}${miguRoomFor(featured) ? gameDetailButton(featured, 'featured-details') : ''}`;
      $('#home-spurs-preview').innerHTML = `<span class="home-game-title">${inlineMatchup(featured)}</span><span class="home-game-meta">${date.month}.${date.day} · ${featured.timeValid === false ? '时间待定' : `${date.hour}:${date.minute}`} 北京时间 · ${statusMarkup(featured)}</span><div class="home-game-actions">${watchButton(featured, 'outline')}${miguRoomFor(featured) ? gameDetailButton(featured, 'text-button') : ''}</div>`;
    }
    const rows = upcoming.filter(game => game.id !== featured?.id).slice(0, 3);
    $('#upcoming-games').innerHTML = rows.length ? rows.map(game => {
      const date = dateParts(game.date);
      return `<div class="game-row${isLive(game) ? ' is-live' : ''}"><div class="game-date od-field"><strong>${date.month}.${date.day}</strong><small>${date.weekday}</small></div><div class="game-opponent od-field od-fill"><strong><button class="row-match" data-action="game-detail" data-id="${escape(game.id)}" aria-label="${escape(matchupTitle(game))} 比赛详情">${inlineMatchup(game)}</button></strong><small>${spurs(game)?.homeAway === 'home' ? '主场' : '客场'} · ${statusMarkup(game)}</small></div><span class="game-time">${game.timeValid === false ? '待定' : `${date.hour}:${date.minute}`}</span></div>`;
    }).join('') : '<p class="no-games">暂无后续赛程，可查看完整赛程。</p>';
    $('#season-label').textContent = `${season || '当前赛季'} · 北京时间`;
    updateMonthOptions();
    renderFullSchedule();
    refreshBox();
  }

  function updateMonthOptions() {
    const select = $('#month-filter');
    const selected = select.value;
    const months = [...new Set(games.map(game => {
      const date = dateParts(game.date);
      return `${date.year}-${date.month}`;
    }))].sort();
    select.innerHTML = '<option value="all">全部月份</option>' + months.map(month => `<option value="${month}">${month.replace('-', ' 年 ')} 月</option>`).join('');
    select.value = months.includes(selected) ? selected : 'all';
  }

  function renderFullSchedule() {
    const month = $('#month-filter').value;
    let filtered = [...games];
    if (scheduleFilter === 'upcoming') filtered = futureGames();
    if (scheduleFilter === 'finished') filtered = filtered.filter(game => gameState(game) === 'post');
    if (month !== 'all') filtered = filtered.filter(game => {
      const date = dateParts(game.date);
      return `${date.year}-${date.month}` === month;
    });
    filtered.sort((a, b) => scheduleFilter === 'finished' ? Date.parse(b.date) - Date.parse(a.date) : Date.parse(a.date) - Date.parse(b.date));
    $('#full-schedule').innerHTML = filtered.length ? filtered.slice(0, visibleGames).map(game => {
      const date = dateParts(game.date);
      const result = gameState(game) === 'post' || isLive(game);
      const room = miguRoomFor(game);
      const detail = gameDetailButton(game, 'button outline');
      const action = isLive(game) && room
        ? `<div class="game-links">${detail}<a class="button outline" href="${escape(room)}" target="_blank" rel="noopener noreferrer">去观赛</a></div>`
        : detail;
      return `<div class="full-game${isLive(game) ? ' is-live' : ''}"><div class="game-date od-field"><strong>${date.month}.${date.day} ${date.weekday}</strong><small>${game.timeValid === false ? '时间待定' : `${date.hour}:${date.minute}`}</small></div><div class="game-opponent od-field"><strong>${inlineMatchup(game)}</strong><small>${spurs(game)?.homeAway === 'home' ? '主场' : '客场'} · ${statusMarkup(game)}${result ? ` · ${gameScore(game)}` : ''}</small></div>${action}</div>`;
    }).join('') : '<div class="no-games">这里暂时没有比赛，试试其他月份或状态。</div>';
    $('#load-more').hidden = filtered.length <= visibleGames;
    $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed', button.dataset.filter === scheduleFilter));
  }

  function openSchedule() {
    updateMonthOptions();
    renderFullSchedule();
    if (routeName() !== 'spurs') {
      location.hash = '/spurs';
    } else {
      $('#schedule-panel').scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' });
    }
  }

  const teamMetrics = [
    ['fieldGoalsMade-fieldGoalsAttempted', '投篮（中/投）'], ['fieldGoalPct', '投篮命中率'],
    ['threePointFieldGoalsMade-threePointFieldGoalsAttempted', '三分（中/投）'], ['threePointFieldGoalPct', '三分命中率'],
    ['freeThrowsMade-freeThrowsAttempted', '罚球（中/投）'], ['totalRebounds', '篮板'], ['assists', '助攻'],
    ['steals', '抢断'], ['blocks', '盖帽'], ['totalTurnovers', '失误'], ['pointsInPaint', '内线得分']
  ];
  const playerMetrics = [['minutes','分钟'], ['points','得分'], ['rebounds','篮板'], ['assists','助攻'], ['steals','抢断'], ['blocks','盖帽']];
  function compactBox(data) {
    const competition = data.header?.competitions?.[0];
    if (!competition || competition.competitors?.length !== 2) return null;
    const teams = competition.competitors.map(side => {
      const id = String(side.id);
      const teamBox = data.boxscore?.teams?.find(row => String(row.team.id) === id);
      const roster = data.boxscore?.players?.find(row => String(row.team.id) === id)?.statistics?.[0];
      const stats = {};
      for (const [key] of teamMetrics) {
        const item = teamBox?.statistics?.find(row => row.name === key);
        if (item?.displayValue != null && item.displayValue !== '') stats[key] = item.displayValue;
      }
      const players = (roster?.athletes || []).filter(row => !row.didNotPlay && row.stats?.length).map(row => ({
        name: row.athlete.displayName, values: playerMetrics.map(([key]) => row.stats[roster.keys?.indexOf(key)] ?? null)
      }));
      return { id, score: side.score, quarters: (side.linescores || []).map(q => q.displayValue ?? q.value ?? null), stats, players };
    });
    return { id: String(data.header.id), status: competition.status, teams, fetched: Date.now() };
  }
  async function fetchEspn(url) {
    try { return await fetchJSON(url.replace('https://site.api.espn.com/', 'https://site.web.api.espn.com/')); }
    catch { return fetchJSON(url); }
  }
  const boxCache = new Map(Object.entries({"401909090":{"id":"401909090","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"24","score":"104","quarters":["28","16","36","24"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"36-93","fieldGoalPct":"39","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"10-37","threePointFieldGoalPct":"27","freeThrowsMade-freeThrowsAttempted":"22-25","totalRebounds":"45","assists":"21","steals":"6","blocks":"11","totalTurnovers":"14","pointsInPaint":"48"},"players":[{"name":"Victor Wembanyama","values":["34","12","13","3","1","6"]},{"name":"De'Aaron Fox","values":["32","14","7","7","1","0"]},{"name":"Devin Vassell","values":["31","7","3","1","0","0"]},{"name":"Stephon Castle","values":["28","24","7","1","0","0"]},{"name":"Dylan Harper","values":["32","18","7","5","0","0"]},{"name":"Harrison Barnes","values":["9","3","0","0","0","1"]},{"name":"Keldon Johnson","values":["20","10","4","1","2","0"]},{"name":"Julian Champagnie","values":["30","8","3","1","2","3"]},{"name":"David Jones Garcia","values":["1","2","0","0","0","0"]},{"name":"Carter Bryant","values":["6","0","0","1","0","0"]},{"name":"Maliq Brown","values":["1","0","0","1","0","0"]},{"name":"Luke Kornet","values":["13","4","1","0","0","1"]},{"name":"Tarris Reed Jr.","values":["1","0","0","0","0","0"]},{"name":"Ja'Kobi Gillespie","values":["1","2","0","0","0","0"]}]},{"id":"25","score":"116","quarters":["34","31","28","23"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"43-95","fieldGoalPct":"45","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"14-31","threePointFieldGoalPct":"45","freeThrowsMade-freeThrowsAttempted":"16-20","totalRebounds":"47","assists":"24","steals":"8","blocks":"10","totalTurnovers":"14","pointsInPaint":"42"},"players":[{"name":"Isaiah Hartenstein","values":["17","4","3","3","1","1"]},{"name":"Chet Holmgren","values":["31","14","7","2","0","4"]},{"name":"Shai Gilgeous-Alexander","values":["36","32","6","4","3","3"]},{"name":"Jalen Williams","values":["30","12","7","2","1","1"]},{"name":"Cason Wallace","values":["19","6","3","2","1","0"]},{"name":"Jaylin Williams","values":["17","5","4","1","0","0"]},{"name":"Brooks Barnhizer","values":["1","0","0","0","0","0"]},{"name":"Aday Mara","values":["12","7","2","1","0","1"]},{"name":"Alex Caruso","values":["25","9","6","1","1","0"]},{"name":"Kenrich Williams","values":["7","3","2","0","0","0"]},{"name":"Jared McCain","values":["22","20","2","2","1","0"]},{"name":"Ajay Mitchell","values":["23","4","5","6","0","0"]},{"name":"Bennett Stirtz","values":["1","0","0","0","0","0"]}]}],"fetched":1794308194116},"401909096":{"id":"401909096","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"24","score":"110","quarters":["27","32","22","29"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"40-87","fieldGoalPct":"46","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"12-37","threePointFieldGoalPct":"32","freeThrowsMade-freeThrowsAttempted":"18-25","totalRebounds":"40","assists":"21","steals":"10","blocks":"3","totalTurnovers":"15","pointsInPaint":"48"},"players":[{"name":"Victor Wembanyama","values":["32","25","13","2","0","2"]},{"name":"De'Aaron Fox","values":["32","19","4","9","2","0"]},{"name":"Devin Vassell","values":["34","10","4","2","3","0"]},{"name":"Stephon Castle","values":["33","15","7","5","1","0"]},{"name":"Dylan Harper","values":["34","20","3","2","0","0"]},{"name":"Harrison Barnes","values":["5","0","0","0","0","0"]},{"name":"Keldon Johnson","values":["19","8","6","1","1","0"]},{"name":"Julian Champagnie","values":["28","6","0","0","3","0"]},{"name":"Carter Bryant","values":["6","0","0","0","0","0"]},{"name":"Luke Kornet","values":["16","7","3","0","0","1"]}]},{"id":"10","score":"114","quarters":["32","29","24","29"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"38-78","fieldGoalPct":"49","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"10-25","threePointFieldGoalPct":"40","freeThrowsMade-freeThrowsAttempted":"28-31","totalRebounds":"44","assists":"24","steals":"11","blocks":"5","totalTurnovers":"15","pointsInPaint":"46"},"players":[{"name":"Kevin Durant","values":["37","20","7","5","0","0"]},{"name":"Jabari Smith Jr.","values":["34","7","5","1","2","2"]},{"name":"Alperen Sengun","values":["36","29","7","7","0","1"]},{"name":"Fred VanVleet","values":["32","14","3","5","3","0"]},{"name":"Amen Thompson","values":["36","20","10","4","2","2"]},{"name":"Tari Eason","values":["27","12","6","0","3","0"]},{"name":"Steven Adams","values":["8","4","2","1","0","0"]},{"name":"Marcus Smart","values":["21","5","3","1","1","0"]},{"name":"Bogdan Bogdanovic","values":["9","3","1","0","0","0"]}]}],"fetched":1794308194119},"401909295":{"id":"401909295","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"23","score":"109","quarters":["29","27","24","29"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"40-82","fieldGoalPct":"49","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"16-35","threePointFieldGoalPct":"46","freeThrowsMade-freeThrowsAttempted":"13-19","totalRebounds":"36","assists":"33","steals":"6","blocks":"4","totalTurnovers":"13","pointsInPaint":"44"},"players":[{"name":"Domantas Sabonis","values":["31","17","12","5","0","0"]},{"name":"Leaky Black","values":["40","12","3","5","2","0"]},{"name":"Precious Achiuwa","values":["22","9","4","0","0","2"]},{"name":"Zach LaVine","values":["35","14","4","3","1","0"]},{"name":"Darius Acuff Jr.","values":["33","22","3","8","2","0"]},{"name":"Alex Karaban","values":["11","0","1","0","0","0"]},{"name":"Dylan Cardwell","values":["15","9","2","3","1","2"]},{"name":"Malik Monk","values":["18","12","0","7","0","0"]},{"name":"Nique Clifford","values":["5","5","2","2","0","0"]},{"name":"Emanuel Sharp","values":["31","9","5","0","0","0"]}]},{"id":"24","score":"124","quarters":["38","37","24","25"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"38-79","fieldGoalPct":"48","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"15-30","threePointFieldGoalPct":"50","freeThrowsMade-freeThrowsAttempted":"33-42","totalRebounds":"46","assists":"28","steals":"5","blocks":"4","totalTurnovers":"12","pointsInPaint":"42"},"players":[{"name":"Victor Wembanyama","values":["26","30","14","2","0","2"]},{"name":"De'Aaron Fox","values":["26","9","2","4","1","1"]},{"name":"Devin Vassell","values":["27","19","2","2","1","1"]},{"name":"Stephon Castle","values":["28","19","3","7","0","0"]},{"name":"Dylan Harper","values":["28","19","2","3","0","0"]},{"name":"Harrison Barnes","values":["19","13","1","0","1","0"]},{"name":"Keldon Johnson","values":["27","3","6","6","0","0"]},{"name":"Julian Champagnie","values":["22","8","7","2","0","0"]},{"name":"David Jones Garcia","values":["3","0","0","0","0","0"]},{"name":"Carter Bryant","values":["3","0","0","0","0","0"]},{"name":"Luke Kornet","values":["18","2","6","1","0","0"]},{"name":"Tarris Reed Jr.","values":["3","0","1","0","0","0"]},{"name":"Jordan McLaughlin","values":["8","2","2","1","2","0"]}]}],"fetched":1794308194122},"401909858":{"id":"401909858","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"6","score":"106","quarters":["31","29","29","17"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"45-87","fieldGoalPct":"52","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"11-28","threePointFieldGoalPct":"39","freeThrowsMade-freeThrowsAttempted":"5-8","totalRebounds":"42","assists":"29","steals":"8","blocks":"6","totalTurnovers":"21","pointsInPaint":"62"},"players":[{"name":"Daniel Gafford","values":["23","12","9","2","3","2"]},{"name":"P.J. Washington","values":["36","12","4","2","0","0"]},{"name":"Naji Marshall","values":["21","10","4","5","1","0"]},{"name":"Zaccharie Risacher","values":["32","11","4","2","1","2"]},{"name":"Max Christie","values":["26","5","5","1","1","2"]},{"name":"Morez Johnson Jr.","values":["12","6","1","2","1","0"]},{"name":"Tobi Lawal","values":["4","5","1","1","0","0"]},{"name":"Sergio de Larrea","values":["33","21","5","4","0","0"]},{"name":"Moussa Cisse","values":["7","4","4","0","0","0"]},{"name":"Marcus Sasser","values":["27","12","3","5","0","0"]},{"name":"Walter Clayton Jr.","values":["15","3","2","5","1","0"]},{"name":"Jett Howard","values":["4","5","0","0","0","0"]}]},{"id":"24","score":"122","quarters":["32","36","24","30"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"48-101","fieldGoalPct":"48","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"15-42","threePointFieldGoalPct":"36","freeThrowsMade-freeThrowsAttempted":"11-16","totalRebounds":"43","assists":"34","steals":"12","blocks":"8","totalTurnovers":"12","pointsInPaint":"64"},"players":[{"name":"Victor Wembanyama","values":["29","23","7","2","1","4"]},{"name":"De'Aaron Fox","values":["28","19","3","9","3","1"]},{"name":"Devin Vassell","values":["32","11","4","6","2","0"]},{"name":"Stephon Castle","values":["28","19","4","8","3","0"]},{"name":"Dylan Harper","values":["28","22","5","2","2","0"]},{"name":"Harrison Barnes","values":["4","0","0","0","0","0"]},{"name":"Keldon Johnson","values":["26","7","6","3","0","0"]},{"name":"Julian Champagnie","values":["28","12","5","3","1","3"]},{"name":"Carter Bryant","values":["10","4","1","0","0","0"]},{"name":"Luke Kornet","values":["14","0","4","1","0","0"]},{"name":"Tarris Reed Jr.","values":["7","2","3","0","0","0"]},{"name":"Jordan McLaughlin","values":["3","0","1","0","0","0"]},{"name":"Ja'Kobi Gillespie","values":["3","3","0","0","0","0"]}]}],"fetched":1794308194124},"401909879":{"id":"401909879","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"24","score":"130","quarters":["39","41","27","23"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"49-90","fieldGoalPct":"54","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"17-37","threePointFieldGoalPct":"46","freeThrowsMade-freeThrowsAttempted":"15-19","totalRebounds":"46","assists":"35","steals":"7","blocks":"6","totalTurnovers":"14","pointsInPaint":"60"},"players":[{"name":"Victor Wembanyama","values":["27","29","10","2","2","5"]},{"name":"De'Aaron Fox","values":["26","11","4","6","0","0"]},{"name":"Devin Vassell","values":["24","14","4","8","1","0"]},{"name":"Stephon Castle","values":["27","15","5","5","1","0"]},{"name":"Dylan Harper","values":["30","13","6","6","2","0"]},{"name":"Harrison Barnes","values":["14","3","0","0","0","0"]},{"name":"Keldon Johnson","values":["22","14","4","0","0","0"]},{"name":"Julian Champagnie","values":["25","26","3","3","0","0"]},{"name":"Carter Bryant","values":["17","1","1","2","0","1"]},{"name":"Luke Kornet","values":["17","0","4","1","0","0"]},{"name":"Tarris Reed Jr.","values":["5","4","5","0","0","0"]},{"name":"Jordan McLaughlin","values":["7","0","0","2","1","0"]}]},{"id":"23","score":"103","quarters":["29","25","26","23"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"40-93","fieldGoalPct":"43","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"13-37","threePointFieldGoalPct":"35","freeThrowsMade-freeThrowsAttempted":"10-13","totalRebounds":"38","assists":"28","steals":"4","blocks":"3","totalTurnovers":"15","pointsInPaint":"46"},"players":[{"name":"Domantas Sabonis","values":["37","20","14","8","0","0"]},{"name":"De'Andre Hunter","values":["33","24","6","2","1","1"]},{"name":"Precious Achiuwa","values":["14","4","1","0","0","0"]},{"name":"Zach LaVine","values":["31","22","3","3","0","0"]},{"name":"Darius Acuff Jr.","values":["33","19","3","5","0","0"]},{"name":"Leaky Black","values":["8","2","1","1","1","1"]},{"name":"Alex Karaban","values":["11","0","1","1","0","0"]},{"name":"Jonathan Mogbo","values":["18","2","5","0","1","1"]},{"name":"Malik Monk","values":["13","3","2","6","0","0"]},{"name":"Daeqwon Plowden","values":["17","0","2","0","1","0"]},{"name":"Nique Clifford","values":["5","2","0","0","0","0"]},{"name":"Emanuel Sharp","values":["20","5","0","2","0","0"]}]}],"fetched":1794308194126},"401909890":{"id":"401909890","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final/OT","shortDetail":"Final/OT","altDetail":"OT"}},"teams":[{"id":"26","score":"111","quarters":["32","23","30","20","6"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"39-92","fieldGoalPct":"42","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"15-39","threePointFieldGoalPct":"38","freeThrowsMade-freeThrowsAttempted":"18-19","totalRebounds":"53","assists":"24","steals":"3","blocks":"5","totalTurnovers":"19","pointsInPaint":"34"},"players":[{"name":"Jaxson Hayes","values":["37","2","11","4","1","2"]},{"name":"Josh Green","values":["24","2","2","2","1","1"]},{"name":"Keyonte George","values":["37","31","4","3","0","0"]},{"name":"Ace Bailey","values":["40","19","6","0","0","1"]},{"name":"Darryn Peterson","values":["26","18","5","3","1","0"]},{"name":"Brice Sensabaugh","values":["18","16","3","1","0","0"]},{"name":"Mo Bamba","values":["16","8","4","1","0","1"]},{"name":"Svi Mykhailiuk","values":["15","3","2","1","0","0"]},{"name":"Josh Okogie","values":["28","5","9","3","0","0"]},{"name":"Isaiah Collier","values":["24","7","7","6","0","0"]}]},{"id":"24","score":"117","quarters":["22","29","34","20","12"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"44-101","fieldGoalPct":"44","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"12-38","threePointFieldGoalPct":"32","freeThrowsMade-freeThrowsAttempted":"17-21","totalRebounds":"51","assists":"30","steals":"14","blocks":"5","totalTurnovers":"11","pointsInPaint":"54"},"players":[{"name":"Victor Wembanyama","values":["39","36","14","5","3","2"]},{"name":"De'Aaron Fox","values":["39","14","3","4","3","1"]},{"name":"Devin Vassell","values":["38","21","5","2","3","0"]},{"name":"Stephon Castle","values":["38","14","6","8","2","1"]},{"name":"Dylan Harper","values":["37","13","5","8","1","0"]},{"name":"Keldon Johnson","values":["23","9","6","2","1","0"]},{"name":"Julian Champagnie","values":["31","6","6","0","0","0"]},{"name":"Carter Bryant","values":["5","3","0","0","0","0"]},{"name":"Luke Kornet","values":["14","1","6","1","1","1"]}]}],"fetched":1794308194129},"401909901":{"id":"401909901","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"24","score":"121","quarters":["34","26","33","28"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"43-87","fieldGoalPct":"49","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"10-27","threePointFieldGoalPct":"37","freeThrowsMade-freeThrowsAttempted":"25-31","totalRebounds":"49","assists":"24","steals":"6","blocks":"9","totalTurnovers":"16","pointsInPaint":"60"},"players":[{"name":"Victor Wembanyama","values":["34","43","7","4","1","6"]},{"name":"De'Aaron Fox","values":["35","22","8","7","0","1"]},{"name":"Devin Vassell","values":["34","9","5","2","2","1"]},{"name":"Stephon Castle","values":["22","0","5","4","1","0"]},{"name":"Dylan Harper","values":["39","25","7","6","1","0"]},{"name":"Keldon Johnson","values":["24","2","6","0","0","0"]},{"name":"Julian Champagnie","values":["27","12","3","1","1","0"]},{"name":"Carter Bryant","values":["11","6","0","0","0","0"]},{"name":"Luke Kornet","values":["14","2","8","0","0","1"]}]},{"id":"16","score":"111","quarters":["28","33","27","23"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"40-93","fieldGoalPct":"43","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"9-33","threePointFieldGoalPct":"27","freeThrowsMade-freeThrowsAttempted":"22-26","totalRebounds":"38","assists":"23","steals":"11","blocks":"2","totalTurnovers":"14","pointsInPaint":"52"},"players":[{"name":"Jaden McDaniels","values":["39","19","3","3","2","0"]},{"name":"Jonathan Kuminga","values":["40","19","6","3","0","1"]},{"name":"Joan Beringer","values":["34","12","6","2","1","0"]},{"name":"Ayo Dosunmu","values":["38","27","9","3","3","0"]},{"name":"LaMelo Ball","values":["20","10","8","4","3","0"]},{"name":"Trey Lyles","values":["17","6","0","0","0","0"]},{"name":"Jaylen Clark","values":["20","10","2","1","0","1"]},{"name":"Terrence Shannon Jr.","values":["18","2","3","4","0","0"]},{"name":"Bones Hyland","values":["14","6","1","3","2","0"]}]}],"fetched":1794308194131},"401909917":{"id":"401909917","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"24","score":"119","quarters":["27","32","35","25"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"42-91","fieldGoalPct":"46","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"11-32","threePointFieldGoalPct":"34","freeThrowsMade-freeThrowsAttempted":"24-30","totalRebounds":"53","assists":"27","steals":"6","blocks":"7","totalTurnovers":"12","pointsInPaint":"52"},"players":[{"name":"Victor Wembanyama","values":["24","12","11","5","1","3"]},{"name":"De'Aaron Fox","values":["22","12","2","3","1","0"]},{"name":"Devin Vassell","values":["25","11","2","1","1","0"]},{"name":"Stephon Castle","values":["26","16","5","4","0","1"]},{"name":"Dylan Harper","values":["27","17","7","8","2","0"]},{"name":"Harrison Barnes","values":["21","13","0","0","0","0"]},{"name":"Keldon Johnson","values":["27","15","7","1","0","0"]},{"name":"Julian Champagnie","values":["22","8","6","0","0","0"]},{"name":"Carter Bryant","values":["14","3","0","0","1","1"]},{"name":"Luke Kornet","values":["17","8","5","2","0","1"]},{"name":"Tarris Reed Jr.","values":["7","4","7","0","0","1"]},{"name":"Jordan McLaughlin","values":["8","0","1","3","0","0"]}]},{"id":"26","score":"97","quarters":["16","33","20","28"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"34-96","fieldGoalPct":"35","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"12-34","threePointFieldGoalPct":"35","freeThrowsMade-freeThrowsAttempted":"17-22","totalRebounds":"53","assists":"16","steals":"9","blocks":"7","totalTurnovers":"11","pointsInPaint":"36"},"players":[{"name":"Lauri Markkanen","values":["31","22","8","3","1","0"]},{"name":"Jaxson Hayes","values":["22","9","5","0","1","2"]},{"name":"Keyonte George","values":["22","7","7","0","0","0"]},{"name":"Ace Bailey","values":["24","5","6","2","1","0"]},{"name":"Darryn Peterson","values":["33","14","4","6","3","3"]},{"name":"Kyle Filipowski","values":["8","1","2","0","0","0"]},{"name":"Brice Sensabaugh","values":["14","7","2","1","1","0"]},{"name":"Tony Bradley","values":["7","2","3","0","1","0"]},{"name":"Mo Bamba","values":["18","8","8","0","0","2"]},{"name":"Svi Mykhailiuk","values":["14","3","2","0","0","0"]},{"name":"Josh Okogie","values":["19","9","3","2","1","0"]},{"name":"Josh Green","values":["15","3","1","0","0","0"]},{"name":"Isaiah Collier","values":["12","7","2","2","0","0"]}]}],"fetched":1794308194133},"401909933":{"id":"401909933","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"24","score":"112","quarters":["32","36","22","22"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"37-95","fieldGoalPct":"39","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"5-36","threePointFieldGoalPct":"14","freeThrowsMade-freeThrowsAttempted":"33-39","totalRebounds":"61","assists":"20","steals":"6","blocks":"10","totalTurnovers":"10","pointsInPaint":"62"},"players":[{"name":"Victor Wembanyama","values":["34","52","24","2","2","8"]},{"name":"De'Aaron Fox","values":["33","10","3","4","1","1"]},{"name":"Devin Vassell","values":["36","2","7","4","2","1"]},{"name":"Stephon Castle","values":["35","17","10","3","0","0"]},{"name":"Dylan Harper","values":["36","21","5","0","0","0"]},{"name":"Harrison Barnes","values":["13","4","2","0","0","0"]},{"name":"Keldon Johnson","values":["19","4","5","2","0","0"]},{"name":"Julian Champagnie","values":["21","0","4","3","1","0"]},{"name":"Luke Kornet","values":["14","2","1","2","0","0"]}]},{"id":"6","score":"111","quarters":["26","25","29","31"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"39-102","fieldGoalPct":"38","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"14-37","threePointFieldGoalPct":"38","freeThrowsMade-freeThrowsAttempted":"19-26","totalRebounds":"49","assists":"29","steals":"5","blocks":"4","totalTurnovers":"8","pointsInPaint":"40"},"players":[{"name":"Daniel Gafford","values":["18","2","4","1","1","2"]},{"name":"P.J. Washington","values":["39","21","9","3","0","1"]},{"name":"Cooper Flagg","values":["40","19","10","5","0","0"]},{"name":"Zaccharie Risacher","values":["18","2","1","2","1","0"]},{"name":"Kyrie Irving","values":["36","29","7","5","1","0"]},{"name":"Caleb Martin","values":["20","0","3","2","1","0"]},{"name":"Naji Marshall","values":["26","22","5","3","0","1"]},{"name":"Morez Johnson Jr.","values":["18","8","3","1","1","0"]},{"name":"Marcus Sasser","values":["5","0","1","2","0","0"]},{"name":"Walter Clayton Jr.","values":["21","8","6","5","0","0"]}]}],"fetched":1794308194135},"401909944":{"id":"401909944","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"22","score":"103","quarters":["20","29","27","27"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"35-84","fieldGoalPct":"42","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"9-35","threePointFieldGoalPct":"26","freeThrowsMade-freeThrowsAttempted":"24-30","totalRebounds":"38","assists":"17","steals":"9","blocks":"3","totalTurnovers":"18","pointsInPaint":"46"},"players":[{"name":"Toumani Camara","values":["21","4","4","0","0","0"]},{"name":"Deni Avdija","values":["24","15","4","1","1","0"]},{"name":"Donovan Clingan","values":["22","6","5","0","0","0"]},{"name":"Damian Lillard","values":["20","12","0","7","0","0"]},{"name":"Scoot Henderson","values":["24","13","2","1","1","1"]},{"name":"Micah Potter","values":["14","7","3","1","1","1"]},{"name":"Branden Carlson","values":["12","4","2","0","0","0"]},{"name":"Yang Hansen","values":["26","12","10","1","1","0"]},{"name":"Jrue Holiday","values":["20","11","0","0","1","0"]},{"name":"Jayson Kent","values":["12","4","1","1","2","0"]},{"name":"Chris Youngblood","values":["30","11","4","4","1","1"]},{"name":"Sidy Cissoko","values":["16","4","3","1","1","0"]}]},{"id":"24","score":"125","quarters":["22","42","45","16"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"40-90","fieldGoalPct":"44","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"17-44","threePointFieldGoalPct":"39","freeThrowsMade-freeThrowsAttempted":"28-30","totalRebounds":"51","assists":"29","steals":"7","blocks":"7","totalTurnovers":"16","pointsInPaint":"40"},"players":[{"name":"Victor Wembanyama","values":["24","29","7","3","1","1"]},{"name":"De'Aaron Fox","values":["22","8","3","6","1","1"]},{"name":"Devin Vassell","values":["21","15","2","3","2","0"]},{"name":"Stephon Castle","values":["24","14","7","5","0","1"]},{"name":"Dylan Harper","values":["28","13","7","4","0","1"]},{"name":"Harrison Barnes","values":["19","5","3","0","0","1"]},{"name":"Keldon Johnson","values":["27","10","7","4","2","0"]},{"name":"Julian Champagnie","values":["21","14","4","0","0","0"]},{"name":"Carter Bryant","values":["17","6","4","1","0","1"]},{"name":"Luke Kornet","values":["15","6","4","2","0","1"]},{"name":"Tarris Reed Jr.","values":["9","2","3","1","0","0"]},{"name":"Jordan McLaughlin","values":["12","3","0","0","1","0"]}]}],"fetched":1794308194137},"401909958":{"id":"401909958","status":{"type":{"id":"3","name":"STATUS_FINAL","state":"post","completed":true,"description":"Final","detail":"Final","shortDetail":"Final"}},"teams":[{"id":"21","score":"96","quarters":["25","21","22","28"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"35-89","fieldGoalPct":"39","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"9-26","threePointFieldGoalPct":"35","freeThrowsMade-freeThrowsAttempted":"17-19","totalRebounds":"35","assists":"21","steals":"3","blocks":"7","totalTurnovers":"7","pointsInPaint":"48"},"players":[{"name":"Dillon Brooks","values":["26","7","4","0","0","0"]},{"name":"Miles Bridges","values":["26","7","5","0","0","2"]},{"name":"Oso Ighodaro","values":["18","7","4","2","0","0"]},{"name":"Devin Booker","values":["29","32","2","4","1","1"]},{"name":"Jalen Green","values":["24","6","5","4","0","0"]},{"name":"Ryan Dunn","values":["23","3","2","0","1","2"]},{"name":"Koa Peat","values":["6","4","0","1","0","0"]},{"name":"Rasheer Fleming","values":["9","2","1","0","1","0"]},{"name":"Duop Reath","values":["6","2","2","0","0","0"]},{"name":"Khaman Maluach","values":["20","11","5","2","0","1"]},{"name":"Luke Kennard","values":["14","3","1","0","0","0"]},{"name":"Collin Gillespie","values":["24","6","2","3","0","0"]},{"name":"Jamaree Bouyea","values":["9","4","0","3","0","0"]},{"name":"Pat Spencer","values":["6","2","2","2","0","1"]}]},{"id":"24","score":"122","quarters":["31","30","32","29"],"stats":{"fieldGoalsMade-fieldGoalsAttempted":"46-90","fieldGoalPct":"51","threePointFieldGoalsMade-threePointFieldGoalsAttempted":"11-30","threePointFieldGoalPct":"37","freeThrowsMade-freeThrowsAttempted":"19-25","totalRebounds":"55","assists":"30","steals":"6","blocks":"11","totalTurnovers":"11","pointsInPaint":"62"},"players":[{"name":"Julian Champagnie","values":["27","11","3","2","2","0"]},{"name":"Victor Wembanyama","values":["25","40","11","3","0","9"]},{"name":"De'Aaron Fox","values":["29","15","9","6","0","0"]},{"name":"Stephon Castle","values":["30","4","8","7","1","0"]},{"name":"Dylan Harper","values":["26","17","5","4","0","0"]},{"name":"Harrison Barnes","values":["21","11","2","0","0","0"]},{"name":"Keldon Johnson","values":["26","4","5","3","0","0"]},{"name":"David Jones Garcia","values":["8","2","0","0","2","0"]},{"name":"Carter Bryant","values":["14","8","1","1","0","0"]},{"name":"Luke Kornet","values":["13","2","4","1","0","1"]},{"name":"Tarris Reed Jr.","values":["9","4","3","1","0","1"]},{"name":"Jordan McLaughlin","values":["11","4","4","2","1","0"]}]}],"fetched":1794308194139}}));
  const hupuPages = {"401909090":"https://nba.hupu.com/games/boxscore/168864","401909096":"https://nba.hupu.com/games/boxscore/168870","401909858":"https://nba.hupu.com/games/boxscore/168987","401909879":"https://nba.hupu.com/games/boxscore/169009","401909890":"https://nba.hupu.com/games/boxscore/169021","401909901":"https://nba.hupu.com/games/boxscore/169032","401909917":"https://nba.hupu.com/games/boxscore/169048","401909933":"https://nba.hupu.com/games/boxscore/169064","401909295":"https://nba.hupu.com/games/boxscore/168889","401909944":"https://nba.hupu.com/games/boxscore/169075","401909958":"https://nba.hupu.com/games/boxscore/169089","401909969":"https://nba.hupu.com/games/boxscore/169102","401909302":"https://nba.hupu.com/games/boxscore/168896","401909988":"https://nba.hupu.com/games/boxscore/169119","401910004":"https://nba.hupu.com/games/boxscore/169134","401910022":"https://nba.hupu.com/games/boxscore/169151","401910027":"https://nba.hupu.com/games/boxscore/169157","401910045":"https://nba.hupu.com/games/boxscore/169175","401909325":"https://nba.hupu.com/games/boxscore/168919","401909333":"https://nba.hupu.com/games/boxscore/168928","401910052":"https://nba.hupu.com/games/boxscore/169183","401910066":"https://nba.hupu.com/games/boxscore/169197","401910088":"https://nba.hupu.com/games/boxscore/169219","401910102":"https://nba.hupu.com/games/boxscore/169233","401910115":"https://nba.hupu.com/games/boxscore/169246","401910123":"https://nba.hupu.com/games/boxscore/169254","401910144":"https://nba.hupu.com/games/boxscore/169275","401910155":"https://nba.hupu.com/games/boxscore/169286","401910166":"https://nba.hupu.com/games/boxscore/169297","401910176":"https://nba.hupu.com/games/boxscore/169307","401909097":"https://nba.hupu.com/games/boxscore/168931","401910202":"https://nba.hupu.com/games/boxscore/169332","401910215":"https://nba.hupu.com/games/boxscore/169346"};
  // A browser may have saved a pregame schedule before the bundled final arrived.
  games = games.map(game => {
    const box = boxCache.get(String(game.id));
    if (!box || gameState(game) === 'post' || !game.competitors.every(t => box.teams.some(s => s.id === String(t.id)))) return game;
    return { ...game, status: box.status, observedAt: new Date(box.fetched).toISOString(),
      competitors: game.competitors.map(team => ({ ...team, score: box.teams.find(s => s.id === String(team.id)).score })) };
  });

  function statCell(value) {
    return value == null || value === '' ? '—' : escape(value);
  }

  function renderBox(panel, game, box) {
    const savedOpen = new Set([...panel.querySelectorAll('details[open]')].map(el => el.dataset.team));
    const order = [spurs(game), opponent(game)];
    const sides = order.map(team => box.teams.find(side => side.id === String(team.id)));
    const names = order.map(team => escape(teamName(team)));
    const table = (caption, headers, rows) => `<div class="box-scroll"><table><caption>${caption}</caption><thead><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
    const row = (label, values) => `<tr><th scope="row">${label}</th>${values.map(v => `<td>${statCell(v)}</td>`).join('')}</tr>`;
    const periodCount = Math.max(...sides.map(s => s.quarters.length));
    const periods = Array.from({length:periodCount}, (_, i) => i < 4 ? `第${i + 1}节` : `加时${i - 3}`);
    let markup = periodCount ? table('分节比分', ['球队', ...periods, '总分'], sides.map((s,i) => row(names[i], [...periods.map((_,p) => s.quarters[p]), s.score]))) : '';
    const comparisons = teamMetrics.filter(([key]) => sides.some(s => s.stats[key] != null)).map(([key,label]) => {
      const values = sides.map(s => {
        const v = s.stats[key];
        return key.endsWith('Pct') && v != null && !String(v).includes('%') ? v + '%' : v;
      });
      return row(label, values);
    });
    if (comparisons.length) markup += table('球队对比', ['统计', ...names], comparisons);
    sides.forEach((s,i) => {
      if (!s.players.length) return;
      const rows = s.players.map(p => row(escape(p.name), p.values));
      markup += `<details data-team="${escape(s.id)}" ${savedOpen.has(s.id) ? 'open' : ''}><summary>${names[i]}球员数据</summary>${table('出场球员', ['球员', ...playerMetrics.map(m => m[1])], rows)}</details>`;
    });
    panel.querySelector('.box-tables').innerHTML = markup;
    const live = box.status?.type?.state === 'in';
    const time = dateParts(box.fetched);
    panel.querySelector('.box-message').textContent = markup
      ? (live ? `进行中 · 北京时间 ${time.hour}:${time.minute} 更新` : '全场统计')
      : (box.status?.type?.state === 'pre' ? '开赛后显示本场统计。' : '本场技术统计尚未公布。');
    const headline = $('#detail-body [data-game-score]');
    if (headline && sides.every(s => s.score != null) && ['in','post'].includes(box.status?.type?.state)) {
      const stamp = live ? (Date.now() - box.fetched < 120000 ? statusMarkup({...game, status:box.status, observedAt:new Date(box.fetched).toISOString()}) : '上次更新') : '已结束';
      headline.innerHTML = stamp + ' · ' + sides.map(s => statCell(s.score)).join(' : ');
    }
  }

  async function refreshBox(force = false) {
    const panel = $('#game-box');
    if (!panel || !$('#detail-dialog').open || panel.dataset.busy) return;
    const game = games.find(g => String(g.id) === panel.dataset.event);
    if (!game) return;
    const cached = boxCache.get(String(game.id));
    const message = panel.querySelector('.box-message');
    if (cached && !panel.dataset.drawn) {
      renderBox(panel, game, cached);
      panel.dataset.drawn = '1';
    }
    if (!force && (cached?.status?.type?.state === 'post' && panel.dataset.checked || Date.now() - Number(panel.dataset.checked || 0) < 45000)) return;
    if (['STATUS_CANCELED','STATUS_POSTPONED'].includes(game.status?.type?.name) || (gameState(game) === 'pre' && Date.parse(game.date) > Date.now() && !cached)) {
      message.textContent = gameLabel(game) + ' · 暂无本场统计。';
      return;
    }
    panel.dataset.checked = String(Date.now());
    panel.dataset.busy = '1';
    const retry = panel.querySelector('button');
    retry.hidden = true;
    if (!cached) message.textContent = '正在读取本场统计…';
    try {
      const data = await fetchEspn('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=' + encodeURIComponent(game.id));
      const box = compactBox(data);
      if (!box || box.id !== String(game.id) || !game.competitors.every(team => box.teams.some(side => side.id === String(team.id)))) throw new Error('比赛不匹配');
      if (!panel.isConnected || !$('#detail-dialog').open) return;
      if (cached?.status?.type?.state === 'post' && box.status?.type?.state !== 'post') throw new Error('数据待同步');
      if (cached && !box.teams.some(t => t.quarters.length || t.players.length || Object.keys(t.stats).length)) throw new Error('统计未就绪');
      boxCache.set(box.id, box);
      renderBox(panel, game, box);
      panel.dataset.drawn = '1';
    } catch {
      if (!panel.isConnected || !$('#detail-dialog').open) return;
      if (cached) renderBox(panel, game, cached);
      message.textContent = cached ? (cached.status?.type?.state === 'post' ? '已保存的全场统计' : '实时更新失败，显示上次获取的数据。') : '暂时无法读取统计，可重试或查看本场数据来源。';
      retry.hidden = false;
    } finally { delete panel.dataset.busy; }
  }

  function statsPanel(game) {
    const id = String(game.id);
    const link = (url,label) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    const sources = [link('https://www.espn.com/nba/boxscore/_/gameId/' + encodeURIComponent(id), 'ESPN 技术统计')];
    if (hupuPages[id]) sources.push(link(hupuPages[id], '虎扑本场数据'));
    return `<section class="game-box" id="game-box" data-event="${escape(id)}" aria-label="本场数据统计"><h3>本场数据统计</h3><p class="box-message" role="status"></p><div class="box-tables"></div><div class="box-sources">${sources.join(' · ')}<button type="button" class="text-button" data-action="retry-box" hidden>重试</button></div></section>`;
  }

  function showGame(id) {
    const game = games.find(item => item.id === id);
    if (!game) return;
    const date = dateParts(game.date);
    const result = gameState(game) === 'post' || isLive(game);
    const room = miguRoomFor(game);
    const watch = room ? watchButton(game, 'primary detail-link') : '';
    const note = room
      ? '直接打开本场咪咕比赛页面。开赛前可查看直播预告，观看时按你的咪咕会员权益使用。'
      : '本场直播链接待补充。可从咪咕复制对应比赛的分享链接，在下面保存后直接进入。';
    const roomEditor = `<details class="room-settings" ${room ? '' : 'open'}><summary>${room ? '修改本场直播链接' : '添加本场直播链接'}</summary><form id="room-form" data-game-id="${escape(game.id)}" novalidate><div class="field"><label for="room-url">咪咕单场直播链接</label><input id="room-url" name="room-url" type="url" required maxlength="3000" value="${escape(room || '')}" placeholder="粘贴这场比赛的咪咕直播间链接" aria-describedby="room-help room-error"><span class="field-help" id="room-help">请核对直播间中的对阵与日期，保存后，链接会写入网页文件。</span><span class="field-error" id="room-error" role="alert"></span></div><div class="od-cluster"><button type="submit" class="button outline">保存直播链接</button><a class="text-button" href="${MIGU_URL}" target="_blank" rel="noopener noreferrer">去咪咕查找${icon('arrow-up-right')}</a></div></form></details>`;
    showDetail(matchupTitle(game), `<p class="detail-copy">${date.year} 年 ${Number(date.month)} 月 ${Number(date.day)} 日 ${date.weekday}\n${game.timeValid === false ? '开赛时间待定' : `${date.hour}:${date.minute}（北京时间）`} · ${spurs(game)?.homeAway === 'home' ? '马刺主场' : '马刺客场'}\n${escape(game.venue || '')}\n\n<span data-game-score>${statusMarkup(game)}${result ? ` · 马刺 ${gameScore(game)} ${escape(teamName(opponent(game)))}` : ''}</span></p>${statsPanel(game)}${watch}<p class="schedule-source">${note}</p>${roomEditor}`);
    $('#detail-title').innerHTML = inlineMatchup(game);
    refreshBox();
  }

  function validateRoomField(input) {
    const url = validMiguRoom(input.value);
    input.setAttribute('aria-invalid', !url);
    $('#room-error').textContent = url ? '' : '请粘贴咪咕的单场比赛或直播间链接，例如 https://www.miguvideo.com/p/live/比赛编号。';
    return url;
  }

  $('#detail-body').addEventListener('focusout', event => {
    if (event.target.id === 'room-url') validateRoomField(event.target);
  });

  $('#detail-body').addEventListener('submit', async event => {
    if (event.target.id !== 'room-form') return;
    event.preventDefault();
    const input = $('#room-url');
    const url = validateRoomField(input);
    if (!url) {
      input.focus();
      return;
    }
    const id = event.target.dataset.gameId;
    const button = $('button[type=submit]', event.target);
    button.disabled = true;
    try {
      const message = await saveHtml(next => { next.watchLinks = { ...next.watchLinks, [id]: url }; });
      renderSchedule();
      showGame(id);
      toast(message);
    } catch (error) {
      $('#room-error').textContent = error.message;
      button.disabled = false;
    }
  });

  function normalizeEvent(event, observedAt) {
    const competition = event.competitions?.[0];
    if (!competition || !competition.competitors?.some(team => String(team.id) === '24')) return null;
    if (!Number.isFinite(Date.parse(event.date))) return null;
    return {
      id: event.id, date: event.date, timeValid: event.timeValid !== false,
      competitors: competition.competitors.map(item => ({
        id: item.id, homeAway: item.homeAway, name: item.team.displayName,
        abbreviation: item.team.abbreviation,
        score: typeof item.score === 'object' ? String(item.score?.displayValue ?? '') : String(item.score ?? '')
      })),
      status: competition.status || event.status || {},
      venue: competition.venue?.fullName || '', observedAt
    };
  }

  async function fetchJSON(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  let standingsPending = false;
  let standingsSyncedAt = '';

  async function refreshStandings() {
    if (activePage !== 'spurs' || document.hidden || standingsPending) return;
    standingsPending = true;
    const status = $('#standings-status');
    try {
      const data = await fetchEspn(STANDINGS_URL);
      const table = data.children.find(group => group.name === 'Western Conference')?.standings;
      const team = table?.entries.find(entry => String(entry.team.id) === '24');
      const stats = Object.fromEntries((team?.stats || []).map(stat => [stat.name, stat.value]));
      const { wins, losses, playoffSeed, winPercent } = stats;
      if (table?.seasonType !== 2 || !table.seasonDisplayName ||
          ![wins, losses].every(value => Number.isInteger(value) && value >= 0) ||
          !Number.isFinite(winPercent) || winPercent < 0 || winPercent > 1) {
        throw new Error('Incomplete standings');
      }
      $('#standings-season').textContent = table.seasonDisplayName + ' 常规赛';
      $('#standings-record').textContent = `${wins} 胜 ${losses} 负`;
      $('#standings-rank').textContent = Number.isInteger(playoffSeed) && playoffSeed > 0 ? `第 ${playoffSeed} 名` : '待定';
      $('#standings-pct').textContent = (winPercent * 100).toFixed(1) + '%';
      const date = dateParts(Date.now());
      standingsSyncedAt = `${date.year}.${date.month}.${date.day} ${date.hour}:${date.minute}（北京时间）`;
      status.textContent = '最近同步 ' + standingsSyncedAt;
    } catch {
      status.textContent = standingsSyncedAt
        ? '更新失败，显示上次同步的数据 · ' + standingsSyncedAt
        : '暂时无法获取排名，将自动重试';
    } finally {
      standingsPending = false;
    }
  }

  function cachedLabel() {
    if (!scheduleUpdatedAt) return '赛程暂不可用，请重试';
    const date = dateParts(scheduleUpdatedAt);
    return `缓存于 ${date.month}.${date.day} ${date.hour}:${date.minute} · ESPN`;
  }

  async function refreshSchedule(full = true) {
    if (refreshRunning) return;
    refreshRunning = true;
    const button = $('#refresh-schedule');
    button.disabled = true;
    $('#sync-status').textContent = '正在同步比赛信息…';
    try {
      const [scheduleResult, scoreResult] = await Promise.allSettled([
        full ? fetchEspn(SCHEDULE_URL) : Promise.resolve(null),
        fetchEspn(SCOREBOARD_URL)
      ]);
      const now = new Date().toISOString();
      let scheduleSuccess = false;
      let scoreSuccess = false;
      if (scheduleResult.status === 'fulfilled' && Array.isArray(scheduleResult.value?.events) && scheduleResult.value.events.length) {
        const normalized = scheduleResult.value.events.map(event => normalizeEvent(event, now)).filter(Boolean);
        if (normalized.length) {
          games = normalized;
          season = scheduleResult.value.season?.displayName || season;
          scheduleUpdatedAt = now;
          scheduleSuccess = true;
        }
      }
      if (scoreResult.status === 'fulfilled' && Array.isArray(scoreResult.value?.events)) {
        const updates = scoreResult.value.events.map(event => normalizeEvent(event, now)).filter(Boolean);
        const gameMap = new Map(games.map(game => [String(game.id), game]));
        updates.forEach(game => gameMap.set(String(game.id), game));
        games = [...gameMap.values()];
        lastStatusUpdate = now;
        scoreSuccess = true;
      }
      if (scheduleSuccess || scoreSuccess) {
        try { localStorage.setItem(SCHEDULE_KEY, JSON.stringify({ games, season, updatedAt: scheduleUpdatedAt })); } catch { /* The current refresh is still usable in memory. */ }
      }
      renderSchedule();
      if (full && scheduleSuccess) updateMonthOptions();
      if (scoreSuccess) {
        const date = dateParts(lastStatusUpdate);
        $('#sync-status').textContent = full && !scheduleSuccess ? `实时状态 ${date.hour}:${date.minute} · 赛程使用缓存` : `比赛状态更新于 ${date.hour}:${date.minute} · ESPN`;
      } else if (scheduleSuccess) {
        $('#sync-status').textContent = '赛程已更新 · 实时状态暂不可用';
      } else {
        $('#sync-status').textContent = `连接失败 · ${cachedLabel()}`;
      }
    } catch {
      $('#sync-status').textContent = `连接失败 · ${cachedLabel()}`;
      renderSchedule();
    } finally {
      refreshRunning = false;
      button.disabled = false;
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === 'discover') {
      event.preventDefault();
      $('#discover').scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' });
    }
    if (action === 'compose') openEditor('post');
    if (action === 'add-project') openEditor('project');
    if (action === 'edit-project') openEditor('project', id);
    if (action === 'edit-post') openEditor('post', id);
    if (action === 'edit-profile') {
      if ($('#detail-dialog').open) $('#detail-dialog').close();
      openEditor('profile');
    }
    if (action === 'close-dialog') closeDialog(button.closest('dialog'));
    if (action === 'about') showAbout();
    if (action === 'schedule') openSchedule();
    if (action === 'refresh') refreshSchedule(true);
    if (action === 'game-detail') showGame(id);
    if (action === 'retry-box') refreshBox(true);
    if (action === 'delete-project') confirmDelete('project', id);
    if (action === 'delete-post') confirmDelete('post', id);
    if (action === 'remove-image' && !editor.loading) {
      editor.images.splice(Number(button.dataset.index), 1);
      renderFilePreview();
    }
    if (action === 'like-post') {
      try {
        commit(next => {
          const post = next.posts.find(item => item.id === id);
          if (post) post.liked = !post.liked;
        });
      } catch (error) { toast(error.message); }
    }
    if (action === 'project-detail') {
      const project = state.projects.find(item => item.id === id);
      if (project) showDetail(project.title, `${imageMarkup(project.cover, project.title, 'detail-image')}<p class="detail-copy">${escape(project.description || '这个项目的故事，等你慢慢补充。')}</p><a class="button primary detail-link" href="${escape(safeProjectUrl(project.url) || '#projects')}" target="_blank" rel="noopener noreferrer">打开项目${icon('arrow-up-right')}</a>`);
    }
    if (action === 'post-detail') {
      const post = state.posts.find(item => item.id === id);
      if (post) showDetail('生活里的这一刻', `<p class="small-muted">${escape(postDate(post.createdAt))} · ${escape(post.tag || '日常')}</p><p class="detail-copy">${escape(post.text)}</p>${(post.images || []).filter(validImage).map(photo => imageMarkup(photo, '心得配图', 'detail-image')).join('')}`);
    }
    if (action === 'photo') {
      const post = state.posts.find(item => item.id === id);
      const photo = post?.images?.filter(validImage)[Number(button.dataset.index)];
      if (photo) showDetail('这一刻', imageMarkup(photo, '心得配图原图', 'detail-image'));
    }
  });

  // Hash routes keep every page directly openable, including from file://.
  const pages = ['home', 'projects', 'moments', 'spurs', 'about'];
  const scrollPositions = new Map();
  let activePage = null;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function routeName() {
    const name = location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
    return pages.includes(name) ? name : 'home';
  }
  function closeMenu() {
    $('.header-inner').classList.remove('menu-open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
    $('#menu-toggle').setAttribute('aria-label', '展开导航');
  }
  function renderRoute(initial = false) {
    const next = routeName();
    if (next === activePage) { closeMenu(); return; }
    if (activePage) scrollPositions.set(activePage, window.scrollY);
    let navigation = history.state?.sunnyNav;
    if (navigation?.page !== next) {
      navigation = { page: next, previous: activePage };
      history.replaceState({ ...history.state, sunnyNav: navigation }, '');
    }
    $('#site-home').hidden = next === 'home';
    document.body.dataset.page = next;
    activePage = next;
    refreshStandings();
    $$('[data-page]').forEach(view => { view.hidden = view.dataset.page !== next; });
    $$('.main-nav a').forEach(link => {
      const selected = link.getAttribute('href') === `#/${next}`;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    closeMenu();
    if (!initial) {
      const heading = $(`[data-page="${next}"] h1`);
      heading.focus({ preventScroll: true });
      window.scrollTo({ top: scrollPositions.get(next) || 0, behavior: 'instant' });
    }
    animateRoute($(`[data-page="${next}"]`), initial);
  }
  $('#menu-toggle').addEventListener('click', () => {
    const open = $('.header-inner').classList.toggle('menu-open');
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
    $('#menu-toggle').setAttribute('aria-label', open ? '收起导航' : '展开导航');
    if (open) playMotion($('#main-nav'), [{ opacity: .4, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 280 });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('.header-inner').classList.contains('menu-open')) {
      closeMenu();
      $('#menu-toggle').focus();
    }
  });
  document.addEventListener('click', event => {
    if (event.target.closest('.skip-link')) {
      event.preventDefault();
      $('#main-content').focus();
      return;
    }
    const link = event.target.closest('a[href^="#/"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const destination = link.getAttribute('href').slice(2);
    if (pages.includes(destination) && destination !== activePage) scrollPositions.set(destination, 0);
    if (destination === activePage) closeMenu();
    else $$('dialog[open]').forEach(dialog => dialog.close());
  });
  // Error-summary anchors focus their input without changing the current page.
  editorForm.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const control = document.getElementById(link.getAttribute('href').slice(1));
    if (control && editorForm.contains(control)) { event.preventDefault(); control.focus(); }
  });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('hashchange', () => renderRoute());

  $$('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      scheduleFilter = button.dataset.filter;
      visibleGames = 12;
      renderFullSchedule();
      playMotion($('#full-schedule'), [{ opacity: .45, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
    });
  });
  $('#month-filter').addEventListener('change', () => { visibleGames = 12; renderFullSchedule(); });
  $('#load-more').addEventListener('click', () => { visibleGames += 12; renderFullSchedule(); });
  editorDialog.addEventListener('close', () => { editorGeneration++; });
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) return;
    try {
      state = readState();
      renderContent();
      renderSchedule();
      if (editorDialog.open) $('#form-error').textContent = '另一窗口已更新主页。保存时会合并其他内容，并应用当前编辑。';
    } catch { toast('另一窗口中的数据更新暂时无法读取。'); }
  });

  $('#today-label').textContent = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
  // Motion is always available. System reduce-motion selects a gentler choreography.
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = $('.hero');
  const scene = $('.hero-art');
  const star = $('.star-track');
  const easing = 'cubic-bezier(.16,1,.3,1)';
  const runningMotion = new Set();
  function playMotion(element, frames, options = {}) {
    if (!element || typeof element.animate !== 'function' || document.hidden) return null;
    if (motionPreference.matches) {
      frames = frames.map(frame => {
        const gentle = { ...frame };
        if ('transform' in gentle) gentle.transform = gentle.transform === 'none' ? 'none' : 'translateY(3px)';
        delete gentle.clipPath;
        return gentle;
      });
      options = { ...options, duration: Math.min(options.duration || 350, 350), delay: Math.min(options.delay || 0, 60) };
    }
    const animation = element.animate(frames, { duration: 550, easing, ...options });
    runningMotion.add(animation);
    const cleanup = () => runningMotion.delete(animation);
    animation.addEventListener('finish', cleanup, { once: true });
    animation.addEventListener('cancel', cleanup, { once: true });
    return animation;
  }
  function animateRoute(view, initial) {
    runningMotion.forEach(animation => animation.cancel());
    if (!view) return;
    const isHome = view.dataset.page === 'home';
    const heading = isHome ? $('.hero h1', view) : $('.page-heading h1', view);
    if (isHome) {
      playMotion(heading, [{ opacity: .15, clipPath: 'inset(0 0 100% 0)', transform: 'translateY(30px)' }, { opacity: 1, clipPath: 'inset(0)', transform: 'none' }], { duration: 950 });
      playMotion($('.hero-description'), [{ opacity: .1, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 140 });
      playMotion($('.hero-actions'), [{ opacity: .15, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 750, delay: 240 });
      playMotion($('.hero-top'), [{ opacity: .2 }, { opacity: 1 }], { duration: 850 });
    } else {
      playMotion(view, [{ opacity: .15, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 600 });
      playMotion(heading, [{ opacity: .2, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 60 });
    }
    requestAnimationFrame(updateScene);
    observeMotion(view);
  }
  const observed = new WeakSet();
  const lastReveal = new WeakMap();
  // Observe each card individually: a card below the fold must not animate too early.
  const revealSelector = '.bento,.section-intro,.home-updates,.project-card,.post,.schedule-box,.spurs-card,.profile-card,.about-story,.moments-aside,.site-footer';
  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const element = entry.target;
      if (!entry.isIntersecting || element.closest('[hidden]')) return;
      const now = performance.now();
      if (now - (lastReveal.get(element) || -10000) < 1200) return;
      lastReveal.set(element, now);
      if (element.matches('.section-intro')) {
        playMotion(element, [{ opacity: .25, clipPath: 'inset(0 38% 0 0)' }, { opacity: 1, clipPath: 'inset(0)' }], { duration: 900 });
      } else {
        playMotion(element, [{ opacity: .12, transform: 'translateY(38px)' }, { opacity: 1, transform: 'none' }], { duration: 850 });
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -20px 0px' }) : null;
  function observeMotion(root = document) {
    if (!revealObserver) return;
    $$(revealSelector, root).forEach(element => {
      if (observed.has(element) || element.closest('[hidden]')) return;
      observed.add(element);
      revealObserver.observe(element);
    });
  }
  let refreshFrame = 0;
  const contentObserver = new MutationObserver(records => {
    if (!records.some(record => record.type === 'childList' && record.addedNodes.length)) return;
    if (!refreshFrame) refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; observeMotion(); });
  });
  contentObserver.observe($('#main-content'), { childList: true, subtree: true });
  let scrollFrame = 0;
  function updateScene() {
    scrollFrame = 0;
    $('.site-header').classList.toggle('is-scrolled', scrollY > 32);
    if (activePage !== 'home') return;
    const distance = Math.max(0, Math.min(scrollY, hero.offsetHeight));
    scene.style.setProperty('--scene-scroll', `${(distance * (motionPreference.matches ? .015 : .2)).toFixed(1)}px`);
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScene); }, { passive: true });
  addEventListener('resize', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScene); }, { passive: true });
  function clearParallax() { star.style.removeProperty('--star-x');star.style.removeProperty('--star-y'); }
  let pointerFrame = 0;
  let pointerX = 0, pointerY = 0;
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const rect = hero.getBoundingClientRect();
    const strength = motionPreference.matches ? 4 : 32;
    pointerX = ((event.clientX - rect.left) / rect.width - .5) * strength;
    pointerY = ((event.clientY - rect.top) / rect.height - .5) * strength;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      star.style.setProperty('--star-x', `${pointerX.toFixed(1)}px`);
      star.style.setProperty('--star-y', `${pointerY.toFixed(1)}px`);
    });
  });
  hero.addEventListener('pointerleave', () => { cancelAnimationFrame(pointerFrame);pointerFrame=0;clearParallax(); });
  let heroVisible = true;
  const sceneObserver = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => { heroVisible=entry.isIntersecting;syncVisibility(); }, { threshold: 0 }) : null;
  sceneObserver?.observe(hero);
  function syncVisibility() {
    document.documentElement.dataset.visibility=document.hidden?'hidden':'visible';
    $('.home-scene').dataset.inView=String(heroVisible && activePage === 'home' && !document.hidden);
    hero.dataset.inView=String(heroVisible && activePage === 'home' && !document.hidden);
    if(document.hidden) runningMotion.forEach(animation=>animation.cancel());
  }
  function syncMotion() {
    document.documentElement.dataset.motion='on';
    document.documentElement.dataset.motionLevel=motionPreference.matches?'gentle':'full';
    syncVisibility();
    updateScene();
  }
  motionPreference.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncVisibility);
  addEventListener('hashchange',syncVisibility);
  // Delegation covers newly rendered posts, filters, project links and edit controls.
  document.addEventListener('click', event => {
    const target=event.target.closest('button,a');
    if(!target || target.disabled) return;
    if(event.clientX && event.clientY && !motionPreference.matches){
      const ring=document.createElement('span');
      ring.className='motion-press';ring.setAttribute('aria-hidden','true');
      ring.style.left=event.clientX+'px';ring.style.top=event.clientY+'px';
      document.body.append(ring);ring.addEventListener('animationend',()=>ring.remove(),{once:true});
      setTimeout(()=>ring.remove(),600);
    }
    if(target.dataset.action==='like-post'){
      requestAnimationFrame(()=>{
        const liked=$$('.post-footer button').find(button=>button.dataset.id===target.dataset.id);
        playMotion(liked?.querySelector('svg'),[{transform:'scale(.7)'},{transform:'scale(1.35)',offset:.5},{transform:'none'}],{duration:450});
      });
    } else if(!target.matches('a.bento,.brand,.main-nav a')) {
      playMotion(target,[{opacity:.65,transform:'scale(.94)'},{opacity:1,transform:'none'}],{duration:300});
    }
  });
  function closeDialog(dialog) {
    if(!dialog?.open || dialog.dataset.closing) return;
    const animation=playMotion(dialog,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(14px) scale(.985)'}],{duration:180,easing:'ease-in'});
    if(!animation){dialog.close();return;}
    dialog.dataset.closing='true';
    animation.finished.catch(()=>{}).then(()=>{delete dialog.dataset.closing;if(dialog.open)dialog.close();});
  }
  $$('dialog').forEach(dialog=>dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);}));
  syncMotion();
  observeMotion();

  hydrateIcons();
  renderContent();
  renderSchedule();
  $$('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
  renderRoute(true);
  $('#sync-status').textContent = cachedLabel();
  refreshSchedule(true);
  setInterval(refreshStandings, 60000);
  document.addEventListener('visibilitychange', refreshStandings);
  window.addEventListener('online', refreshStandings);
  setInterval(() => { if (!document.hidden) refreshSchedule(false); }, 60000);
  setInterval(() => { if (!document.hidden) refreshSchedule(true); }, 15 * 60000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshSchedule(Date.now() - Date.parse(scheduleUpdatedAt) > 15 * 60000);
  });
})();
