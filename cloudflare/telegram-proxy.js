/**
 * Cloudflare Worker — прокси к Telegram Bot API.
 * Deploy: npx wrangler deploy (из папки cloudflare)
 * ONREZA: TELEGRAM_API_BASE=https://studio1903-telegram-proxy.sir-kalinin.workers.dev
 */
export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, 'https://api.telegram.org');

    const headers = new Headers();
    const contentType = request.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);

    const init = {
      method: request.method,
      headers: headers,
      redirect: 'follow'
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.arrayBuffer();
    }

    return fetch(target.toString(), init);
  }
};
