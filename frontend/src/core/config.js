//рантайм-конфиг без хардкода api
export async function loadConfig() {
  // 1) попробовать <script id="app-config">
  const tag = document.getElementById('app-config');
  if (tag?.textContent) {
    try { return JSON.parse(tag.textContent); } catch {}
  }
  // 2) или /.well-known/app-config.json (может отдавать nginx/traefik)
  try {
    const r = await fetch('/.well-known/app-config.json', { cache: 'no-store' });
    if (r.ok) return await r.json();
  } catch {}
  // 3) дефолты
  return { API_BASE: '/api' };
}