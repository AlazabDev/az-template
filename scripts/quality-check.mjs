import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const sourceRoot = resolve(root, 'src');
const sourceExtensions = ['', '.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.txt'];
const importPattern = /(?:from\s*|import\s*\(|import\s*)["']([^"']+)["']/g;
const sourceFiles = execFileSync('git', ['ls-files', 'src'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));
const failures = [];

function resolveImport(file, specifier) {
  const cleanSpecifier = specifier.split('?')[0];
  if (!cleanSpecifier.startsWith('.') && !cleanSpecifier.startsWith('@/')) return true;
  const base = cleanSpecifier.startsWith('@/')
    ? resolve(sourceRoot, cleanSpecifier.slice(2))
    : resolve(root, dirname(file), cleanSpecifier);
  return sourceExtensions.some((extension) => existsSync(`${base}${extension}`)) ||
    existsSync(resolve(base, 'index.ts')) ||
    existsSync(resolve(base, 'index.tsx'));
}

for (const file of sourceFiles) {
  const content = readFileSync(resolve(root, file), 'utf8');
  for (const match of content.matchAll(importPattern)) {
    if (!resolveImport(file, match[1])) failures.push(`${file}: ${match[1]}`);
  }
}

const trackedFiles = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const ignoredSecretPaths = /^(src\/content|src\/data|pnpm-lock\.yaml|bun\.lock)/;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /(?:SUPABASE_SERVICE_ROLE_KEY|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*["'][^"']+["']/,
];
for (const file of trackedFiles) {
  if (ignoredSecretPaths.test(file) || !/\.(cjs|js|json|md|ts|tsx|yml|yaml|toml|env|example)$/.test(file)) continue;
  const content = readFileSync(resolve(root, file), 'utf8');
  if (secretPatterns.some((pattern) => pattern.test(content))) failures.push(`${file}: possible secret literal`);
}

if (failures.length) {
  console.error('Quality check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Quality check passed: ${sourceFiles.length} source files checked; no broken local imports or secret literals found.`);
