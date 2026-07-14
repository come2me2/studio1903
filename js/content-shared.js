/**
 * STUDIO19.03 — общие тексты (header, footer, форма)
 */
window.STUDIO1903_SHARED = {
  header: {
    logo: 'Studio19.03',
    phone: '+7 (966) 250-84-50',
    phoneHref: 'tel:+79662508450',
    cta: 'Обсудить проект',
    menuAddress: 'Москва · ул. Нагатинская набережная, 10А, корп. Б',
    nav: [
      { label: 'Портфолио', href: '/portfolio' },
      { label: 'Этапы', href: '/steps' },
      { label: 'Цены', href: '/price' },
      { label: 'О нас', href: '/about' },
      { label: 'Контакты', href: '/contacts' }
    ]
  },
  form: {
    title: 'Начните с разговора',
    subtitle: 'Оставьте контакты — перезвоним и договоримся о встрече в студии или на объекте',
    text: 'Готовый бриф не нужен. Достаточно площади и телефона — остальное обсудим лично.',
    fields: {
      name: { label: 'Имя', placeholder: 'Как к вам обращаться' },
      phone: { label: 'Телефон', placeholder: '+7' },
      area: { label: 'Площадь, м²', placeholder: 'Например, 120' }
    },
    privacy:
      'Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности и даёте согласие на обработку персональных данных.',
    privacyHref: '/privacy',
    submit: 'Отправить',
    phone: '+7 (966) 250-84-50',
    email: 'info@studio1903.ru',
    address: 'Москва, ул. Нагатинская набережная, 10А, корп. Б',
    phoneMicro: 'Предпочитаете звонок — звоните напрямую',
    errors: {
      name: 'Укажите, как к вам обращаться',
      phone: 'Нужен номер для связи',
      phoneFormat: 'Проверьте номер',
      area: 'Укажите примерную площадь',
      privacy: 'Нужно согласие на обработку данных',
      submit: 'Не удалось отправить заявку. Позвоните нам или попробуйте позже.'
    },
    success: {
      title: 'Получили вашу заявку',
      subtitle: 'Перезвоним в течение рабочего дня',
      text: 'Если вопрос срочный — +7 (966) 250-84-50',
      cta: 'Вернуться к проектам'
    }
  },
  footer: {
    social: [
      { label: 'Telegram', href: 'https://t.me/filsstudio_roman' },
      { label: 'Pinterest', href: 'https://pin.it/5XD6AUn2I' },
      { label: 'Max', href: 'https://max.ru/u/f9LHodD0cOIZGeGOa1q92cAjGvZdBPkjXwsj-Hj9WBjXsCC-B7RULCh4CR8' }
    ],
    copyright: '© 2026 Studio19.03',
    address: 'Москва, ул. Нагатинская набережная, 10А, корп. Б',
    policy: 'Политика конфиденциальности',
    policyHref: '/privacy'
  }
};
