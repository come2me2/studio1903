# Studio19.03 — Design System
### Главная страница · v1.0

Документ для UI-разработки. Основан на утверждённой структуре (7 блоков), копирайте и арт-дирекшне.

**Принцип:** токены → компоненты → блоки. Никаких «блоков Tilda» — только editorial layout, линии, типографика, фото.

---

## 1. Breakpoints

| Token | Min width | Устройство | Контейнер padding |
|---|---|---|---|
| `--bp-mobile` | 0 | Phone | 24px |
| `--bp-tablet` | 768px | Tablet | 48px |
| `--bp-desktop` | 1024px | Small desktop | 64px |
| `--bp-wide` | 1280px | Desktop | 80px |
| `--bp-max` | 1440px | Max content width | 80px |

**Подход:** mobile-first в коде, desktop-first в макете (основной артборд 1440px).

**Контрольные ширины для QA:** 390px · 768px · 1024px · 1440px · 1920px

---

## 2. Сетка

### Базовая колоночная сетка

| Breakpoint | Колонки | Gutter | Margin (padding контейнера) |
|---|---|---|---|
| Mobile | 4 | 16px | 24px |
| Tablet | 8 | 20px | 48px |
| Desktop | 12 | 24px | 80px |

**Column width (desktop 1440):**  
`(1440 − 80×2 − 24×11) / 12 = 97.33px` → округлять в макете до **97px**, gutter строго **24px**.

### Правила использования колонок

| Элемент | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero заголовок | 6 col | 7 col | 4 col (full) |
| Hero подзаголовок | 5 col | 6 col | 4 col |
| Section title | 6 col, center | 8 col | 4 col |
| Section subtitle | 5 col, center | 6 col | 4 col |
| Body text | max 6 col (~640px) | 6 col | 4 col |
| Founder photo | 4 col | 3 col | 4 col (full width) |
| Founder text | 5 col | 5 col | 4 col |
| Trust / Expertise item | 4 col (3-up) | 4 col (2-up) | 4 col (1-up) |
| Process step | 12 col (list) | 12 col | 4 col |
| Case card | 4 col (3-up) | 4 col (2-up) | 4 col (1-up) |
| Form | 5 col | 6 col | 4 col |

### Baseline grid

Вертикальный шаг: **8px**. Все spacing-токены кратны 4px, предпочтительно 8px.

---

## 3. Контейнер

```css
--container-max: 1440px;
--container-padding-mobile: 24px;
--container-padding-tablet: 48px;
--container-padding-desktop: 80px;
```

| Свойство | Значение |
|---|---|
| max-width | 1440px |
| width | 100% |
| margin | 0 auto |
| padding-inline | fluid (см. breakpoints) |

**Full-bleed:** только hero-фото и опционально case-фото на mobile. Контент всегда внутри контейнера.

**Fluid padding (рекомендация для кода):**
```
clamp(24px, 5vw, 80px)
```

---

## 4. Отступы (Spacing Scale)

### Токены

| Token | Value | Применение |
|---|---|---|
| `--space-1` | 4px | Микро: gap иконка-текст |
| `--space-2` | 8px | Label → text, tight gaps |
| `--space-3` | 12px | Мелкие внутренние отступы |
| `--space-4` | 16px | Между полями формы |
| `--space-5` | 24px | Gap в сетке, mobile gutters |
| `--space-6` | 32px | Между nav items, CTA margins |
| `--space-7` | 48px | Title → content (mobile sections) |
| `--space-8` | 64px | Tablet section padding |
| `--space-9` | 80px | Title → content (desktop) |
| `--space-10` | 120px | Section padding (mobile) |
| `--space-11` | 160px | Section padding (tablet) |
| `--space-12` | 200px | Section padding (desktop) |
| `--space-13` | 240px | Hero bottom padding, крупные секции |

### Section padding (вертикаль)

| Блок | Desktop | Tablet | Mobile |
|---|---|---|---|
| Header | 0 (height 72px) | 0 (64px) | 0 (64px) |
| Hero | 0 (100vh) | 0 (90vh) | 0 (85vh) |
| Founder | 160px | 120px | 80px |
| Trust | 200px | 140px | 100px |
| Expertise | 200px | 140px | 100px |
| Process | 200px | 140px | 100px |
| Cases | 200px | 140px | 100px |
| Form | 200px | 140px | 100px |
| Footer | 80px top / 40px bottom | 64px / 32px | 48px / 24px |

### Внутренние отступы блоков

| Элемент | Desktop | Mobile |
|---|---|---|
| Section title → subtitle | 16px | 12px |
| Subtitle → content | 80px | 48px |
| List item → list item | 48px | 32px |
| Trust row gap (vertical) | 80px | 48px |
| Process step number → text | 24px | 16px |
| CTA → microcopy | 12px | 8px |
| Form field → field | 16px | 16px |
| Form → submit | 32px | 24px |

---

## 5. Цвета

### Core palette

```css
/* Backgrounds */
--color-bg-primary:   #F7F5F2;  /* каменно-белый */
--color-bg-secondary: #EEEBE6;  /* тёплый серо-беж */
--color-bg-elevated:  #FDFCFA;  /* чуть светлее primary — header scrolled */
--color-bg-inverse:   #1A1A18;  /* редко: footer dark variant — не используем на v1 */

/* Text */
--color-text-primary:   #1A1A18;
--color-text-secondary: #6B6860;
--color-text-tertiary:  #9C9890;
--color-text-inverse:   #F7F5F2;
--color-text-inverse-muted: rgba(247, 245, 242, 0.75);

/* Accent & interactive */
--color-accent:         #2C2A26;
--color-accent-hover:   #1A1A18;
--color-link:           #1A1A18;
--color-link-hover:     #6B6860;

/* Borders */
--color-border:         #D8D4CC;
--color-border-subtle:  #E8E4DC;
--color-border-focus:   #1A1A18;

/* Overlay */
--color-overlay-hero:   linear-gradient(
  135deg,
  rgba(26, 26, 24, 0.55) 0%,
  rgba(26, 26, 24, 0.15) 45%,
  transparent 70%
);

/* States */
--color-error:          #8B4518;  /* тёплый, не кричащий красный */
--color-success:        #4A5D4A;  /* приглушённый зелёный */
--color-focus-ring:     rgba(26, 26, 24, 0.25);
```

### Назначение по блокам

| Блок | Background | Text |
|---|---|---|
| Header (top) | transparent | inverse на hero / primary после scroll |
| Header (scrolled) | `rgba(247,245,242,0.88)` + blur | primary |
| Hero | фото + overlay | inverse |
| Founder | `--color-bg-secondary` | primary |
| Trust | `--color-bg-primary` | primary |
| Expertise | `--color-bg-secondary` | primary |
| Process | `--color-bg-primary` | primary |
| Cases | `--color-bg-secondary` | primary |
| Form | `--color-bg-primary` | primary |
| Footer | `--color-bg-primary` | tertiary |

### Запрещено

`#FFFFFF`, `#000000`, `#EEEEEE`, `#F5F5F5`, синий `#0000FF`, золото, градиенты на кнопках.

---

## 6. Типографика

### Шрифт

**Primary:** `Suisse Intl` или `Neue Haas Grotesk Display Pro`  
**Fallback stack:** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`  
**Единое семейство** для всего — без serif, без декоративных.

```css
--font-family: 'Suisse Intl', 'Inter', sans-serif;
--font-feature-settings: 'kern' 1, 'liga' 1;
```

### Fluid type scale (clamp)

| Token | Desktop | Mobile | clamp() |
|---|---|---|---|
| `--text-hero` | 56px / lh 1.05 | 32px | `clamp(2rem, 4vw + 1rem, 3.5rem)` |
| `--text-h1` | 40px / lh 1.1 | 28px | `clamp(1.75rem, 2.5vw + 1rem, 2.5rem)` |
| `--text-h2` | 32px / lh 1.15 | 24px | `clamp(1.5rem, 2vw + 0.75rem, 2rem)` |
| `--text-h3` | 24px / lh 1.2 | 20px | `clamp(1.25rem, 1.5vw + 0.5rem, 1.5rem)` |
| `--text-body` | 17px / lh 1.65 | 16px | `clamp(1rem, 0.5vw + 0.9rem, 1.0625rem)` |
| `--text-body-sm` | 15px / lh 1.6 | 14px | `clamp(0.875rem, 0.25vw + 0.8rem, 0.9375rem)` |
| `--text-caption` | 13px / lh 1.45 | 12px | `clamp(0.75rem, 0.2vw + 0.7rem, 0.8125rem)` |
| `--text-label` | 13px / lh 1.4 | 12px | 13px fixed |
| `--text-nav` | 14px / lh 1 | 14px | 14px fixed |
| `--text-button` | 14px / lh 1 | 14px | 14px fixed |

### Weight & tracking

| Уровень | Weight | Letter-spacing |
|---|---|---|
| Hero, H1, H2 | 400 | −0.02em (hero), −0.01em (h1) |
| H3, item title | 500 | 0 |
| Body | 400 | 0 |
| Label (Основание, Опыт) | 400 | +0.08em, uppercase |
| Nav, button | 400 | +0.02em |
| Caption, microcopy | 400 | 0 |

### Назначение по блокам

| Элемент | Token | Weight |
|---|---|---|
| Hero headline | `--text-hero` | 400 |
| Hero subhead | `--text-body` | 400, inverse-muted |
| Hero location | `--text-caption` | 400, +0.06em |
| Section title | `--text-h1` | 400 |
| Section subtitle | `--text-body-sm` | 400, secondary |
| Founder name | `--text-h1` | 400 |
| Founder role | `--text-body-sm` | 400, secondary |
| Founder bio | `--text-body` | 400 |
| Trust label | `--text-label` | 400, uppercase, tertiary |
| Trust body | `--text-body` | 400 |
| Process step number | `--text-caption` | 400, tertiary, uppercase |
| Process step title | `--text-h3` | 500 |
| Process step text | `--text-body-sm` | 400, secondary |
| Case title | `--text-h3` | 500 |
| Case meta | `--text-caption` | 400, tertiary |
| Form title | `--text-h1` | 400 |
| Form label | `--text-caption` | 400, secondary |
| Form input | `--text-body` | 400 |
| Footer | `--text-caption` | 400, tertiary |

**Max line length:** 58ch для body, 42ch для hero headline.

---

## 7. Радиусы (Border Radius)

Архитектурный стиль = **прямые углы**.

```css
--radius-none: 0;
--radius-sm:   2px;   /* только focus ring inset, поля ввода */
--radius-md:   0;     /* не используем */
--radius-full: 9999px; /* не используем на v1 */
```

| Элемент | Radius |
|---|---|
| Фото | 0 |
| Кнопки | 0 |
| Поля ввода | 0 |
| Карточки | 0 (карточек нет) |
| Header | 0 |
| Focus ring | 2px offset, 0 radius |

**Запрещено:** border-radius > 2px на любых элементах.

---

## 8. Границы (Borders)

```css
--border-width: 1px;
--border-style: solid;
```

| Элемент | Border |
|---|---|
| Разделитель секций (trust rows) | 1px solid `--color-border` |
| Разделитель footer | 1px solid `--color-border` |
| Поля ввода default | 1px solid `--color-border` |
| Поля ввода focus | 1px solid `--color-border-focus` |
| Поля ввода error | 1px solid `--color-error` |
| Nav active | none — только `border-bottom: 1px solid` |
| Кнопки | none |
| Case image | none |

**Декоративные рамки вокруг фото:** запрещены.

---

## 9. Тени (Shadows)

Премиальный editorial стиль — **без теней** на контенте.

```css
--shadow-none: none;
--shadow-header: 0 1px 0 rgba(26, 26, 24, 0.06);  /* только hairline при scroll */
--shadow-dropdown: none;  /* нет dropdown */
```

| Элемент | Shadow |
|---|---|
| Header scrolled | `0 1px 0 rgba(26,26,24,0.06)` — hairline, не drop shadow |
| Фото | none |
| Кнопки | none |
| Form | none |
| Mobile menu overlay | none — flat background |

**Запрещено:** box-shadow на карточках, кнопках, изображениях.

---

## 10. Иконки

### Принцип

Минимум иконок. Текст важнее символов.

### Допустимые иконки

| Место | Иконка | Размер | Stroke |
|---|---|---|---|
| CTA стрелка → | line arrow right | 16px | 1px |
| Mobile burger | 3 lines | 20×14px area | 1px |
| Mobile close | X или 2 lines | 20px | 1px |
| Form error | none — только текст | — | — |

### Стиль

- Stroke-based, не filled
- Цвет: `currentColor`
- Без круглых обводок вокруг иконок
- Без icon-font (Font Awesome, etc.)
- SVG inline или sprite
- Stroke width: **1px** (1.5px max на retina)

### Запрещённые иконки

Телефон, email, соцсети-пиктограммы, галочки в списках, номера этапов в кружках, стрелки слайдера, play button.

---

## 11. Размеры фото

### Hero

| Breakpoint | Размер контейнера | Aspect | Min resolution | object-fit |
|---|---|---|---|---|
| Desktop | 100vw × min(100vh, 900px) | free (cover) | 2560×1440 | cover |
| Tablet | 100vw × 90vh | free | 1920×1080 | cover |
| Mobile | 100vw × 85vh | free | 1200×1600 | cover |

**Focal point:** `object-position: 60% center` (воздух слева под текст).

### Founder portrait

| Breakpoint | Width | Aspect | Resolution |
|---|---|---|---|
| Desktop | 4 col (~389px) | 3:4 | 800×1067 |
| Tablet | 3 col | 3:4 | 600×800 |
| Mobile | 100% container | 4:3 | 800×600 |

### Cases

| Breakpoint | Layout | Image width | Aspect | Resolution |
|---|---|---|---|---|
| Desktop | 3 columns | 4 col (~389px) | 4:5 | 800×1000 |
| Tablet | 2 columns | 4 col | 4:5 | 600×750 |
| Mobile | 1 column | 100% | 3:4 | 800×1067 |

**Gap между case:** 24px (desktop), 20px (tablet), 32px vertical (mobile).

**Hover на case:** scale запрещён. Допустим: opacity image 1 → 0.92 за 400ms.

### Формат файлов

WebP primary, AVIF optional, JPEG fallback. Quality 82–85. Lazy load всех фото кроме hero (eager + fetchpriority high).

---

## 12. Кнопки и CTA

### Типы

| Type | Использование | Стиль |
|---|---|---|
| **Primary** | Hero, Form submit | filled minimal |
| **Ghost** | Section CTAs | text + arrow |
| **Text link** | Nav, footer, secondary | underline on hover |

### Primary button («Обсудить проект», «Отправить»)

| Свойство | Desktop | Mobile |
|---|---|---|
| Height | 48px | 48px |
| Padding inline | 32px | 24px |
| Font | `--text-button`, +0.04em | same |
| Background | `--color-accent` | same |
| Color | `--color-text-inverse` | same |
| Border | none | none |
| Min width | 200px (form), auto (hero) | 100% (form only) |

### Ghost CTA (секционные ссылки)

| Свойство | Value |
|---|---|
| Height | auto (text link) |
| Font | 14px, +0.04em |
| Color | `--color-text-primary` |
| Arrow gap | 8px |
| Arrow size | 16px |
| Padding | 0 |
| Border-bottom | 1px solid transparent → primary on hover |

### Расположение CTA по блокам

| Блок | CTA type |
|---|---|
| Hero | Primary |
| Trust → Expertise | Ghost |
| Expertise → Process | Ghost |
| Process → Cases | Ghost |
| Cases → Form | Ghost |
| Form | Primary |
| Header | Text link (Ghost style) |

---

## 13. Состояния: Hover · Active · Focus

### Primary button

| State | Background | Color | Transform | Other |
|---|---|---|---|---|
| Default | `#2C2A26` | `#F7F5F2` | none | — |
| Hover | `#1A1A18` | `#F7F5F2` | none | transition 200ms |
| Active | `#1A1A18` | `#F7F5F2` | scale(0.98) | 100ms |
| Focus-visible | `#2C2A26` | `#F7F5F2` | none | outline 2px offset 2px `--color-focus-ring` |
| Disabled | `#D8D4CC` | `#9C9890` | none | pointer-events none |

### Ghost CTA / Text link

| State | Color | Arrow | Border |
|---|---|---|---|
| Default | primary | → at 0 | transparent |
| Hover | secondary | translateX(4px) | bottom 1px primary |
| Active | primary | translateX(2px) | bottom 1px |
| Focus-visible | primary | — | outline 2px offset 4px |

### Nav link

| State | Color | Indicator |
|---|---|---|
| Default | primary | none |
| Hover | secondary | border-bottom 1px primary |
| Active (current page) | primary | border-bottom 1px primary |
| Focus-visible | primary | outline 2px offset 4px |

### Form input

| State | Border | Background |
|---|---|---|
| Default | `--color-border` | transparent |
| Hover | `--color-border` | `--color-bg-elevated` |
| Focus | `--color-border-focus` | transparent |
| Error | `--color-error` | transparent |
| Disabled | `--color-border-subtle` | `--color-bg-secondary` |

### Case image link

| State | Opacity |
|---|---|
| Default | 1 |
| Hover | 0.92 |
| Active | 0.88 |
| Focus-visible | opacity 0.92 + outline on wrapper |

**Reduced motion:** при `prefers-reduced-motion: reduce` — все transition 0ms, scroll animations off.

---

## 14. Анимации

### Timing

```css
--ease-out:      cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-in-out:   cubic-bezier(0.45, 0, 0.55, 1);
--duration-fast:   150ms;
--duration-normal: 300ms;
--duration-slow:   500ms;
--duration-enter:  600ms;
```

### Page load

| Элемент | Animation | Delay |
|---|---|---|
| Hero image | opacity 0→1 | 0ms, 600ms |
| Hero text | opacity 0→1, translateY(16px→0) | 150ms, 500ms |
| Hero CTA | opacity 0→1 | 300ms, 400ms |

### Scroll reveal (Intersection Observer)

| Элемент | Animation | Threshold |
|---|---|---|
| Section title | opacity + translateY(12px) | 0.15 |
| List items | stagger 80ms each | 0.1 |
| Founder photo | opacity | 0.2 |
| Case images | opacity | 0.1 |

**Правило:** каждый элемент анимируется один раз (`once: true`).

### Header scroll

| Scroll | Change | Duration |
|---|---|---|
| 0–80px | transparent bg | — |
| >80px | bg `rgba(247,245,242,0.88)` + `backdrop-filter: blur(12px)` + hairline shadow | 300ms |

### Запрещённые анимации

Parallax, scale on scroll, bounce, slide-in from sides, carousel autoplay, number counters, skeleton shimmer, page transitions.

---

## 15. Форма

### Layout

| Breakpoint | Form width | Columns |
|---|---|---|
| Desktop | 5 col (~521px) | 1 col fields |
| Tablet | 6 col | 1 col |
| Mobile | 4 col (full) | 1 col |

### Поля

| Свойство | Value |
|---|---|
| Input height | 48px |
| Padding inline | 16px |
| Label → input gap | 8px |
| Font input | 17px |
| Placeholder color | `--color-text-tertiary` |
| Checkbox size | 16×16px, radius 0 |

### Submit

Primary button, full width on mobile, auto width on desktop (min 200px).

---

## 16. Компоненты по блокам

### Header

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Height | 72px | 64px | 64px |
| Logo size | 18px / 500 | 18px | 18px |
| Nav | visible | hidden (burger) | hidden |
| Phone | visible | hidden in header | in menu |
| CTA | text link 14px | in menu | in menu |

### Hero

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Height | min(100vh, 900px) | 90vh | 85vh |
| Content position | bottom-left, padding 80px | bottom-left, 48px | bottom, 24px |
| Headline max-width | 6 col | 7 col | 100% |
| Subhead max-width | 5 col | 6 col | 100% |
| CTA margin-top | 40px | 32px | 24px |
| Microcopy margin-top | 12px | 12px | 8px |

### Founder (2A)

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | 4 col photo + 5 col text | same, narrower | stack |
| Photo-text gap | 80px | 48px | 32px |
| Phone margin-top | 40px | 32px | 24px |

### Trust (2B)

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Title align | center | center | left |
| Grid | 3×1 | 2+1 or 2×2 | 1 col |
| Item gap H | 48px | 20px | 0 |
| Item gap V | 80px | 48px | 48px |
| Row divider | 1px between rows (desktop) | between items | between items |

### Expertise (3)

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Grid | 3 col | 2+1 | 1 col |
| Anchor fact | below grid, 6 col, margin-top 64px | full | full |
| CTA margin-top | 64px | 48px | 40px |

### Process (4)

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | vertical list, max 8 col centered | 10 col | full |
| Step gap | 48px | 40px | 32px |
| Number + content | horizontal: 48px gap | same | stack, 16px gap |

### Cases (5)

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Grid | 3×2 | 2×3 | 1×6 |
| Image aspect | 4:5 | 4:5 | 3:4 |
| Title margin-top | 16px | 16px | 12px |
| CTA margin-top | 80px | 64px | 48px |

### Form (6)

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | 5 col form + 4 col contacts aside | stack | stack |
| Contacts margin-top (mobile) | — | 48px | 48px |

### Footer (7)

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Top row | flex space-between | stack gap 24px | stack |
| Bottom row | 3 col: copyright / address / policy | stack | stack gap 8px |

---

## 17. Z-index scale

| Token | Value | Element |
|---|---|---|
| `--z-base` | 0 | content |
| `--z-raised` | 10 | case hover |
| `--z-header` | 100 | sticky header |
| `--z-overlay` | 200 | mobile menu |
| `--z-modal` | 300 | form success (if modal) |

---

## 18. CSS Custom Properties — сводка

```css
:root {
  /* Breakpoints — use in media queries, not as variables */

  /* Container */
  --container-max: 1440px;

  /* Spacing */
  --space-section-desktop: 200px;
  --space-section-tablet: 140px;
  --space-section-mobile: 100px;

  /* Colors */
  --color-bg-primary: #F7F5F2;
  --color-bg-secondary: #EEEBE6;
  --color-text-primary: #1A1A18;
  --color-text-secondary: #6B6860;
  --color-text-tertiary: #9C9890;
  --color-accent: #2C2A26;
  --color-border: #D8D4CC;

  /* Typography */
  --font-family: 'Suisse Intl', 'Inter', sans-serif;

  /* Motion */
  --ease-out: cubic-bezier(0.25, 0.1, 0.25, 1);
  --duration-normal: 300ms;

  /* Layout */
  --header-height: 72px;
  --header-height-mobile: 64px;
  --grid-gutter: 24px;
  --radius: 0;
  --border-width: 1px;
}
```

---

## 19. Чеклист «не Tilda»

- [ ] Нет border-radius на блоках
- [ ] Нет box-shadow
- [ ] Нет иконок в списках преимуществ
- [ ] Нет слайдера на hero
- [ ] Нет ALL CAPS заголовков
- [ ] Нет карточек с фоном
- [ ] Нет счётчиков с анимацией
- [ ] Нет pill-кнопок
- [ ] Нет холодного серого фона
- [ ] Один primary CTA на viewport
- [ ] Фото без рамок и скруглений
- [ ] Линии 1px вместо теней для разделения

---

## 20. Файловая структура для разработки

```
design/
  design-system.md      ← этот документ
  tokens.css            ← CSS variables (следующий шаг)
  components/
    button.md
    form.md
    header.md
```

*End of design system v1.0*
