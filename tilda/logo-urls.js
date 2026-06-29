/**
 * URL логотипов на Tilda CDN.
 *
 * Как получить ссылку (вкладки «Файлы» в Tilda нет):
 * 1. На любой странице добавьте блок с картинкой (например ME401 или Zero Block → Image)
 * 2. Контент → «Загрузить файл» → logo-white.png, затем logo-gray.png (два блока или замените)
 * 3. Опубликуйте страницу
 * 4. ПКМ по картинке → «Копировать адрес изображения»
 *    (или F12 → img src с static.tildacdn.com)
 * 5. Вставьте URL ниже → node scripts/build-tilda.js
 */
module.exports = {
  src: 'https://static.tildacdn.com/tild3230-3861-4136-b438-333561646238/noroot.png',
  srcDark: 'https://static.tildacdn.com/tild3461-3833-4233-b133-653831333637/noroot.png'
};
