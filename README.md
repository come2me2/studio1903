# Studio19.03 — Frontend

## Структура

```
1903/
├── index.html              — главная (локальный просмотр)
├── pages/                  — внутренние страницы
├── data/projects.json      — каталог проектов (18 шт.)
├── css/
│   ├── styles.css
│   ├── art-direction.css
│   ├── pages.css           — внутренние страницы
│   ├── pages/inner.css     — этапы, цены, о нас, контакты
│   └── tilda-fixes.css
├── js/
│   ├── content-shared.js   — header, footer, форма
│   ├── content-home.js     — тексты главной
│   ├── content-*.js        — тексты внутренних страниц
│   ├── content.js          — merge shared + page
│   ├── images.js           — изображения
│   ├── projects.js         — каталог (генерируется)
│   ├── core.js             — общая логика
│   ├── home.js             — главная
│   ├── portfolio.js        — /portfolio
│   ├── project.js          — страница проекта
│   └── pages.js            — steps, price, about, contacts
├── partials/               — header, footer, форма
├── tilda/
│   ├── site-head.html      — CSS (один раз в настройках сайта)
│   ├── site-core.html      — shared JS (один раз перед </body>)
│   ├── tilda-block.html    — главная /new
│   ├── tilda-block-*.html  — внутренние страницы
│   └── projects/*.html     — 18 блоков проектов
└── scripts/build.js        — сборка всего
```

## Локальный просмотр

```bash
cd /Users/sergeykalinin/Desktop/1903
node scripts/build.js
python3 -m http.server 8080
```

| URL | Файл |
|-----|------|
| http://localhost:8080/ | `index.html` |
| http://localhost:8080/pages/portfolio.html | Портфолио |
| http://localhost:8080/pages/project.html?slug=roche82 | Проект |
| http://localhost:8080/pages/steps.html | Этапы |
| http://localhost:8080/pages/price.html | Цены |
| http://localhost:8080/pages/about.html | О нас |
| http://localhost:8080/pages/contacts.html | Контакты |

## Сборка

```bash
node scripts/build.js
```

Генерирует `js/projects.js`, все `tilda/*.html` и `pages/*.html`.

## Публикация на Tilda (многостраничный сайт)

### Шаг 1 — один раз для всего сайта

1. **Настройки сайта → HTML в head** — вставьте `tilda/site-head.html`
2. **Настройки сайта → HTML перед `</body>`** — вставьте `tilda/site-core.html`

### Шаг 2 — каждая страница

На каждой странице **отключите** глобальные Header/Footer Tilda.

| Страница | T123-блок |
|----------|-----------|
| `/new` | `tilda/tilda-block.html` (автономный, без site-head/core) |
| `/portfolio` | `tilda/tilda-block-portfolio.html` |
| `/steps` | `tilda/tilda-block-steps.html` |
| `/price` | `tilda/tilda-block-price.html` |
| `/about` | `tilda/tilda-block-about.html` |
| `/contacts` | `tilda/tilda-block-contacts.html` |
| `/roche82`, `/slow19`, … | `tilda/projects/{slug}.html` |

**Главная `/new`** — полный автономный блок (CSS + JS внутри). Остальные страницы при использовании site-head/site-core содержат только разметку + page-specific JS.

### Страницы меню без настроек сайта (только T123 на странице)

Если в Tilda **нет** раздела «HTML перед `</body>`» в настройках сайта — используйте **два** блока T123:

| Страница | Блок 1 (стили) | Блок 2 (контент) |
|----------|----------------|------------------|
| Портфолио | `tilda/tilda-block-portfolio-tilda-styles.html` | `tilda/tilda-block-portfolio-tilda-page.html` |
| Этапы | `tilda/tilda-block-steps-tilda-styles.html` | `tilda/tilda-block-steps-tilda-page.html` |
| Цены | `tilda/tilda-block-price-tilda-styles.html` | `tilda/tilda-block-price-tilda-page.html` |
| О нас | `tilda/tilda-block-about-tilda-styles.html` | `tilda/tilda-block-about-tilda-page.html` |
| Контакты | `tilda/tilda-block-contacts-tilda-styles.html` | `tilda/tilda-block-contacts-tilda-page.html` |

### Страница проекта без настроек сайта (только T123 на странице)

Если в Tilda **нет** раздела «HTML перед `</body>`» в настройках сайта — используйте **два** блока T123 на странице проекта:

| Порядок | Файл | Размер |
|---------|------|--------|
| 1-й T123 (сверху) | `tilda/projects/{slug}-tilda-styles.html` | ~65 KB |
| 2-й T123 (ниже) | `tilda/projects/{slug}-tilda-page.html` | ~54 KB |

Пример для SLOW 19: `slow19-tilda-styles.html` + `slow19-tilda-page.html`.

**Не вставляйте** код в «HTML перед `</body>`» на странице — там жёсткий лимит. Только T123-блоки.

### Шаг 3 — проверка

- Навигация: главная → портфолио → проект → назад
- Каждый T123 &lt; 100 KB
- Логотипы через CDN (`tilda/logo-urls.js` → пересборка)

## Редактирование

| Что менять | Файл |
|---|---|
| Тексты главной | `js/content-home.js` |
| Тексты внутренних | `js/content-*.js` |
| Header, footer, форма | `js/content-shared.js` |
| Проекты | `data/projects.json` |
| Фото | `js/images.js` + `projects.json` |
| Стили | `css/*.css` |

После правок: `node scripts/build.js`

## GitHub + ONREZA

Сайт деплоится на [ONREZA](https://onreza.ru) как статический проект через CLI `nrz`.

### 1. Создать репозиторий на GitHub

```bash
cd /Users/sergeykalinin/Desktop/1903
git add .
git commit -m "Подготовить сайт к деплою на ONREZA"
git branch -M main
git remote add origin https://github.com/ВАШ_АККАУНТ/studio1903.git
git push -u origin main
```

### 2. Подключить проект к ONREZA

```bash
# Установить CLI (один раз)
curl -fsSL https://raw.githubusercontent.com/ONREZA/nrz-cli/main/install.sh | bash

# Войти и создать проект на платформе
nrz login
nrz init --create --name studio1903
```

Команда `nrz init` запишет `project.id` в `onreza.toml`. Закоммитьте обновлённый файл:

```bash
git add onreza.toml
git commit -m "Привязать проект к ONREZA"
git push
```

### 3. Автодеплой из GitHub Actions

1. В ONREZA: **Account → Tokens** — создайте токен
2. В GitHub: **Settings → Secrets → Actions** — добавьте `NRZ_TOKEN`
3. Пуш в `main` запускает `.github/workflows/deploy-onreza.yml`

### 4. Ручной деплой

```bash
npm run build
nrz deploy --prod
```

### 5. Локальный preview продакшен-сборки

```bash
npm run build
npm run preview
# http://localhost:8080 — с чистыми URL (/portfolio, /slow19, …)
```

Маршруты `/portfolio`, `/steps`, `/price`, `/about`, `/contacts` и страницы проектов (`/slow19`, …) настраиваются в `onreza.rules.toml` (генерируется при сборке).

## Форма

Локально — экран успеха. На Tilda подключите Zero Block form или webhook в `js/core.js` → `initForm`.
