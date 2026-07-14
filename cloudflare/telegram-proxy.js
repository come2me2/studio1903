/**
 * Cloudflare Worker — прокси к Telegram Bot API.
 * Deploy: npx wrangler deploy (из папки cloudflare)
 * ONREZA: TELEGRAM_API_BASE=https://<worker>.workers.dev
 */
export default {
  async fetch(request) {
    var url = new URL(request.url);
    url.hostname = 'api.telegram.org';
    url.protocol = 'https:';

    return fetch(
      new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body,
        redirect: 'follow'
      })
    );
  }
};
