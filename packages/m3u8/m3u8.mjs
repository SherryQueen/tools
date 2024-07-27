import { readFileSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { isAbsolute, join, parse } from 'node:path';

import fetch from 'node-fetch';

const config = JSON.parse(readFileSync('./config.json', 'utf8'));

async function download(link) {
  console.info(`download url: ${link}`);
  const content = await fetch(link).then((res) => res.text());

  const lines = content.split('\n');
  const urls = [];
  const chunks = [];
  for (const line of lines) {
    if (line.endsWith('.ts')) {
      urls.push(line.startsWith('http') || line.startsWith('https') ? line : baseUrl + line);

      const pathObj = parse(line);
      const filename = pathObj.name + pathObj.ext;
      chunks.push(filename);
    } else if (line.endsWith('.m3u8')) {
      const u = new URL(link);
      const url = `${u.protocol}//${u.host}${line}`;
      console.info(`identify the url: ${url}`);
      download(url);
      return;
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
