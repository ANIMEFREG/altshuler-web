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

// кнопка плана сразу выбирает его в форме
const form = document.getElementById('form');
document.querySelectorAll('[data-plan]').forEach(a => a.addEventListener('click', () => {
  form.elements.plan.selectedIndex = +a.dataset.plan;
}));

// форма: проверка + открывает почту с готовым письмом (сервера для отправки пока нет)
form.addEventListener('submit', e => {
  e.preventDefault();
  form.querySelectorAll('.err').forEach(el => el.remove());
  let bad = null;
  form.querySelectorAll('[required]').forEach(input => {
    const ok = input.value.trim().length > 1;
    input.classList.toggle('is-bad', !ok);
    input.setAttribute('aria-invalid', !ok);
    if (!ok) {
      const msg = document.createElement('span');
      msg.className = 'err';
      msg.textContent = form.dataset.required;
      input.after(msg);
      bad = bad || input;
    }
  });
  if (bad) { bad.focus(); return; }
  const f = form.elements;
  const lines = [...form.querySelectorAll('label')].map(l => {
    const el = l.querySelector('input, select, textarea');
    return el.value.trim() ? `${l.firstChild.textContent.trim()}: ${el.value.trim()}` : null;
  }).filter(Boolean);
  const subject = `${form.dataset.subject} — ${f.business.value.trim() || f.name.value.trim()}`;
  location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  form.querySelector('.form__status').textContent = form.dataset.sent;
});

document.getElementById('y').textContent = new Date().getFullYear();
