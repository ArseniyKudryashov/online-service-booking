// ===== GameMaster — sessions data + booking logic (vanilla JS) =====
const SESSIONS = [
  { id: 1, system: 'dnd', systemLabel: 'D&D 5e', title: 'Прокляття Страда: Туман над Баровією', gm: 'Олена «Ворона» Кравчук', rating: '4.98', date: 'Сб, 27 вер • 19:00', format: 'Online • Roll20 + Discord', price: 450, total: 5, taken: 2, level: 'Новачкам OK' },
  { id: 2, system: 'coc', systemLabel: 'Call of Cthulhu', title: 'Жах Експреса: Потяг до Інсмута', gm: 'Дмитро Глибокий', rating: '4.9', date: 'Пт, 26 вер • 20:00', format: 'Online • Foundry', price: 400, total: 4, taken: 3, level: 'Ваншот' },
  { id: 3, system: 'cyber', systemLabel: 'Cyberpunk RED', title: 'Night City: Пограбування «Арасаки»', gm: 'Ігор «Нетраннер» Сава', rating: '4.8', date: 'Нд, 28 вер • 18:00', format: 'Київ • вул. Хрещатик, 22', price: 500, total: 6, taken: 3, level: 'Середній рівень' },
  { id: 4, system: 'vaesen', systemLabel: 'Vaesen', title: 'Шепіт глухого лісу', gm: 'Софія Ліндгрен', rating: '5.0', date: 'Сб, 27 вер • 17:00', format: 'Львів • офлайн-клуб', price: 350, total: 4, taken: 1, level: 'Новачкам OK' },
  { id: 5, system: 'pf', systemLabel: 'Pathfinder 2e', title: 'Зуби Ґаspоду: Початок кампанії', gm: 'Тарас «Лор» Шевчук', rating: '5.0', date: 'Чт, 2 жов • 19:30', format: 'Online • Foundry', price: 420, total: 5, taken: 4, level: 'Кампанія' },
  { id: 6, system: 'dnd', systemLabel: 'D&D 5e', title: 'Водяний Глибоководдя: Таверна «Позіхаючий портал»', gm: 'Максим Долина', rating: '4.85', date: 'Ср, 1 жов • 19:00', format: 'Дніпро • офлайн', price: 300, total: 6, taken: 2, level: 'Ваншот' },
];

const grid = document.getElementById('sessionsGrid');
// На головній (index.html) показуємо лише анонс — 3 найближчі гри.
// Фільтр над картками фільтрує саме цей анонс. Повний каталог — sessions.html.
const PREVIEW_LIMIT = 3;
let currentFilter = 'all';
let activeSession = null;
let seatsToBook = 1;

function seatsLeft(s) { return s.total - s.taken; }

function seatBadge(s) {
  const left = seatsLeft(s);
  const cls = left === 1 ? 'critical' : left <= 2 ? 'low' : '';
  return `<p class="seats ${cls}">🔥 Залишилося ${left}/${s.total} місць</p>`;
}

function renderSessions() {
  const filtered = SESSIONS.filter(s => currentFilter === 'all' || s.system === currentFilter);
  // Обмежуємо видачу анонсом: максимум PREVIEW_LIMIT найближчих карток
  const list = filtered.slice(0, PREVIEW_LIMIT);
  if (!filtered.length) {
    grid.innerHTML = '<p style="color:var(--muted)">Сесій за цим фільтром поки немає — спробуй іншу систему.</p>';
    return;
  }
  grid.innerHTML = list.map(s => `
    <article class="session-card" data-id="${s.id}">
      <div class="session-top">
        <span class="sys-pill ${s.system}">${s.systemLabel}</span>
        <span class="level">${s.level}</span>
      </div>
      <h3>${s.title}</h3>
      <p class="gm">ГМ <strong>${s.gm}</strong> • ⭐ ${s.rating}</p>
      <div class="session-meta">
        <span>📅 ${s.date}</span>
        <span>📍 ${s.format}</span>
      </div>
      ${seatBadge(s)}
      <div class="session-foot">
        <span class="price">${s.price} ₴ <small>/ гравець</small></span>
        <button class="btn btn-primary btn-sm" data-book-id="${s.id}">Забронювати місце</button>
      </div>
    </article>`).join('');
}

// Filters (chips + system cards)
function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === f));
  renderSessions();
}
document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => setFilter(c.dataset.filter)));
document.querySelectorAll('.sys-btn').forEach(b => b.addEventListener('click', () => {
  setFilter(b.dataset.filter);
  document.getElementById('sessions').scrollIntoView({ behavior: 'smooth' });
}));

// ===== Booking modal =====
const backdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const seatCountEl = document.getElementById('seatCount');
const modalTotal = document.getElementById('modalTotal');

function openModal(session) {
  activeSession = session;
  seatsToBook = 1;
  seatCountEl.textContent = seatsToBook;
  modalTitle.textContent = `«${session.title}»`;
  modalMeta.textContent = `${session.systemLabel} • ГМ ${session.gm} • ${session.date} • ${session.format}`;
  updateTotal();
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  backdrop.hidden = true;
  document.body.style.overflow = '';
}
function updateTotal() {
  modalTotal.textContent = `${(activeSession.price * seatsToBook).toLocaleString('uk-UA')} ₴`;
}

document.getElementById('plusBtn').addEventListener('click', () => {
  if (!activeSession) return;
  if (seatsToBook < seatsLeft(activeSession)) { seatsToBook++; seatCountEl.textContent = seatsToBook; updateTotal(); }
  else toast('Це всі вільні місця за цим столом 🔥');
});
document.getElementById('minusBtn').addEventListener('click', () => {
  if (seatsToBook > 1) { seatsToBook--; seatCountEl.textContent = seatsToBook; updateTotal(); }
});
document.getElementById('modalClose').addEventListener('click', closeModal);
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !backdrop.hidden) closeModal(); });

document.getElementById('confirmBtn').addEventListener('click', () => {
  if (!activeSession) return;
  activeSession.taken += seatsToBook;
  renderSessions();
  closeModal();
  toast(`Готово! ${seatsToBook} місць за столом «${activeSession.title}» заброньовано 🎲 Деталі надіслано на email.`);
});

// Delegate booking buttons (session cards + hero)
document.addEventListener('click', e => {
  const byId = e.target.closest('[data-book-id]');
  if (byId) {
    const s = SESSIONS.find(x => x.id === Number(byId.dataset.bookId));
    if (s) openModal(s);
    return;
  }
  const byName = e.target.closest('[data-book]');
  if (byName) {
    const s = SESSIONS.find(x => x.title === byName.dataset.book) || SESSIONS[0];
    openModal(s);
  }
});

// ===== Toast =====
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4200);
}

// ===== Burger =====
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
navLinks.addEventListener('click', e => {
  if (e.target.tagName === 'A') navLinks.classList.remove('open');
});

// ===== Reveal on scroll =====
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Forms =====
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

document.getElementById('gmForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('gmEmail');
  const note = document.getElementById('gmNote');
  if (!emailOk(input.value)) { note.textContent = '⚠️ Введи коректний email, мандрівнику.'; input.focus(); return; }
  note.textContent = '✅ Чудово! Гайд «Перші 5 платних сесій» вже летить на ' + input.value.trim();
  toast('Заявку ГМ прийнято! Перевір пошту 🐉');
  input.value = '';
});

document.getElementById('newsForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('newsEmail');
  const note = document.getElementById('newsNote');
  if (!emailOk(input.value)) { note.textContent = '⚠️ Перевір email для підписки.'; input.focus(); return; }
  note.textContent = '✅ Підписка активна! Промокод LEGEND20 — твій.';
  toast('Підписка на квести активована ✦');
  input.value = '';
});

// ===== Misc =====
document.getElementById('year').textContent = new Date().getFullYear();
renderSessions();
