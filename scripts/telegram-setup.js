/**
 * Получить TELEGRAM_CHAT_ID после /start боту.
 *
 * TELEGRAM_BOT_TOKEN=... node scripts/telegram-setup.js
 */
'use strict';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Укажите TELEGRAM_BOT_TOKEN в окружении.');
  process.exit(1);
}

async function main() {
  const meRes = await fetch('https://api.telegram.org/bot' + token + '/getMe');
  const me = await meRes.json();
  if (!me.ok) {
    console.error('Неверный токен бота:', me);
    process.exit(1);
  }

  console.log('Бот:', '@' + me.result.username);
  console.log('Напишите боту /start в Telegram, затем нажмите Enter…');
  await new Promise(function (resolve) {
    process.stdin.once('data', resolve);
  });

  const updatesRes = await fetch('https://api.telegram.org/bot' + token + '/getUpdates');
  const updates = await updatesRes.json();
  if (!updates.ok) {
    console.error(updates);
    process.exit(1);
  }

  const chats = [];
  updates.result.forEach(function (update) {
    var msg = update.message || update.edited_message;
    if (!msg || !msg.chat) return;
    var id = msg.chat.id;
    if (chats.indexOf(id) === -1) chats.push(id);
  });

  if (!chats.length) {
    console.error('Сообщений не найдено. Убедитесь, что написали /start боту @' + me.result.username);
    process.exit(1);
  }

  console.log('\nНайденные chat_id:');
  chats.forEach(function (id) {
    console.log('  ' + id);
  });
  console.log('\nДобавьте в ONREZA (production):');
  console.log('  nrz env set TELEGRAM_BOT_TOKEN="' + token + '" --env production');
  console.log('  nrz env set TELEGRAM_CHAT_ID="' + chats[0] + '" --env production');
  console.log('\nИли в GitHub Secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
