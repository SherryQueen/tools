import { writeFileSync } from 'node:fs';
import { isAbsolute, join, parse } from 'node:path';

import fetch from 'node-fetch';

import config from './config.json';

const url = process.argv[2];
const baseUrl = config.cdn;

const content = await fetch(url).then((res) => res.text());
const lines = content.split('\n');
const urls = [];
const chunks = [];
for (const line of lines) {
  if (line.endsWith('.ts')) {
    urls.push(baseUrl + line);

    const pathObj = parse(line);
    const filename = pathObj.name + pathObj.ext;
    chunks.push(filename);
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
