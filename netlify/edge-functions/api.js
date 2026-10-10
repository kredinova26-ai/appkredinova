// AppKredinova · Puente seguro entre la app y Google Apps Script.
// La dirección de Apps Script NO está en el código de la página: se guarda en la variable de entorno
// KREDINOVA_API de Netlify y solo la conoce este servidor. La app llama a /api y Netlify reenvía la petición.
const JSON_HDR = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const responder = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: JSON_HDR });

export default async (request) => {
  if (request.method !== 'POST') return responder({ ok: false, error: 'Método no permitido.' }, 405);

  const destino = (Netlify.env.get('KREDINOVA_API') || '').trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(destino)) {
    return responder({ ok: false, error: 'Falta configurar la variable KREDINOVA_API en Netlify (Site configuration → Environment variables).' }, 500);
  }

  const cuerpo = await request.text();
  if (cuerpo.length > 5_000_000) return responder({ ok: false, error: 'La solicitud es demasiado grande.' }, 413);

  try {
    // Apps Script responde con una redirección: se sigue igual que lo hace el navegador
    const r = await fetch(destino, { method: 'POST', body: cuerpo, headers: { 'content-type': 'text/plain;charset=utf-8' }, redirect: 'follow' });
    const texto = await r.text();
    return new Response(texto, { status: 200, headers: { 'content-type': r.headers.get('content-type') || 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  } catch (e) {
    return responder({ ok: false, error: 'No se pudo contactar el servidor de Apps Script.' }, 502);
  }
};

export const config = { path: '/api' };
