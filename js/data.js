/* Pomalo, Promajna. Data: apartments, texts UA/EN, routes, assistant. Plain script, no modules. */
window.POMALO = (function () {
  'use strict';

  var crest = '<svg viewBox="0 0 64 80" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path class="c-shield" d="M32 3 L55 9 C55 30 54 48 32 71 C10 48 9 30 9 9 Z"/>' +
    '<path class="c-shield2" d="M32 7 L51.5 12 C51.5 30 50.5 46 32 66 C13.5 46 12.5 30 12.5 12 Z" stroke-width=".7" opacity=".7"/>' +
    '<circle class="c-sun" cx="32" cy="24" r="5.2"/>' +
    '<path class="c-rays" d="M32 14.5v2.6M32 31v2.6M22.5 24h2.6M39 24h2.6M25.3 17.3l1.8 1.8M37 29l1.8 1.8M38.7 17.3 37 19.1M27.1 29l-1.8 1.8" stroke-width=".9"/>' +
    '<path class="c-pine" d="M18 44 L20.5 39 L23 44 M19 41 L20.5 37.5 L22 41 M20.5 44v3.5" stroke-width=".9"/>' +
    '<path class="c-pine" d="M41 44 L43.5 39 L46 44 M42 41 L43.5 37.5 L45 41 M43.5 44v3.5" stroke-width=".9"/>' +
    '<path class="c-wave" d="M19 51c2.6-2.2 5.2-2.2 7.8 0s5.2 2.2 7.8 0 5.2-2.2 7.8 0M21 55.5c2.6-2.2 5.2-2.2 7.8 0s5.2 2.2 7.8 0 5.2-2.2 7.8 0" stroke-width=".9"/>' +
    '<path class="c-ribbon" d="M3 73 C12 70 20 70 32 72 C44 70 52 70 61 73" stroke-width=".8"/>' +
    '<text class="c-text" x="32" y="78.5" text-anchor="middle" font-family="Raleway, Arial, sans-serif" font-size="5.2" font-weight="600" letter-spacing="1.4" fill="currentColor" stroke="none">POMALO</text>' +
    '</svg>';

  /* ---------- Apartments (demo data) ---------- */
  var typeMeta = {
    studio:  { img: 'apt-1', gallery: ['apt-1', 'apt-4', 'about-a-summer'] },
    one:     { img: 'apt-2', gallery: ['apt-2', 'apt-4', 'about-a-winter'] },
    two:     { img: 'apt-4', gallery: ['apt-4', 'apt-2', 'apt-1'] },
    terrace: { img: 'apt-3', gallery: ['apt-3', 'apt-1', 'split-summer'] }
  };

  /* x0/x1: horizontal position on the facade in percent, used for neighbours and the plan */
  var apartments = [
    { id: '1.1', floor: 1, type: 'studio',  guests: 2, bedrooms: 0, area: 26, x0: 0,  x1: 33,  demo: true },
    { id: '1.2', floor: 1, type: 'studio',  guests: 2, bedrooms: 0, area: 28, x0: 33, x1: 66,  demo: true },
    { id: '1.3', floor: 1, type: 'one',     guests: 4, bedrooms: 1, area: 40, x0: 66, x1: 100, demo: true },
    { id: '2.1', floor: 2, type: 'studio',  guests: 2, bedrooms: 0, area: 30, x0: 0,  x1: 25,  demo: true },
    { id: '2.2', floor: 2, type: 'one',     guests: 4, bedrooms: 1, area: 44, x0: 25, x1: 50,  demo: true },
    { id: '2.3', floor: 2, type: 'one',     guests: 4, bedrooms: 1, area: 46, x0: 50, x1: 75,  demo: true },
    { id: '2.4', floor: 2, type: 'two',     guests: 5, bedrooms: 2, area: 58, x0: 75, x1: 100, demo: true },
    { id: '3.1', floor: 3, type: 'studio',  guests: 2, bedrooms: 0, area: 28, x0: 0,  x1: 33,  demo: true },
    { id: '3.2', floor: 3, type: 'terrace', guests: 4, bedrooms: 1, area: 48, x0: 33, x1: 66,  demo: true },
    { id: '3.3', floor: 3, type: 'terrace', guests: 4, bedrooms: 1, area: 52, x0: 66, x1: 100, demo: true }
  ];
  apartments.forEach(function (a) { a.img = typeMeta[a.type].img; a.gallery = typeMeta[a.type].gallery; });

  var amenities = ['sea', 'wifi', 'parking', 'grill', 'kitchen', 'ac'];

  /* ---------- UI strings (not seasonal) ---------- */
  var ui = {
    ua: {
      'meta.title': 'Pomalo · Апартаменти в Промайні, Макарська Рив’єра',
      'meta.desc': 'Десять апартаментів за 300 м від моря в Промайні, Хорватія. Влітку подобово, взимку від 450 € на місяць за двох. Напряму від власника, без комісії Booking.',
      'h1': 'Апартаменти в Промайні на Макарській Рив’єрі: літо біля моря і зимівля від 450 € на місяць',
      'nav.apartments': 'Апартаменти', 'nav.plan': 'План будинку', 'nav.place': 'Промайна', 'nav.prices': 'Ціни',
      'nav.routes': 'Маршрути', 'nav.booking': 'Бронювання', 'nav.write': 'Написати Павлу', 'nav.menu': 'Меню', 'nav.close': 'Закрити',
      'season.summer': 'Літо', 'season.winter': 'Зима', 'season.toggle': 'Перемкнути сезон',
      'hero.choose': 'Оберіть сезон', 'hero.summer': 'Літо', 'hero.summer.sub': 'травень - вересень, подобово',
      'hero.winter': 'Зимівля', 'hero.winter.sub': 'від 450 € / міс, від 2 місяців', 'hero.next': 'Далі',
      's3.label': 'Апартаменти', 's3.prev': 'Назад', 's3.next': 'Далі', 's3.plan': 'Обрати на плані', 's3.all': 'Всі апартаменти і план будинку',
      's3.guests': 'Гостей', 's3.bedrooms': 'Спалень', 's3.has': 'Що є', 's3.upto': 'до', 's3.studio': 'студія', 's3.details': 'Деталі',
      'type.studio': 'Студія', 'type.one': 'Одна спальня', 'type.two': 'Дві спальні', 'type.terrace': 'З терасою',
      'type.studio.s': 'Студія', 'type.one.s': '1 спальня', 'type.two.s': '2 спальні', 'type.terrace.s': 'З терасою',
      'am.sea': 'Вид на море', 'am.wifi': 'Wi-Fi', 'am.parking': 'Паркінг', 'am.grill': 'Мангал у дворі', 'am.kitchen': 'Кухня', 'am.ac': 'Кондиціонер',
      'price.summer': 'Ціна на ваші дати', 'price.winter': 'від 450 € / міс за двох',
      's4.prev': 'Попередня', 's4.next': 'Наступна',
      's5.calc.q': 'Скільки місяців?', 's5.calc.for': 'За', 's5.calc.months': 'місяців', 's5.calc.checkin': 'При заселенні',
      's5.calc.note': 'Розрахунок для апартаменту від 450 € на двох. Точну ціну Павло назве для вашого апартаменту.',
      's6.d1': '1 день', 's6.d3': '3 дні', 's6.d7': '7 днів', 's6.brief': 'Коротко', 's6.plus': 'плюс до попереднього',
      's7.label': 'Бронювання', 's7.h1': 'Напишіть, коли', 's7.h2': 'і на скільки',
      'f.dates': 'Дати', 'f.dates.ph': 'Заїзд і виїзд', 'f.adults': 'Дорослі', 'f.children': 'Діти', 'f.apt': 'Апартамент', 'f.apt.any': 'Будь-який',
      'f.name': 'Ім’я', 'f.name.ph': 'Як до вас звертатися', 'f.contact': 'Телефон або Telegram', 'f.contact.ph': '+380 або @нік',
      'f.how': 'Як зв’язатися', 'f.wishes': 'Побажання', 'f.wishes.ph': 'Поверх, вид, діти, авто, тихіше чи ближче до моря',
      'f.month': 'З якого місяця', 'f.months': 'На скільки місяців', 'f.guests': 'Гостей', 'f.budget': 'Бюджет на місяць', 'f.budget.ph': 'наприклад, 500 €',
      'f.send': 'Надіслати запит', 'f.sent': 'Дякуємо! Павло відповість у месенджері, який ви обрали.',
      'f.sent.note': 'Концепт: у робочій версії запит прийде Павлу в WhatsApp.',
      'f.err.dates': 'Оберіть дати заїзду і виїзду', 'f.err.name': 'Напишіть ім’я', 'f.err.contact': 'Залиште телефон або Telegram',
      'f.err.month': 'Оберіть місяць', 'f.months.n': 'міс.', 'f.children.0': 'без дітей',
      'cal.checkin': 'Заїзд', 'cal.checkout': 'Виїзд', 'cal.clear': 'Очистити', 'cal.done': 'Готово', 'cal.nights': 'ночей',
      'cal.busy': 'зайнято', 'cal.free': 'вільно', 'cal.prev': 'Попередній місяць', 'cal.next': 'Наступний місяць',
      's8.btn': 'Написати Павлу',
      'ft.label': 'На зв’язку', 'ft.h1': 'Напишіть', 'ft.h2': 'Павлу.', 'ft.p': 'Відповідає сам, українською. Пишіть, на які дати і скільки вас.',
      'ft.site': 'Сайт', 'ft.planning': 'Планування', 'ft.questions': 'Питання',
      'ft.time': 'Час у Промайні', 'ft.now': 'Зараз', 'ft.sea': 'До моря', 'ft.sea.v': '300 м', 'ft.air': 'Повітря', 'ft.seat': 'Море',
      'ft.up': 'Вгору', 'ft.copy': '© 2026 Pomalo, Промайна. Концепт сайту для @pavel_adriatic: фото згенеровані, планування і площі умовні.',
      'ft.whatsapp': 'WhatsApp', 'ft.whatsapp.note': 'номер додамо',
      'as.open': 'Запитати', 'as.title': 'Питання про Промайну', 'as.sub': 'Відповідає помічник за словами Павла. Чого не знає, передасть Павлу.',
      'as.ph': 'Ваше питання', 'as.send': 'Надіслати', 'as.fallback': 'Передам Павлу. Залиште контакт, і він відповість.', 'as.close': 'Закрити',
      'cat.title': 'Апартаменти', 'cat.sub': 'Десять апартаментів, вид на море з кожного. Оберіть поверх на плані або відфільтруйте список.',
      'cat.floor': 'Поверх', 'cat.bedrooms': 'Спальні', 'cat.season': 'Сезон', 'cat.sort': 'Сортування', 'cat.all': 'усі',
      'cat.sort.floor': 'за поверхом', 'cat.sort.area': 'за площею',
      'cat.plan.h': 'Оберіть апартамент на плані', 'cat.plan.hint': 'Наведіть на вікно, щоб побачити апартамент. Клік відкриває планування.',
      'cat.floor.n': 'поверх', 'cat.guests': 'гостей', 'cat.view': 'Вид: море і Брач', 'cat.view.s': 'Море і Брач',
      'cat.more': 'Детальніше', 'cat.book': 'Забронювати', 'cat.neighbours': 'Хто зверху і знизу', 'cat.above': 'Зверху', 'cat.below': 'Знизу',
      'cat.roof': 'дах', 'cat.ground': 'двір і паркінг', 'cat.apt': 'Апартамент', 'cat.empty': 'За цими фільтрами нічого немає.',
      'cat.note': 'Планування, площі і зайняті дати в концепті умовні. Замінимо даними Павла.',
      'cat.sea': 'Адріатичне море · Брач навпроти', 'cat.count': 'апартаментів',
      'ap.back': 'Назад до плану', 'ap.facts': 'Факти', 'ap.gallery': 'Галерея', 'ap.plan': 'Планування', 'ap.has': 'Що є',
      'ap.calendar': 'Календар зайнятості', 'ap.calendar.note': 'Демо: зайняті дати умовні.', 'ap.onfacade': 'Де в будинку',
      'ap.book': 'Запит на цей апартамент', 'ap.area': 'м²', 'ap.view': 'Вид на море і Брач', 'ap.plan.note': 'Планування умовне, демо.',
      'room.living': 'Вітальня', 'room.bed': 'Спальня', 'room.bed2': 'Спальня 2', 'room.kitchen': 'Кухня', 'room.bath': 'Ванна',
      'room.balcony': 'Балкон', 'room.terrace': 'Тераса', 'room.hall': 'Передпокій', 'room.sea': 'море',
      'months': ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
      'months.g': ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
      'days': ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
    },
    en: {
      'meta.title': 'Pomalo · Apartments in Promajna, Makarska Riviera',
      'meta.desc': 'Ten apartments 300 m from the sea in Promajna, Croatia. Nightly in summer, from 450 € a month for two in winter. Direct from the owner, no Booking fee.',
      'h1': 'Apartments in Promajna on the Makarska Riviera: summer by the sea and winter stays from 450 € a month',
      'nav.apartments': 'Apartments', 'nav.plan': 'House plan', 'nav.place': 'Promajna', 'nav.prices': 'Prices',
      'nav.routes': 'Routes', 'nav.booking': 'Booking', 'nav.write': 'Write to Pavlo', 'nav.menu': 'Menu', 'nav.close': 'Close',
      'season.summer': 'Summer', 'season.winter': 'Winter', 'season.toggle': 'Switch season',
      'hero.choose': 'Choose a season', 'hero.summer': 'Summer', 'hero.summer.sub': 'May to September, nightly',
      'hero.winter': 'Winter stay', 'hero.winter.sub': 'from 450 € / month, 2 months or more', 'hero.next': 'Next',
      's3.label': 'Apartments', 's3.prev': 'Back', 's3.next': 'Next', 's3.plan': 'Pick on the plan', 's3.all': 'All apartments and the house plan',
      's3.guests': 'Guests', 's3.bedrooms': 'Bedrooms', 's3.has': 'Included', 's3.upto': 'up to', 's3.studio': 'studio', 's3.details': 'Details',
      'type.studio': 'Studio', 'type.one': 'One bedroom', 'type.two': 'Two bedrooms', 'type.terrace': 'With terrace',
      'type.studio.s': 'Studio', 'type.one.s': '1 bedroom', 'type.two.s': '2 bedrooms', 'type.terrace.s': 'Terrace',
      'am.sea': 'Sea view', 'am.wifi': 'Wi-Fi', 'am.parking': 'Parking', 'am.grill': 'Grill in the yard', 'am.kitchen': 'Kitchen', 'am.ac': 'Air conditioning',
      'price.summer': 'Price for your dates', 'price.winter': 'from 450 € / month for two',
      's4.prev': 'Previous', 's4.next': 'Next',
      's5.calc.q': 'How many months?', 's5.calc.for': 'For', 's5.calc.months': 'months', 's5.calc.checkin': 'At check-in',
      's5.calc.note': 'Based on an apartment from 450 € for two. Pavlo will name the exact price for your apartment.',
      's6.d1': '1 day', 's6.d3': '3 days', 's6.d7': '7 days', 's6.brief': 'In short', 's6.plus': 'in addition to the previous',
      's7.label': 'Booking', 's7.h1': 'Tell us when', 's7.h2': 'and for how long',
      'f.dates': 'Dates', 'f.dates.ph': 'Check-in and check-out', 'f.adults': 'Adults', 'f.children': 'Children', 'f.apt': 'Apartment', 'f.apt.any': 'Any',
      'f.name': 'Name', 'f.name.ph': 'How should we address you', 'f.contact': 'Phone or Telegram', 'f.contact.ph': '+44 or @handle',
      'f.how': 'How to reach you', 'f.wishes': 'Wishes', 'f.wishes.ph': 'Floor, view, kids, car, quieter or closer to the sea',
      'f.month': 'Starting month', 'f.months': 'Number of months', 'f.guests': 'Guests', 'f.budget': 'Monthly budget', 'f.budget.ph': 'e.g. 500 €',
      'f.send': 'Send request', 'f.sent': 'Thank you. Pavlo will reply in the messenger you chose.',
      'f.sent.note': 'Concept: in the working version the request goes to Pavlo on WhatsApp.',
      'f.err.dates': 'Pick check-in and check-out dates', 'f.err.name': 'Please write your name', 'f.err.contact': 'Leave a phone or Telegram',
      'f.err.month': 'Pick a month', 'f.months.n': 'mo.', 'f.children.0': 'no children',
      'cal.checkin': 'Check-in', 'cal.checkout': 'Check-out', 'cal.clear': 'Clear', 'cal.done': 'Done', 'cal.nights': 'nights',
      'cal.busy': 'booked', 'cal.free': 'free', 'cal.prev': 'Previous month', 'cal.next': 'Next month',
      's8.btn': 'Write to Pavlo',
      'ft.label': 'In touch', 'ft.h1': 'Write to', 'ft.h2': 'Pavlo.', 'ft.p': 'He answers himself. Say which dates and how many of you.',
      'ft.site': 'Site', 'ft.planning': 'Planning', 'ft.questions': 'Questions',
      'ft.time': 'Time in Promajna', 'ft.now': 'Right now', 'ft.sea': 'To the sea', 'ft.sea.v': '300 m', 'ft.air': 'Air', 'ft.seat': 'Sea',
      'ft.up': 'Top', 'ft.copy': '© 2026 Pomalo, Promajna. Site concept for @pavel_adriatic: photos are generated, layouts and areas are approximate.',
      'ft.whatsapp': 'WhatsApp', 'ft.whatsapp.note': 'number to be added',
      'as.open': 'Ask', 'as.title': 'Questions about Promajna', 'as.sub': 'An assistant answers in Pavlo’s words. What it does not know, it passes to Pavlo.',
      'as.ph': 'Your question', 'as.send': 'Send', 'as.fallback': 'I will pass this to Pavlo. Leave a contact and he will reply.', 'as.close': 'Close',
      'cat.title': 'Apartments', 'cat.sub': 'Ten apartments, each with a sea view. Pick a floor on the plan or filter the list.',
      'cat.floor': 'Floor', 'cat.bedrooms': 'Bedrooms', 'cat.season': 'Season', 'cat.sort': 'Sort', 'cat.all': 'all',
      'cat.sort.floor': 'by floor', 'cat.sort.area': 'by area',
      'cat.plan.h': 'Pick an apartment on the plan', 'cat.plan.hint': 'Hover a window to see the apartment. Click opens the layout.',
      'cat.floor.n': 'floor', 'cat.guests': 'guests', 'cat.view': 'View: sea and Brač', 'cat.view.s': 'Sea and Brač',
      'cat.more': 'Details', 'cat.book': 'Book', 'cat.neighbours': 'Above and below', 'cat.above': 'Above', 'cat.below': 'Below',
      'cat.roof': 'roof', 'cat.ground': 'yard and parking', 'cat.apt': 'Apartment', 'cat.empty': 'Nothing matches these filters.',
      'cat.note': 'Layouts, areas and booked dates in this concept are approximate. They will be replaced with Pavlo’s data.',
      'cat.sea': 'Adriatic sea · Brač across the water', 'cat.count': 'apartments',
      'ap.back': 'Back to the plan', 'ap.facts': 'Facts', 'ap.gallery': 'Gallery', 'ap.plan': 'Layout', 'ap.has': 'What is there',
      'ap.calendar': 'Availability', 'ap.calendar.note': 'Demo: booked dates are made up.', 'ap.onfacade': 'Where in the house',
      'ap.book': 'Request this apartment', 'ap.area': 'm²', 'ap.view': 'Sea and Brač view', 'ap.plan.note': 'Layout is approximate, demo.',
      'room.living': 'Living room', 'room.bed': 'Bedroom', 'room.bed2': 'Bedroom 2', 'room.kitchen': 'Kitchen', 'room.bath': 'Bathroom',
      'room.balcony': 'Balcony', 'room.terrace': 'Terrace', 'room.hall': 'Hall', 'room.sea': 'sea',
      'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      'months.g': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      'days': ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    }
  };

  /* ---------- Seasonal texts ---------- */
  var season = {
    ua: {
      summer: {
        'ind': '☀ Літо',
        's2.h1': 'Десять апартаментів', 's2.h2': 'за 300 метрів від моря.',
        's2.p': 'Промайна - маленьке курортне селище на Макарській Рив’єрі, під горами Біоково. З кожного апартаменту видно море і острів Брач. Я Павло, власник. Ви бронюєте напряму в мене, без комісії Booking, тому ціна для вас нижча.',
        's3.h1': 'Море видно', 's3.h2': 'з кожного апартаменту',
        's4.label': 'Промайна влітку', 's4.h1': 'Море, гори', 's4.h2': 'і жодного поспіху.',
        's4.p': 'Пляж за 300 метрів, сосни до самої води, увечері сонце сідає за Брач. Ось що поруч, коли ви тут на тиждень чи два.',
        's4.cards': [
          { t: 'Пляж за 300 метрів', p: 'Галька, прозора вода і сосни, під якими ховаються від спеки. До моря кілька хвилин пішки.', img: 'e-beach' },
          { t: 'Тепле море', p: '20 вересня ми заміряли: повітря +28, море +25.', img: 'e-sea' },
          { t: 'Захід над Брачем', p: 'Острів навпроти, і щовечора сонце сідає просто за нього.', img: 'e-brac' },
          { t: 'Біоково', p: 'Гори починаються одразу за селищем. Стежки ведуть на хребет, звідки видно все узбережжя.', img: 'e-biokovo' },
          { t: 'Макарська', p: 'Набережна з пальмами, кафе і порт за 6 км уздовж моря.', img: 'e-makarska' },
          { t: 'На острови', p: 'З Макарської ходить пором на Брач, а з берега видно Брач і Хвар.', img: 'e-boat' },
          { t: 'Мангал у дворі', p: 'Зранку купили рибу, ввечері смажите її на мангалі біля будинку.', img: 'e-grill' },
          { t: 'Ринок', p: 'У Макарській зранку продають інжир, помідори і домашню оливкову олію.', img: 'e-market' },
          { t: 'Робота з видом', p: 'Wi-Fi у кожному апартаменті, а ноутбук можна поставити на балконі.', img: 'e-work' },
          { t: 'Паркінг', p: 'Приїжджаєте машиною: місце є на нашому паркінгу біля будинку.', img: 'apt-3', pos: '70% 60%' }
        ],
        's5.label': 'Напряму від власника', 's5.h': 'Без комісії Booking',
        's5.slides': [
          'Booking і Airbnb беруть комісію з кожного бронювання. Коли ви пишете мені напряму, цієї надбавки немає.',
          'Ціну на ваші дати я називаю одразу і кажу, що в неї входить.',
          'Синхронізую календар із Booking і Airbnb, тому дати на сайті завжди актуальні.'
        ],
        's5.link': 'Дізнатися ціну', 's5.img': 'split-summer', 's5.small': 'about-b-summer',
        's6.label': 'Маршрути', 's6.h1': 'Один день, три', 's6.h2': 'чи цілий тиждень',
        's6.p': 'Ми склали маршрути з Промайни на 1, 3 і 7 днів: пляжі, гори, сусідні містечка й острови. Карта показує, що де.',
        's6.facts': ['До моря: 300 м', 'Паркінг: є', 'Сезон: травень - вересень'],
        's6.img': 'feature-summer',
        's7.p': 'Вкажіть дати і скільки вас. Павло перевірить календар і відповість особисто.',
        's8.h1': 'Готові?', 's8.h2': 'До моря 300 метрів.', 's8.p': 'Напишіть Павлу, і він назве ціну на ваші дати.',
        's8.imgs': ['e-brac', 'e-sea', 'apt-3', 'e-makarska'],
        'about.a': 'about-a-summer', 'about.b': 'about-b-summer',
        'marquee': ['Pomalo', 'ПРОМАЙНА · ХОРВАТІЯ', 'МАКАРСЬКА РИВ’ЄРА', '300 М ДО МОРЯ', 'ВИД НА МОРЕ З КОЖНОГО АПАРТАМЕНТУ', 'НАПРЯМУ ВІД ВЛАСНИКА']
      },
      winter: {
        'ind': '❄ Зима',
        's2.h1': 'Море нікуди не зникає.', 's2.h2': 'А от натовпи туристів так.',
        's2.p': 'Взимку я здаю свої десять апартаментів у Промайні помісячно, від двох місяців. Від 450 € на місяць за двох, до моря 300 метрів, з вікна видно Брач. Приблизно половина наших зимових гостей - українці, і пишу я теж українською.',
        's3.h1': 'Ваш дім на зиму', 's3.h2': 'з видом на море',
        's4.label': 'Промайна взимку', 's4.h1': 'Тиша, сосни', 's4.h2': 'і море за вікном.',
        's4.p': 'Взимку Промайна живе повільно. Частина кафе зачиняється до сезону, буває бура. Зате пляж порожній, у жовтні вода ще +23, а в квартирі спокійно працювати.',
        's4.cards': [
          { t: 'Море в жовтні', p: '16 жовтня в Промайні: вода +23, повітря +27.', img: 'e-sea' },
          { t: 'Порожній пляж', p: 'Узимку на березі ні лежаків, ні натовпу. Гуляєте вздовж моря під соснами.', img: 'e-beach' },
          { t: 'Біоково без спеки', p: 'Взимку на стежки Біоково йти легше, ніж у липні.', img: 'e-biokovo' },
          { t: 'Віддалена робота', p: 'Wi-Fi у кожному апартаменті, стіл біля вікна і тиша.', img: 'split-winter' },
          { t: 'Набережна', p: 'Прогулянка вздовж моря до Макарської або Башкої Води.', img: 'e-winter-walk' },
          { t: 'Бура', p: 'Північний вітер дме кілька днів поспіль. Море темнішає, сосни гнуться, і цей час краще перечекати вдома з чаєм.', img: 'e-bora' },
          { t: 'Захід над Брачем', p: 'Зимове сонце сідає за острів раніше, і небо стає рожевим.', img: 'e-brac' },
          { t: 'Мангал і взимку', p: 'Двір і мангал нікуди не зникають після сезону.', img: 'e-grill' },
          { t: 'Макарська', p: 'Місто за 6 км: супермаркети, аптеки і ринок працюють цілий рік.', img: 'e-makarska' },
          { t: 'Свої поруч', p: 'Половина наших зимових гостей - українці.', img: 'about-b-winter' }
        ],
        's5.label': 'Скільки коштує зима', 's5.h': 'Від 450 € на місяць',
        's5.slides': [
          'Ціна за апартамент для двох, мінімум два місяці. Ріелтора немає, тому немає і комісії.',
          'При заселенні ви платите перший місяць, останній місяць і депозит: разом 1 350 €. Депозит повертається за договором.',
          'Для порівняння: квартира в Ужгороді за 800 € на місяць на старті коштує 2 800 € разом із ріелтором.'
        ],
        's5.link': 'Порахувати мій період', 's5.img': 'split-winter', 's5.small': 'about-a-winter',
        's6.label': 'Для українців', 's6.h1': 'Пишіть українською,', 's6.h2': 'відповідає власник.',
        's6.p': 'Я Павло, і половина моїх зимових гостей з України. Підкажу, як доїхати, що взяти з собою і як тут влаштований побут узимку. Реєстрацію адреси для тимчасового захисту обговорюємо до бронювання.',
        's6.facts': ['Мінімальний термін: 2 місяці', 'Ціна: від 450 € на місяць за двох', 'До моря: 300 м'],
        's6.img': 'feature-winter',
        's7.p': 'Вкажіть місяці, скільки вас і ваш бюджет. Павло підбере апартамент і відповість особисто.',
        's8.h1': 'Цієї зими', 's8.h2': 'прокидайтеся від шуму моря.', 's8.p': 'Від 450 € на місяць за двох, від двох місяців. Напишіть, на коли плануєте.',
        's8.imgs': ['about-b-winter', 'e-winter-walk', 'split-winter', 'e-bora'],
        'about.a': 'about-a-winter', 'about.b': 'about-b-winter',
        'marquee': ['Pomalo', 'ПРОМАЙНА · ХОРВАТІЯ', 'МАКАРСЬКА РИВ’ЄРА', '300 М ДО МОРЯ', 'ВИД НА МОРЕ З КОЖНОГО АПАРТАМЕНТУ', 'НАПРЯМУ ВІД ВЛАСНИКА']
      }
    },
    en: {
      summer: {
        'ind': '☀ Summer',
        's2.h1': 'Ten apartments', 's2.h2': '300 metres from the sea.',
        's2.p': 'Promajna is a small resort village on the Makarska Riviera, under the Biokovo mountains. Every apartment looks out on the sea and the island of Brač. I am Pavlo, the owner. You book directly with me, with no Booking fee, so the price is lower for you.',
        's3.h1': 'The sea is visible', 's3.h2': 'from every apartment',
        's4.label': 'Promajna in summer', 's4.h1': 'Sea, mountains', 's4.h2': 'and no hurry.',
        's4.p': 'The beach is 300 metres away, pines reach the water, and in the evening the sun sets behind Brač. Here is what is nearby when you stay for a week or two.',
        's4.cards': [
          { t: 'Beach 300 metres away', p: 'Pebbles, clear water and pines to hide from the heat. A few minutes on foot to the sea.', img: 'e-beach' },
          { t: 'Warm sea', p: 'On 20 September we measured: air +28, sea +25.', img: 'e-sea' },
          { t: 'Sunset over Brač', p: 'The island is right across, and every evening the sun sets straight behind it.', img: 'e-brac' },
          { t: 'Biokovo', p: 'The mountains start right behind the village. Trails lead up to the ridge with a view of the whole coast.', img: 'e-biokovo' },
          { t: 'Makarska', p: 'A palm-lined promenade, cafes and a harbour 6 km along the sea.', img: 'e-makarska' },
          { t: 'To the islands', p: 'A ferry runs from Makarska to Brač, and from the shore you can see Brač and Hvar.', img: 'e-boat' },
          { t: 'Grill in the yard', p: 'Buy fish in the morning, grill it by the house in the evening.', img: 'e-grill' },
          { t: 'Market', p: 'In the morning Makarska sells figs, tomatoes and home-made olive oil.', img: 'e-market' },
          { t: 'Work with a view', p: 'Wi-Fi in every apartment, and the laptop fits on the balcony.', img: 'e-work' },
          { t: 'Parking', p: 'Coming by car? There is a spot in our parking by the house.', img: 'apt-3', pos: '70% 60%' }
        ],
        's5.label': 'Direct from the owner', 's5.h': 'No Booking fee',
        's5.slides': [
          'Booking and Airbnb charge a fee on every reservation. When you write to me directly, that extra is gone.',
          'I name the price for your dates right away and say what it includes.',
          'I sync the calendar with Booking and Airbnb, so the dates on the site are always current.'
        ],
        's5.link': 'Get a price', 's5.img': 'split-summer', 's5.small': 'about-b-summer',
        's6.label': 'Routes', 's6.h1': 'One day, three', 's6.h2': 'or a whole week',
        's6.p': 'We put together routes from Promajna for 1, 3 and 7 days: beaches, mountains, nearby towns and islands. The map shows what is where.',
        's6.facts': ['To the sea: 300 m', 'Parking: yes', 'Season: May to September'],
        's6.img': 'feature-summer',
        's7.p': 'Tell us the dates and how many of you. Pavlo checks the calendar and replies himself.',
        's8.h1': 'Ready?', 's8.h2': 'The sea is 300 metres away.', 's8.p': 'Write to Pavlo and he will name the price for your dates.',
        's8.imgs': ['e-brac', 'e-sea', 'apt-3', 'e-makarska'],
        'about.a': 'about-a-summer', 'about.b': 'about-b-summer',
        'marquee': ['Pomalo', 'PROMAJNA · CROATIA', 'MAKARSKA RIVIERA', '300 M TO THE SEA', 'SEA VIEW FROM EVERY APARTMENT', 'DIRECT FROM THE OWNER']
      },
      winter: {
        'ind': '❄ Winter',
        's2.h1': 'The sea does not go anywhere.', 's2.h2': 'The tourist crowds do.',
        's2.p': 'In winter I rent my ten apartments in Promajna by the month, from two months. From 450 € a month for two, 300 metres to the sea, Brač out of the window. About half of our winter guests are Ukrainian, and I write in Ukrainian too.',
        's3.h1': 'Your home for the winter', 's3.h2': 'with a sea view',
        's4.label': 'Promajna in winter', 's4.h1': 'Quiet, pines', 's4.h2': 'and the sea outside the window.',
        's4.p': 'In winter Promajna lives slowly. Some cafes close until the season, and sometimes the bora blows. But the beach is empty, the water is still +23 in October, and the apartment is a calm place to work.',
        's4.cards': [
          { t: 'Sea in October', p: '16 October in Promajna: water +23, air +27.', img: 'e-sea' },
          { t: 'Empty beach', p: 'No sunbeds and no crowd on the shore in winter. You walk along the sea under the pines.', img: 'e-beach' },
          { t: 'Biokovo without the heat', p: 'Biokovo trails are easier to walk in winter than in July.', img: 'e-biokovo' },
          { t: 'Remote work', p: 'Wi-Fi in every apartment, a desk by the window and quiet.', img: 'split-winter' },
          { t: 'Promenade', p: 'A walk along the sea to Makarska or Baška Voda.', img: 'e-winter-walk' },
          { t: 'Bora', p: 'The north wind blows for a few days in a row. The sea darkens, the pines bend, and that time is best spent at home with tea.', img: 'e-bora' },
          { t: 'Sunset over Brač', p: 'The winter sun sets behind the island earlier, and the sky turns pink.', img: 'e-brac' },
          { t: 'Grill in winter too', p: 'The yard and the grill do not go anywhere after the season.', img: 'e-grill' },
          { t: 'Makarska', p: 'The town is 6 km away: supermarkets, pharmacies and the market work all year.', img: 'e-makarska' },
          { t: 'Your people nearby', p: 'Half of our winter guests are Ukrainian.', img: 'about-b-winter' }
        ],
        's5.label': 'What winter costs', 's5.h': 'From 450 € a month',
        's5.slides': [
          'The price is per apartment for two, minimum two months. No agent, so no agent fee.',
          'At check-in you pay the first month, the last month and a deposit: 1 350 € in total. The deposit is returned under the contract.',
          'For comparison: a flat in Uzhhorod at 800 € a month costs 2 800 € to start, with the agent.'
        ],
        's5.link': 'Calculate my stay', 's5.img': 'split-winter', 's5.small': 'about-a-winter',
        's6.label': 'For Ukrainians', 's6.h1': 'Write in Ukrainian,', 's6.h2': 'the owner replies.',
        's6.p': 'I am Pavlo, and half of my winter guests are from Ukraine. I will tell you how to get here, what to bring and how daily life works here in winter. Address registration for temporary protection is discussed before booking.',
        's6.facts': ['Minimum stay: 2 months', 'Price: from 450 € a month for two', 'To the sea: 300 m'],
        's6.img': 'feature-winter',
        's7.p': 'Tell us the months, how many of you and your budget. Pavlo picks an apartment and replies himself.',
        's8.h1': 'This winter', 's8.h2': 'wake up to the sound of the sea.', 's8.p': 'From 450 € a month for two, from two months. Write and say when you plan to come.',
        's8.imgs': ['about-b-winter', 'e-winter-walk', 'split-winter', 'e-bora'],
        'about.a': 'about-a-winter', 'about.b': 'about-b-winter',
        'marquee': ['Pomalo', 'PROMAJNA · CROATIA', 'MAKARSKA RIVIERA', '300 M TO THE SEA', 'SEA VIEW FROM EVERY APARTMENT', 'DIRECT FROM THE OWNER']
      }
    }
  };

  /* ---------- Routes (summer map) ---------- */
  var points = {
    promajna: { ll: [43.3349, 16.9737], ua: 'Промайна', en: 'Promajna' },
    baska:    { ll: [43.3585, 16.9488], ua: 'Башка Вода', en: 'Baška Voda' },
    makarska: { ll: [43.2940, 17.0202], ua: 'Макарська', en: 'Makarska' },
    brela:    { ll: [43.3684, 16.9321], ua: 'Брела, Пунта Рата', en: 'Brela, Punta Rata' },
    skywalk:  { ll: [43.2855, 17.0848], ua: 'Skywalk Біоково', en: 'Biokovo Skywalk' },
    tucepi:   { ll: [43.2651, 17.0581], ua: 'Тучепи і Подгора', en: 'Tučepi and Podgora' },
    split:    { ll: [43.5081, 16.4402], ua: 'Спліт', en: 'Split' },
    omis:     { ll: [43.4447, 16.6886], ua: 'Омиш', en: 'Omiš' },
    hvar:     { ll: [43.1729, 16.4411], ua: 'Хвар', en: 'Hvar' },
    sumartin: { ll: [43.2862, 16.8729], ua: 'Сумартин, Брач', en: 'Sumartin, Brač' }
  };
  var routes = {
    d1: { ua: ['Ранок на пляжі Промайни', 'Обід на набережній Башкої Води (3 км)', 'Захід сонця на набережній Макарської (6 км)'],
          en: ['Morning on the Promajna beach', 'Lunch on the Baška Voda promenade (3 km)', 'Sunset on the Makarska promenade (6 km)'],
          pts: ['promajna', 'baska', 'makarska'], zoom: 13 },
    d3: { ua: ['Скляний оглядовий майданчик Skywalk на Біоково', 'Пором з Макарської на Брач', 'Пляж Пунта Рата у Брелі'],
          en: ['The glass Skywalk viewpoint on Biokovo', 'Ferry from Makarska to Brač', 'Punta Rata beach in Brela'],
          pts: ['skywalk', 'sumartin', 'brela'], zoom: 12 },
    d7: { ua: ['Спліт і палац Діоклетіана', 'Омиш і каньйон Цетини', 'Острів Хвар', 'Тучепи і Подгора'],
          en: ['Split and Diocletian’s Palace', 'Omiš and the Cetina canyon', 'The island of Hvar', 'Tučepi and Podgora'],
          pts: ['split', 'omis', 'hvar', 'tucepi'], zoom: 10 }
  };

  /* ---------- Assistant ---------- */
  var assistant = {
    ua: [
      { q: 'Скільки коштує зимівля?', a: 'Від 450 € на місяць за апартамент для двох, мінімум два місяці. При заселенні: перший, останній місяць і депозит, разом 1 350 €.' },
      { q: 'Де ви?', a: 'Промайна, Макарська Рив’єра, Хорватія. До моря 300 метрів, до Макарської 6 км.' },
      { q: 'Чи є паркінг і Wi-Fi?', a: 'Так, паркінг біля будинку і Wi-Fi у кожному апартаменті. У дворі є мангал.' },
      { q: 'Яке море восени?', a: '20 вересня вода була +25, 16 жовтня +23. Купальний сезон тут затягується.' },
      { q: 'Як забронювати?', a: 'Залиште запит у формі або напишіть Павлу. Він підбере апартамент і відповість особисто.' },
      { q: 'А документи для українців?', a: 'Реєстрацію адреси для тимчасового захисту Павло обговорює до бронювання. Напишіть йому.' }
    ],
    en: [
      { q: 'What does a winter stay cost?', a: 'From 450 € a month per apartment for two, minimum two months. At check-in: first month, last month and a deposit, 1 350 € in total.' },
      { q: 'Where are you?', a: 'Promajna, Makarska Riviera, Croatia. 300 metres to the sea, 6 km to Makarska.' },
      { q: 'Is there parking and Wi-Fi?', a: 'Yes, parking by the house and Wi-Fi in every apartment. There is a grill in the yard.' },
      { q: 'How is the sea in autumn?', a: 'On 20 September the water was +25, on 16 October +23. The swimming season lasts long here.' },
      { q: 'How do I book?', a: 'Leave a request in the form or write to Pavlo. He picks an apartment and replies himself.' },
      { q: 'What about papers for Ukrainians?', a: 'Pavlo discusses address registration for temporary protection before booking. Write to him.' }
    ]
  };

  var links = {
    threads: 'https://www.threads.com/@pavel_adriatic',
    tiktok: 'https://www.tiktok.com/@pavel_adriatic'
  };

  return {
    crest: crest,
    apartments: apartments,
    typeMeta: typeMeta,
    amenities: amenities,
    ui: ui,
    season: season,
    points: points,
    routes: routes,
    assistant: assistant,
    links: links
  };
})();
