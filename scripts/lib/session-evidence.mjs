import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function readHermesSessionEvidence(root, descriptor) {
  if (!descriptor?.path || !descriptor?.sessionId) {
    return { valid: false, reason: 'session evidence descriptor is incomplete' };
  }
  const evidencePath = path.resolve(root, descriptor.path);
  const relative = path.relative(root, evidencePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return { valid: false, reason: 'session evidence path escapes the project root' };
  }

  let content;
  try {
    content = await readFile(evidencePath, 'utf8');
  } catch {
    return { valid: false, reason: 'session evidence file is missing' };
  }
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length !== 1) {
    return { valid: false, reason: 'session evidence must contain exactly one JSONL record' };
  }

  let session;
  try {
    session = JSON.parse(lines[0]);
  } catch {
    return { valid: false, reason: 'session evidence is not valid JSON' };
  }
  if (!session || typeof session !== 'object' || Array.isArray(session)) {
    return { valid: false, reason: 'session evidence JSON must be an object' };
  }
  return { valid: true, session };
}

export function verifyAstraSession(run, descriptor, session) {
  if (run.model !== 'gpt-6-astra' || run.provider !== 'openai-codex') {
    return false;
  }
  return (
    session.id === descriptor.sessionId &&
    session.model === run.model &&
    session.billing_provider === run.provider
  );
}
