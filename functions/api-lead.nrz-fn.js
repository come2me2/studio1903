export const config = {
  name: 'api-lead'
};

function json(data, status) {
  return Response.json(data, { status: status || 200 });
}

function clientIp(request) {
  var forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

export default {
  async fetch(request, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method_not_allowed' }, 405);
    }

    var token = ctx.env.TELEGRAM_BOT_TOKEN;
    var chatId = ctx.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      await ctx.log.error('telegram env missing', {
        hasToken: Boolean(token),
        hasChatId: Boolean(chatId)
      });
      return json({ ok: false, error: 'server_config' }, 503);
    }

    var ip = clientIp(request);
    try {
      var hits = await ctx.kv.incr('lead-rate:' + ip, { ttl: 60 });
      if (hits > 8) {
        return json({ ok: false, error: 'rate_limit' }, 429);
      }
    } catch (err) {
      await ctx.log.warn('rate limit skipped', { message: String(err) });
    }

    var body;
    try {
      body = await request.json();
    } catch (err) {
      return json({ ok: false, error: 'invalid_json' }, 400);
    }

    var name = String(body.name || '').trim().slice(0, 200);
    var phone = String(body.phone || '').trim().slice(0, 50);
    var area = String(body.area || '').trim().slice(0, 50);
    var page = String(body.page || '').trim().slice(0, 500);

    if (!name || !phone || !area) {
      return json({ ok: false, error: 'validation' }, 400);
    }

    var digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return json({ ok: false, error: 'validation' }, 400);
    }

    var lines = [
      '🏠 Новая заявка Studio19.03',
      '',
      'Имя: ' + name,
      'Телефон: ' + phone,
      'Площадь: ' + area + ' м²'
    ];
    if (page) lines.push('Страница: ' + page);

    var tgRes = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        disable_web_page_preview: true
      })
    });

    if (!tgRes.ok) {
      var tgText = await tgRes.text();
      await ctx.log.error('telegram send failed', {
        status: tgRes.status,
        body: tgText.slice(0, 500)
      });
      return json({ ok: false, error: 'delivery' }, 502);
    }

    await ctx.log.info('lead sent', { ip: ip });
    return json({ ok: true });
  }
};
