import { API_SIGN_SECRET } from '../config';
import sha256 from 'js-sha256';

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const hex: string[] = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i].toString(16);
    hex[i] = b.length === 1 ? '0' + b : b;
  }
  return hex.join('');
}

function canonicalizeQuery(params: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>): string {
  const map: Record<string, string[]> = {};
  for (const key in params) {
    const val = params[key];
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      map[key] = val.map(v => String(v));
    } else {
      map[key] = [String(val)];
    }
  }
  const keys = Object.keys(map).sort();
  const parts: string[] = [];
  for (const k of keys) {
    const values = map[k].slice().sort();
    for (const v of values) {
      parts.push(`${k}=${v}`);
    }
  }
  return parts.join('&');
}

function randomNonce(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSHA256Hex(secret: string, data: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
      const enc = new TextEncoder();
      const key = await (crypto as any).subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sig = await (crypto as any).subtle.sign('HMAC', key, enc.encode(data));
      return toHex(sig).toLowerCase();
    }
  } catch {}
  const hex = (sha256 as any).hmac(secret, data) as string;
  return String(hex).toLowerCase();
}

export interface SignOptions {
  method: string;
  path: string;
  query?: Record<string, string | number | boolean | Array<string | number | boolean>>;
}

function pickSecret(): string {
  let s = API_SIGN_SECRET || '';
  if (!s && typeof window !== 'undefined') {
    try {
      s = window.localStorage.getItem('API_SIGN_SECRET') || '';
    } catch {
      // ignore storage errors
    }
  }
  if (!s) {
    s = 'jiang_ruoxi';
  }
  return s;
}

export async function buildSignatureHeaders(opts: SignOptions): Promise<Record<string, string>> {
  const secret = pickSecret();
  if (!secret) {
    return {};
  }
  const ts = Math.floor(Date.now() / 1000).toString();
  const nonce = randomNonce();
  const canonicalQuery = canonicalizeQuery(opts.query || {});
  const stringToSign = [
    opts.method.toUpperCase(),
    opts.path,
    canonicalQuery,
    ts,
    nonce
  ].join('\n');
  const sign = await hmacSHA256Hex(secret, stringToSign);
  return {
    'X-Timestamp': ts,
    'X-Nonce': nonce,
    'X-Signature': sign,
    'X-Sign-Method': 'HMAC-SHA256'
  };
}
