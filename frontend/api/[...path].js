import { Readable } from 'node:stream';

const FORWARDED_REQUEST_HEADERS = ['content-type', 'x-toonswap-session', 'accept'];
const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'cache-control',
  'content-disposition',
  'etag',
  'last-modified',
  'x-content-type-options',
];

export default async function handler(request, response) {
  const backendOrigin = String(process.env.BACKEND_ORIGIN || '').replace(/\/$/, '');
  if (!backendOrigin)
    return response.status(503).json({ message: 'Backend proxy is not configured' });
  const segments = Array.isArray(request.query.path)
    ? request.query.path
    : [request.query.path].filter(Boolean);
  const target = new URL(`/api/${segments.map(encodeURIComponent).join('/')}`, backendOrigin);
  Object.entries(request.query).forEach(([key, value]) => {
    if (key === 'path') return;
    (Array.isArray(value) ? value : [value]).forEach((item) =>
      target.searchParams.append(key, String(item)),
    );
  });
  const headers = new Headers();
  FORWARDED_REQUEST_HEADERS.forEach((name) => {
    const value = request.headers[name];
    if (value) headers.set(name, String(value));
  });
  const hasBody = !['GET', 'HEAD'].includes(request.method || 'GET');
  let body;
  if (hasBody && request.body != null)
    body =
      Buffer.isBuffer(request.body) || typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body);
  else if (hasBody) body = request;
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body,
    duplex: hasBody ? 'half' : undefined,
    redirect: 'manual',
  });
  response.status(upstream.status);
  FORWARDED_RESPONSE_HEADERS.forEach((name) => {
    const value = upstream.headers.get(name);
    if (value) response.setHeader(name, value);
  });
  if (!upstream.body || request.method === 'HEAD') return response.end();
  Readable.fromWeb(upstream.body).pipe(response);
}
