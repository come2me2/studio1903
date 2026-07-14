# Telegram proxy для ONREZA

ONREZA не может напрямую достучаться до `api.telegram.org`.  
Разверните этот прокси на Render и укажите URL в ONREZA:

`TELEGRAM_API_BASE=https://<ваш-сервис>.onrender.com`

## Render.com (бесплатно)

1. [render.com](https://render.com) → **New +** → **Web Service**
2. Подключите репозиторий `studio1903`
3. **Root Directory:** `render-proxy`
4. **Runtime:** Node
5. **Start Command:** `npm start`
6. После деплоя скопируйте URL сервиса
7. В ONREZA → Variables → production:
   - `TELEGRAM_API_BASE` = URL без слэша в конце

Проверка:

```bash
curl -X POST "https://<ваш-сервис>.onrender.com/bot<TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"2515644","text":"test"}'
```
