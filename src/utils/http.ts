import { buildSignatureHeaders } from './signature';

export interface RequestOptions {
  method?: string;
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>;
  headers?: Record<string, string>;
  sign?: boolean;
}

export async function apiFetch(url: string, options: RequestOptions = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
  const params = options.params || {};
  for (const k in params) {
    const v = params[k];
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      for (const item of v) {
        u.searchParams.append(k, String(item));
      }
    } else {
      u.searchParams.set(k, String(v));
    }
  }
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };
  const needSign = options.sign !== false; // 默认开启签名，除非显式关闭
  if (needSign) {
    const path = u.pathname;
    const query: Record<string, string | number | boolean | Array<string | number | boolean>> = {};
    u.searchParams.forEach((value, key) => {
      if (query[key] === undefined) {
        query[key] = value;
      } else {
        const cur = query[key];
        if (Array.isArray(cur)) {
          cur.push(value);
        } else {
          query[key] = [cur as string | number | boolean, value];
        }
      }
    });
    const signHeaders = await buildSignatureHeaders({ method, path, query });
    Object.assign(headers, signHeaders);
  }
  return fetch(u.toString(), {
    method,
    headers,
  });
}
