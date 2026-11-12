import { getStore } from '@netlify/blobs';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const config = { path: '/api/moments' };
const sessionLife = 8 * 60 * 60;
const imageKey = /^[a-f0-9]{64}$/;
const imagePrefix = '/api/moments?image=';
const json = (body, status = 200, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', ...headers }
});
const fail = (message, status) => json({ error: message }, status);
const hash = value => createHash('sha256').update(value).digest();
const equal = (a, b) => timingSafeEqual(hash(a), hash(b));
const sign = (value, secret) => createHmac('sha256', secret).update(value).digest('hex');

function sessionValid(req, secret) {
  const match = /(?:^|;\s*)vertex_admin=(\d+)\.([a-f0-9]{32})\.([a-f0-9]{64})(?:;|$)/.exec(req.headers.get('cookie') || '');
  return Boolean(secret && match && Number(match[1]) > Date.now() &&
    equal(match[3], sign(match[1] + '.' + match[2], secret)));
}

function imageType(bytes) {
  if (bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'image/png';
  if (bytes.subarray(0, 3).toString('hex') === 'ffd8ff') return 'image/jpeg';
  if (['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6))) return 'image/gif';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
}

async function upload(req, store) {
  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.length > 2 * 1024 * 1024) return fail('单张图片不能超过 2 MB。', 413);
  const type = imageType(bytes);
  if (!type || type !== req.headers.get('content-type')) return fail('图片格式无效。', 400);
  const key = hash(bytes).toString('hex');
  await store.set('images/' + key, new Blob([bytes]), { metadata: { type }, onlyIfNew: true });
  return json({ src: imagePrefix + key });
}

export async function handle(req, store, secret) {
  const url = new URL(req.url);
  const admin = sessionValid(req, secret);
  if (req.method === 'GET') {
    const key = url.searchParams.get('image');
    if (key !== null) {
      if (!imageKey.test(key)) return fail('图片不存在。', 404);
      const posts = await store.get('posts', { type: 'json' }) || [];
      if (!posts.some(post => post.images.some(photo => photo.src === imagePrefix + key))) return fail('图片不存在。', 404);
      const image = await store.getWithMetadata('images/' + key, { type: 'arrayBuffer' });
      if (!image) return fail('图片不存在。', 404);
      return new Response(image.data, { headers: { 'Content-Type': image.metadata.type,
        'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' } });
    }
    return json({ posts: await store.get('posts', { type: 'json' }) || [], admin });
  }

  if (req.method !== 'POST') return fail('请求方式无效。', 405);
  if (req.headers.get('origin') !== url.origin) return fail('请求来源无效。', 403);
  if (url.searchParams.has('upload')) {
    return admin ? upload(req, store) : fail('请先登录管理员账号。', 401);
  }
  if (req.headers.get('content-type')?.split(';')[0] !== 'application/json') return fail('请求格式无效。', 415);
  let body;
  try { body = await req.json(); } catch { return fail('请求格式无效。', 400); }
  if (!body || typeof body !== 'object') return fail('请求格式无效。', 400);
  const cookie = '; HttpOnly; SameSite=Strict; Path=/' + (url.protocol === 'https:' ? '; Secure' : '');
  if (body.action === 'login') {
    if (!secret) return fail('请先在 Netlify 配置管理员密码并重新部署。', 503);
    if (typeof body.password !== 'string' || !equal(body.password, secret)) return fail('管理员密码不正确。', 401);
    const token = (Date.now() + sessionLife * 1000) + '.' + randomBytes(16).toString('hex');
    return json({ admin: true }, 200, { 'Set-Cookie': 'vertex_admin=' + token + '.' + sign(token, secret) + cookie + '; Max-Age=' + sessionLife });
  }
  if (body.action === 'logout') return json({ admin: false }, 200, { 'Set-Cookie': 'vertex_admin=' + cookie + '; Max-Age=0' });
  if (!admin) return fail('请重新登录后发布。', 401);
  if (!['create', 'update', 'delete'].includes(body.action) || typeof body.id !== 'string' ||
      !/^[a-zA-Z0-9-]{1,80}$/.test(body.id)) return fail('动态编号无效。', 400);

  const snapshot = await store.getWithMetadata('posts', { type: 'json' });
  const posts = snapshot?.data || [];
  const existing = posts.find(post => post.id === body.id);
  const conflict = () => fail('动态已变化，请刷新后再试。', 409);
  if (body.action === 'create' ? existing : !existing || existing.version !== body.version) return conflict();

  let next = posts.filter(post => post.id !== body.id);
  if (body.action !== 'delete') {
    const { text, tag, images } = body;
    if (typeof text !== 'string' || !text.trim() || text.length > 3000 || !['日常','灵感','设计','看球'].includes(tag) ||
        !Array.isArray(images) || images.length > 3) return fail('请检查动态文字、分类和配图。', 400);
    const photos = [];
    for (const img of images) {
      if (!img || typeof img.src !== 'string' || !img.src.startsWith(imagePrefix) ||
          !imageKey.test(img.src.slice(imagePrefix.length)) || ![img.width,img.height].every(n => Number.isSafeInteger(n) && n > 0) ||
          !await store.getMetadata('images/' + img.src.slice(imagePrefix.length))) return fail('配图未上传或格式无效。', 400);
      photos.push({ src: img.src, width: img.width, height: img.height });
    }
    const post = { id: body.id, text: text.trim(), tag, images: photos, version: (existing?.version || 0) + 1,
      createdAt: existing?.createdAt || new Date().toISOString(), edited: Boolean(existing) };
    next = existing ? posts.map(item => item.id === body.id ? post : item) : [post, ...posts];
  }
  const result = await store.setJSON('posts', next, snapshot ? { onlyIfMatch: snapshot.etag } : { onlyIfNew: true });
  return result.modified ? json({ posts: next }) : conflict();
}

export default async function moments(req) {
  try {
    return await handle(req, getStore({ name: 'vertex-moments', consistency: 'strong' }), process.env.VERTEX_ADMIN_PASSWORD);
  } catch {
    return fail('暂时无法访问动态存储，请稍后重试。', 503);
  }
}
