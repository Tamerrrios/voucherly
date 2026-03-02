#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const SCAN_DIRS = ['components', 'screens', 'navigation'];

const ALLOWED_PATTERNS = [
  /navigation\.navigate\(/,
  /navigation\.replace\(/,
  /Alert\.alert\(\s*t\(/,
  /console\.(log|warn|error)\(/,
  /require\(/,
  /Ionicons|LottieView|LinearGradient/,
  /https?:\/\//,
  /@react-native|react-native/,
  /style=|styles\./,
  /^\s*\/\//,
  /^\s*\*/,
  /^\s*import\s+/,
  /^\s*export\s+/,
];

const JSX_TEXT_REGEX = />\s*([^<>{}\n][^<>{}\n]*[A-Za-zА-Яа-яЁё][^<>{}\n]*)\s*</g;
const PROP_TEXT_REGEX = /(title|placeholder|description|label|closeButtonLabel|copyButtonLabel)\s*=\s*['"]([^'"]*[A-Za-zА-Яа-яЁё][^'"]*)['"]/g;
const ALERT_LITERAL_REGEX = /Alert\.alert\(\s*['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"])?/g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function maskComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/^\s*\/\/.*$/gm, '');
}

function shouldSkipText(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (!/[A-Za-zА-Яа-яЁё]/.test(trimmed)) return true;
  if (/^[\d\s:.,!?()\-+✓🎁⚡📱💬📷🚧🌍]+$/.test(trimmed)) return true;
  if (/[{}=;]|=>/.test(trimmed)) return true;
  if (/^[a-zA-Z_$][\w.$]*$/.test(trimmed)) return true;
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function collectMatches(regex, content, mapper) {
  const results = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const mapped = mapper(match);
    if (mapped) results.push(mapped);
  }
  return results;
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

function run() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('src directory not found');
    process.exit(1);
  }

  const scanRoots = SCAN_DIRS
    .map((dir) => path.join(SRC_DIR, dir))
    .filter((dir) => fs.existsSync(dir));

  const files = scanRoots.flatMap((dir) => walk(dir));
  const findings = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const source = maskComments(content);

    const jsxMatches = collectMatches(JSX_TEXT_REGEX, source, (m) => {
      const text = m[1].trim();
      if (shouldSkipText(text)) return null;
      return { index: m.index, text };
    });

    const propMatches = collectMatches(PROP_TEXT_REGEX, source, (m) => {
      const text = m[2].trim();
      if (shouldSkipText(text)) return null;
      return { index: m.index, text: `${m[1]}="${text}"` };
    });

    const alertMatches = collectMatches(ALERT_LITERAL_REGEX, source, (m) => {
      const t1 = (m[1] || '').trim();
      const t2 = (m[2] || '').trim();
      const joined = [t1, t2].filter(Boolean).join(' | ');
      if (!joined || shouldSkipText(joined)) return null;
      return { index: m.index, text: `Alert.alert(${joined})` };
    });

    const all = [...jsxMatches, ...propMatches, ...alertMatches]
      .sort((a, b) => a.index - b.index)
      .filter((item, index, arr) => index === 0 || !(item.index === arr[index - 1].index && item.text === arr[index - 1].text))
      .slice(0, 40);

    if (all.length > 0) {
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      for (const item of all) {
        findings.push({
          file: rel,
          line: lineOf(content, item.index),
          text: item.text,
        });
      }
    }
  }

  if (findings.length === 0) {
    console.log('✅ i18n check passed: no obvious hardcoded UI strings found.');
    return;
  }

  console.log(`⚠️ i18n check found ${findings.length} potential hardcoded strings:`);
  for (const f of findings.slice(0, 200)) {
    console.log(`- ${f.file}:${f.line} -> ${f.text}`);
  }
  console.log('\nTip: replace user-facing strings with useLocalization()/t(...) or language-based copy maps.');
  process.exitCode = 1;
}

run();
