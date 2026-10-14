// Altshuler — поведение страницы: меню на телефоне, появление блоков, форма → письмо
document.documentElement.classList.add('js');

// шапка: линия снизу после начала прокрутки
const hdr = document.querySelector('.hdr');
const onScroll = () => hdr.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// меню на телефоне
const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');
const setMenu = open => {
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? burger.dataset.close : burger.dataset.open);
  nav.classList.toggle('is-open', open);
};
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// появление блоков при прокрутке
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
}), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

const form = document.getElementById('form');

// форма: проверка + отправка через Web3Forms (ключ в data-key; заявка приходит на studio@, без перехода в почтовую программу)
form.addEventListener('submit', async e => {
  e.preventDefault();
  form.querySelectorAll('.err').forEach(el => el.remove());
  let bad = null;
  form.querySelectorAll('[required]').forEach(input => {
    const v = input.value.trim();
    const isEmail = input.type === 'email';
    const ok = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) : v.length > 1;
    input.classList.toggle('is-bad', !ok);
    input.setAttribute('aria-invalid', !ok);
    if (!ok) {
      const msg = document.createElement('span');
      msg.className = 'err';
      msg.textContent = isEmail && v ? form.dataset.badEmail : form.dataset.required;
      input.after(msg);
      bad = bad || input;
    }
  });
  if (bad) { bad.focus(); return; }
  const f = form.elements;
  if (f.botcheck.value) return; // бот заполнил скрытое поле
  const data = {};
  form.querySelectorAll('label').forEach(l => {
    const el = l.querySelector('input, select, textarea');
    if (el.value.trim()) data[l.firstChild.textContent.trim()] = el.value.trim();
  });
  data.subject = `${form.dataset.subject} — ${f.business.value.trim() || f.name.value.trim()}`;
  data.access_key = form.dataset.key;
  data.from_name = 'altshuler.co.il';
  data.replyto = f.email.value.trim();
  const status = form.querySelector('.form__status');
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  status.textContent = form.dataset.sending;
  try {
    const r = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    const res = await r.json().catch(() => ({}));
    if (!r.ok || res.success !== true) throw new Error(res.message || r.status);
    form.reset();
    status.textContent = form.dataset.sent;
  } catch (err) {
    status.textContent = form.dataset.error;
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('y').textContent = new Date().getFullYear();

// светлая / тёмная тема: первый раз — как в системе, дальше запоминаем выбор
document.querySelectorAll('.theme').forEach(btn => btn.addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
}));
