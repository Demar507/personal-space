import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
for (const folder of ['assets', 'css', 'js', 'logo']) {
  await cp(folder, 'dist/' + folder, { recursive: true });
}
try {
  await cp('projects', 'dist/projects', { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const html = await readFile('index.html', 'utf8');
await writeFile('dist/index.html', html.replace('<html ', '<html data-cloud-moments '));
