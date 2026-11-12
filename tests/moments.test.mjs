import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getStore } from '@netlify/blobs';
import { BlobsServer } from '@netlify/blobs/server';
import { handle } from '../netlify/functions/moments.mjs';

test('administrator writes, public feed, image storage and conflicting edits', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'vertex-blobs-'));
  const server = new BlobsServer({ directory, logger() {} });
  const { address } = await server.start();
  t.after(async () => { await server.stop(); await rm(directory, { recursive: true, force: true }); });
  const store = getStore({ name: 'moments', siteID: 'local', apiURL: address, token: 'test', consistency: 'strong' });
  const origin = 'https://vertex.test';
  const call = (options = {}, query = '') => handle(new Request(origin + '/api/moments' + query, options), store, 'local-test-password');
  const post = (body, cookie = '', source = origin) => call({ method: 'POST',
    headers: { origin: source, cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const entry = { action: 'create', id: 'test', text: '一条动态', tag: '日常', images: [] };
  assert.equal((await post(entry)).status, 401);
  assert.equal((await post({ action: 'login', password: 'wrong' })).status, 401);
  const login = await post({ action: 'login', password: 'local-test-password' });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.equal((await post(entry, cookie, 'https://other.test')).status, 403);
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5wAAAABJRU5ErkJggg==', 'base64');
  const upload = await call({ method: 'POST', headers: { cookie, origin, 'Content-Type': 'image/png' }, body: bytes }, '?upload');
  const { src } = await upload.json();
  entry.images.push({ src, width: 1, height: 1 });
  assert.equal((await post(entry, cookie)).status, 200);
  const feed = await (await call()).json();
  assert.equal(feed.admin, false);
  assert.equal(feed.profile, null);
  assert.equal(feed.posts[0].text, entry.text);
  const image = await call({}, new URL(src, origin).search);
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
  const edit = { ...entry, action: 'update', text: '已更新', version: 1 };
  assert.equal((await post(edit)).status, 401);
  assert.equal((await post(edit, cookie)).status, 200);
  assert.equal((await post(edit, cookie)).status, 409);
  const deletion = { action: 'delete', id: entry.id, version: 2 };
  assert.equal((await post(deletion)).status, 401);
  assert.equal((await post(deletion, cookie)).status, 200);
  assert.deepEqual((await (await call()).json()).posts, []);
  assert.equal((await call({}, new URL(src, origin).search)).status, 404);
  assert.match((await post({ action: 'logout' }, cookie)).headers.get('set-cookie'), /Max-Age=0/);
});

test('profile saves require login, survive new reads, and protect concurrent edits', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'vertex-profile-'));
  const server = new BlobsServer({ directory, logger() {} });
  const { address } = await server.start();
  t.after(async () => { await server.stop(); await rm(directory, { recursive: true, force: true }); });
  const storeOptions = { name: 'moments', siteID: 'local', apiURL: address, token: 'test', consistency: 'strong' };
  const store = getStore(storeOptions);
  const origin = 'https://vertex.test';
  const call = (options = {}, query = '') => handle(
    new Request(origin + '/api/moments' + query, options), store, 'profile-test-password');
  const post = (body, cookie = '') => call({ method: 'POST',
    headers: { origin, cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const change = { action: 'save-profile', version: 0,
    profile: { siteName: 'Vertex', nickname: '新的昵称', bio: '新的简介', avatar: null } };
  assert.equal((await post(change)).status, 401);
  const login = await post({ action: 'login', password: 'profile-test-password' });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5wAAAABJRU5ErkJggg==', 'base64');
  const upload = await call({ method: 'POST', headers: { cookie, origin, 'Content-Type': 'image/png' }, body: bytes }, '?upload');
  const { src } = await upload.json();
  change.profile.avatar = { src, width: 1, height: 1 };
  assert.equal((await post({ ...change, profile: { ...change.profile, nickname: '' } }, cookie)).status, 400);
  assert.equal((await post({ ...change, profile: { ...change.profile, bio: 'a'.repeat(161) } }, cookie)).status, 400);
  assert.equal((await post({ ...change, profile: { ...change.profile, avatar: { src: '/missing', width: 1, height: 1 } } }, cookie)).status, 400);
  assert.equal((await post(change, cookie)).status, 200);
  const freshStore = getStore(storeOptions);
  const feed = await (await handle(new Request(origin + '/api/moments'), freshStore, 'profile-test-password')).json();
  assert.deepEqual(feed.profile, { ...change.profile, version: 1 });
  assert.deepEqual(feed.posts, []);
  assert.equal((await call({}, new URL(src, origin).search)).status, 200);
  assert.equal((await post(change, cookie)).status, 409);
  const updated = { ...change, version: 1, profile: { ...change.profile, nickname: '再次修改', avatar: null } };
  assert.equal((await post(updated, cookie)).status, 200);
  const after = await (await call()).json();
  assert.equal(after.profile.nickname, '再次修改');
  assert.equal(after.profile.avatar, null);
  assert.equal((await call({}, new URL(src, origin).search)).status, 404);
});
