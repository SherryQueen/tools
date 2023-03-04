import os from 'node:os';
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

import fetch from 'node-fetch';

const isWin = os.platform() === 'win32';
const isApple = os.platform() === 'darwin';

console.info('isWin: ', isWin);
console.info('isApple: ', isApple);

async function getGithubHosts() {
  const text = await fetch('https://gitee.com/fliu2476/github-hosts/raw/main/hosts').then((res) => res.text());
  console.info(text);
  return text;
}

getGithubHosts().then(updateHosts);

const getHostPath = () => {
  if (isWin) return 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  if (isApple) return '/etc/hosts';
  return '/etc/hosts';
};

const getRefreshDnsCommand = () => {
  if (isWin) return 'ipconfig /flushdns';
  if (isApple) return 'killall -HUP mDNSResponder';
  return '';
};

const updateHosts = (hosts) => {
  const start = '# Generated by hosts-generator start';
  const end = '# Generated by hosts-generator end';

  const hostPath = getHostPath();
  const hostText = readFileSync(hostPath, { encoding: 'utf8' });

  const hostList = hostText.split('\r\n');
  const fromIdx = hostList.indexOf(start);
  const toIdx = hostList.indexOf(end);

  if (fromIdx === -1 && toIdx === -1) hostList.push(start, hosts, end);
  else hostList.splice(fromIdx + 1, toIdx - fromIdx - 1, hosts);

  writeFileSync(hostPath, hostList.join('\r\n'), { encoding: 'utf8' });
  execSync(getRefreshDnsCommand());
  console.info('Refresh over');
};