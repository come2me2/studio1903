# Studio19.03 — Frontend

## Структура

```
1903/
├── index.html          — локальный просмотр
├── css/styles.css      — стили (CSS Variables в #studio1903)
├── js/
│   ├── content.js      — все тексты
│   ├── images.js       — все изображения
│   └── main.js         — логика
├── tilda/
│   └── tilda-block.html — один файл для вставки в Tilda
├── copy/homepage.md
└── design/design-system.md
```

## Локальный просмотр

```bash
cd /Users/sergeykalinin/Desktop/1903
python3 -m http.server 8080
```

Откройте http://localhost:8080

## Вставка в Tilda

1. Откройте [`tilda/tilda-block.html`](tilda/tilda-block.html) — **весь файл целиком**.
2. На странице `/new` **отключите** глобальные блоки Header и Footer (или создайте пустую страницу без них) — иначе будет двойное меню и футер.
3. Вставьте код в блок **T123 → HTML** (вкладка «Код»).
4. В настройках блока отключите **Lazy load** / «Отложенная загрузка», если есть.
5. Опубликуйте заново.

**Важно:** разметка в файле идёт **первой**, до `<style>` и `<script>`. Tilda удаляет HTML, если он стоит между `</style>` и `<script>`.

**Логотипы:** отдельной вкладки «Файлы» в Tilda нет. Загрузите PNG через любой блок с картинкой (ME401, Cover, Zero Block → Image) → опубликуйте → скопируйте URL `static.tildacdn.com` → вставьте в `tilda/logo-urls.js` → `node scripts/build-tilda.js`.

Если блок не сохраняется — разделите на два T123:
1. `tilda/tilda-block-html-only.html` (разметка)
2. `tilda/tilda-block-css-js.html` (стили + скрипты, блок ниже)

Если после публикации пусто — пересоберите файл:

```bash
node scripts/build-tilda.js
```

и вставьте заново.

## Редактирование

| Что менять | Файл |
|---|---|
| Тексты | `js/content.js` → пересоберите `tilda-block.html` |
| Фото | `js/images.js` |
| Цвета, отступы, шрифты | `css/styles.css` → переменные в `#studio1903` |
| Форма Tilda | `js/main.js` → секция `TILDA:` в `initForm` |

После правок `content.js` / `images.js` / `main.js` / `styles.css` пересоберите Tilda-файл:

```bash
node scripts/build-tilda.js
```

Или скопируйте изменения вручную в `tilda/tilda-block.html`.

## Форма

Сейчас форма показывает экран успеха локально. Для Tilda подключите отправку через Zero Block form или webhook в `main.js`.
