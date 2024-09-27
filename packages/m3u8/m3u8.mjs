import { readFileSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { isAbsolute, join, parse } from 'node:path';

import fetch from 'node-fetch';

const config = JSON.parse(readFileSync('./config.json', 'utf8'));

async function download(link) {
  const u = new URL(link);
  const baseHost = config.cdn || `${u.protocol}//${u.host}`;

  console.info(`download url: ${link}`);
  const content = await fetch(link, {
    redirect: 'follow',
    headers: { Referer: `https://${u.hostname}/` },
  }).then((res) => res.text());
  // console.info('----- content', content);

  const lines = content.split('\n');
  const urls = [];
  const chunks = [];
  for (const line of lines) {
    if (['.ts', '.jpeg'].some((suffix) => line.endsWith(suffix))) {
      if (line.startsWith('http') || line.startsWith('https')) {
        urls.push(line);
      } else if (!line.includes('/')) {
        let p = u.pathname;
        p = p.slice(0, p.lastIndexOf('/'));
        urls.push(baseHost + p + '/' + line);
      } else {
        urls.push(baseHost + line);
      }

      const pathObj = parse(line);
      const filename = pathObj.name + pathObj.ext;
      chunks.push(filename);
    } else if (line.endsWith('.m3u8')) {
      const url = baseHost + line;
      console.info(`identify the url: ${url}`);
      download(url);
      return;
    } else if (/URI=\"(.*.key)\"/.test(line)) {
      const m = /URI=\"(.*.key)\"/.exec(line);
      if (m) {
        const url = m[1];
        const key = url.slice(url.lastIndexOf('/') + 1);
        console.info(url);
        console.info(`identify the key: ${key}`);
        urls.push(url);
        chunks.push(line.replace(url, key));
      } else {
        console.info('------- error', url);
      }
    } else chunks.push(line);
  }

  writeFileSync(
    isAbsolute(config.output.urls) ? config.output.urls : join(process.cwd(), config.output.urls),
    urls.join('\n'),
    'utf8',
  );
  writeFileSync(
    isAbsolute(config.output.m3u8) ? config.output.m3u8 : join(process.cwd(), 'index.m3u8'),
    chunks.join('\n'),
    'utf8',
  );
}

download(process.argv[2]);
