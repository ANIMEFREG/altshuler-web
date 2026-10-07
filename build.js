// Сборка сайта: node build.js
// Берёт тексты из _source/content.json и собирает index.html (иврит) и en/index.html (английский).
// Чтобы поменять текст, цену или почту — правьте content.json и запустите сборку заново.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
// адрес сайта в интернете (для Google и превью ссылок)
const SITE = 'https://altshuler.co.il/';
const C = JSON.parse(fs.readFileSync(path.join(ROOT, '_source/content.json'), 'utf8'));
// стили встраиваются в страницу (меньше запросов → быстрее первая отрисовка); редактировать — css/style.css
const CSS = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};])\s*/g, '$1').trim();

// шрифты лежат в fonts/ (скачаны _source/get-fonts.js) — без запросов к Google, страница появляется быстрее
const FONTS = fs.readFileSync(path.join(ROOT, '_source/fonts.css'), 'utf8').replace(/\s+/g, ' ');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// иконки в стиле Lucide (контур 1.75)
const ICON = {
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};
const icon = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;

function shot(name, widths, alt, sizes, eager, P) {
  const srcset = widths.map(w => `${P}img/${name}-${w}.webp ${w}w`).join(', ');
  const w = widths[0], h = name.includes('mobile') ? Math.round(w * 844 / 390) : Math.round(w * 900 / 1440);
  return `<img src="${P}img/${name}-${w}.webp" srcset="${srcset}" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}
const browser = img => `<div class="browser"><div class="browser__bar" aria-hidden="true"><i></i><i></i><i></i></div>${img}</div>`;
const phone = img => `<div class="phone">${img}</div>`;
const head = (eyebrow, title, n) => `<p class="eyebrow"><span>${n}</span>${eyebrow}</p><h2 class="h2">${title}</h2>`;

function page(L) {
  const P = L.path;
  const { hero, work, services, process, plans, about, faq, contact } = L;
  const ltr = L.dir === 'ltr';
  const arrow = icon('arrow', ltr ? '' : 'flip');

  const html = `<!doctype html>
<html lang="${L.lang}" dir="${L.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(L.title)}</title>
<meta name="description" content="${esc(L.description)}">
<meta name="theme-color" content="#F4F1EA">
<meta property="og:title" content="${esc(L.title)}">
<meta property="og:description" content="${esc(L.description)}">
<meta property="og:image" content="${SITE}img/roti-desktop-1440.webp">
<meta property="og:url" content="${SITE}${ltr ? 'en/' : ''}">
<link rel="canonical" href="${SITE}${ltr ? 'en/' : ''}">
<link rel="alternate" hreflang="he" href="${SITE}">
<link rel="alternate" hreflang="en" href="${SITE}en/">
<link rel="alternate" hreflang="x-default" href="${SITE}">
<link rel="icon" href="${P}favicon.svg" type="image/svg+xml">
${ltr ? `<link rel="preload" href="${P}fonts/rubik-latin-3.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${P}fonts/heebo-latin-1.woff2" as="font" type="font/woff2" crossorigin>` : `<link rel="preload" href="${P}fonts/rubik-hebrew-2.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${P}fonts/heebo-hebrew-0.woff2" as="font" type="font/woff2" crossorigin>`}
<style>${FONTS.replaceAll('FONTS/', P + 'fonts/')}${CSS}</style>
</head>
<body>
<a class="skip" href="#main">${L.skip}</a>
<header class="hdr" id="top">
  <div class="wrap hdr__in">
    <a class="logo" href="#top" aria-label="Altshuler">altshuler<b>.</b><small>${L.studio}</small></a>
    <nav class="nav" id="nav" aria-label="${L.menu}">
      ${L.nav.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
      <a class="nav__lang" href="${L.otherPath}" lang="${L.otherPath.includes('en') ? 'en' : 'he'}" aria-label="${L.otherName}">${L.otherLabel}</a>
      <a class="btn btn--ink nav__cta" href="#contact">${L.navCta}</a>
    </nav>
    <button class="burger" type="button" aria-controls="nav" aria-expanded="false" data-open="${L.menu}" data-close="${L.close}" aria-label="${L.menu}">${icon('menu', 'i-open')}${icon('x', 'i-close')}</button>
  </div>
</header>

<main id="main">
<section class="hero">
  <div class="wrap">
    <p class="kicker up">${hero.kicker}</p>
    <h1 class="hero__title">${hero.title.map((l, i) => `<span class="line up" style="--d:${i * 90}ms">${l}</span>`).join('')}</h1>
    <div class="hero__row">
      <p class="lead up" style="--d:300ms">${hero.lead}</p>
      <div class="hero__cta up" style="--d:380ms">
        <a class="btn btn--accent" href="#contact">${hero.cta}${arrow}</a>
        <a class="btn btn--line" href="#work">${hero.cta2}</a>
      </div>
    </div>
    <ul class="facts up" style="--d:450ms">${hero.facts.map(f => `<li>${icon('check')}${f}</li>`).join('')}</ul>
    <div class="hero__media up" style="--d:200ms">
      ${browser(shot('roti-desktop', [720, 1440], work.altDesktop, '(max-width: 1100px) 92vw, 1040px', true, P))}
      ${phone(shot('roti-mobile', [390], work.altMobile, '200px', true, P))}
    </div>
  </div>
</section>

<div class="band" aria-hidden="true"><div class="band__track">${[0, 1].map(() => `<span>${L.band.map(b => `${b}<i>✳</i>`).join('')}</span>`).join('')}</div></div>

<section class="sec" id="work">
  <div class="wrap">
    ${head(work.eyebrow, work.title, '01')}
    <article class="case">
      <div class="case__media rv">
        ${browser(shot('roti-menu', [720, 1440], work.altMenu, '(max-width: 900px) 92vw, 640px', false, P))}
        ${phone(shot('roti-mobile-menu', [390], work.altMobileMenu, '180px', false, P))}
      </div>
      <div class="case__body rv">
        <p class="case__meta">${work.year}</p>
        <h3 class="case__name">${work.name}</h3>
        <p class="case__type">${work.type}</p>
        <p class="case__task">${work.task}</p>
        <dl class="stats">${work.stats.map(([n, t]) => `<div><dt>${t}</dt><dd dir="ltr">${n}</dd></div>`).join('')}</dl>
        <ul class="tags">${work.tags.map(t => `<li>${t}</li>`).join('')}</ul>
        <a class="link" href="${C.rotisserieUrl}" target="_blank" rel="noopener">${work.link}${icon('external')}</a>
      </div>
    </article>
    <a class="next rv" href="#contact">
      <span class="next__plus">${icon('plus')}</span>
      <span><strong>${work.nextTitle}</strong><span>${work.nextText}</span></span>
      <span class="next__cta">${work.nextCta}${arrow}</span>
    </a>
  </div>
</section>

<section class="sec sec--dark" id="services">
  <div class="wrap">
    ${head(services.eyebrow, services.title, '02')}
    <div class="grid3">${services.items.map(([i, t, d]) => `<div class="feat rv">${icon(i)}<h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  </div>
</section>

<section class="sec" id="process">
  <div class="wrap">
    ${head(process.eyebrow, process.title, '03')}
    <ol class="steps">${process.steps.map(([t, d], i) => `<li class="rv" style="--d:${i * 80}ms"><span class="steps__n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
    <p class="note rv">${process.pay}</p>
  </div>
</section>

<section class="sec sec--paper" id="plans">
  <div class="wrap">
    ${head(plans.eyebrow, plans.title, '04')}
    <p class="lead lead--sec">${plans.lead}</p>
    <div class="plans">${plans.items.map(([t, d, price, list, pop], i) => `
      <div class="plan${pop ? ' plan--pop' : ''}${price ? '' : ' plan--vip'} rv" style="--d:${i * 80}ms">
        ${pop ? `<span class="plan__badge">${plans.popular}</span>` : price ? '' : `<span class="plan__badge plan__badge--vip">${plans.vipBadge}</span>`}
        <h3>${t}</h3><p class="plan__d">${d}</p>
        ${price ? `<p class="price"><small>${plans.from}</small><span dir="ltr">${price}</span><small>${plans.currency}</small></p>
        <p class="plan__once">${plans.once}</p>` : `<p class="price price--word"><span>${plans.vipPrice}</span></p>
        <p class="plan__once">${plans.vipOnce}</p>`}
        <ul>${list.map(x => x.startsWith('+') ? `<li class="plan__plus">${x.slice(1)}</li>` : `<li>${icon('check')}${x}</li>`).join('')}</ul>
        <a class="btn ${pop ? 'btn--accent' : 'btn--line'}" href="#contact" data-plan="${i + 1}">${price ? plans.cta : plans.vipCta}</a>
      </div>`).join('')}
    </div>
    <div class="care rv">
      <div><h3>${plans.care.title}</h3><p>${plans.care.text}</p></div>
      <p class="price price--sm"><small>${plans.from}</small><span dir="ltr">${plans.care.price}</span><small>${plans.currency} ${plans.care.per}</small></p>
    </div>
  </div>
</section>

<section class="sec" id="about">
  <div class="wrap about">
    <p class="eyebrow"><span>05</span>${about.eyebrow}</p>
    <div class="about__body rv">
      <h2 class="h2">${about.title}</h2>
      ${about.text.map(p => `<p>${p}</p>`).join('')}
    </div>
  </div>
</section>

<section class="sec sec--line" id="faq">
  <div class="wrap faq">
    <div>${head(faq.eyebrow, faq.title, '06')}</div>
    <div class="faq__list">${faq.items.map(([q, a]) => `<details class="rv"><summary>${q}${icon('plus')}</summary><p>${a}</p></details>`).join('')}</div>
  </div>
</section>

<section class="sec sec--accent" id="contact">
  <div class="wrap contact">
    <div>
      <p class="eyebrow"><span>07</span>${contact.eyebrow}</p>
      <h2 class="h2 h2--xl">${contact.title}</h2>
      <p class="lead">${contact.lead}</p>
      <p class="contact__mail">${contact.or}<a href="mailto:${C.email}" dir="ltr">${C.email}</a></p>
    </div>
    <form class="form" id="form" novalidate data-email="${C.email}" data-subject="${esc(contact.subject)}" data-sent="${esc(contact.sent)}" data-required="${esc(contact.required)}">
      <label>${contact.name}<input name="name" autocomplete="name" required></label>
      <label>${contact.business}<input name="business" autocomplete="organization"></label>
      <label>${contact.phone}<input name="phone" type="tel" autocomplete="tel" inputmode="tel" dir="ltr" required></label>
      <label>${contact.emailLabel}<input name="email" type="email" autocomplete="email" dir="ltr"></label>
      <label class="full">${contact.plan}<select name="plan">${contact.planOptions.map(o => `<option>${o}</option>`).join('')}</select></label>
      <label class="full">${contact.message}<textarea name="message" rows="4" placeholder="${esc(contact.messagePh)}"></textarea></label>
      <button class="btn btn--ink full" type="submit">${contact.send}${arrow}</button>
      <p class="form__status full" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
</main>

<footer class="ftr">
  <div class="wrap ftr__in">
    <a class="logo logo--sm" href="#top">altshuler<b>.</b></a>
    <p><span dir="ltr">© <span id="y">2026</span> Roman Altshuler</span> · ${L.footer.rights}</p>
    <a href="#top">${L.footer.top} ↑</a>
  </div>
</footer>
<script src="${P}js/main.js" defer></script>
</body>
</html>
`;
  return html;
}

fs.writeFileSync(path.join(ROOT, 'index.html'), page(C.he));
fs.mkdirSync(path.join(ROOT, 'en'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'en/index.html'), page(C.en));
console.log('Готово: index.html, en/index.html');
