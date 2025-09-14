const LINKS = {
  calendario: 'https://drive.google.com/',
  portal: 'https://portal.cesarschool.com.br/',
  classroom: 'https://classroom.google.com/',
  duvidas: 'https://cesarschool.com.br/',
  tutorial: 'https://cesarschool.com.br/',
  instagram: 'https://www.instagram.com/cesarschool/'
};

function formatDateBR(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Recife'
  }).format(date);
}

function router() {
  const hash = location.hash || '#/';
  const home = document.getElementById('view-home');
  const horario = document.getElementById('view-horario');
  if (hash.startsWith('#/horario')) {
    home.classList.add('hidden');
    horario.classList.remove('hidden');
  } else {
    horario.classList.add('hidden');
    home.classList.remove('hidden');
  }
}
window.addEventListener('hashchange', router);

function initLinks() {
  document.getElementById('card-calendario').href = LINKS.calendario;
  document.getElementById('card-portal').href = LINKS.portal;
  document.getElementById('card-classroom').href = LINKS.classroom;
  document.getElementById('card-duvidas').href = LINKS.duvidas;
  document.getElementById('card-tutorial').href = LINKS.tutorial;
  document.getElementById('instagram-link').href = LINKS.instagram;
}

function renderTodayPill() {
  const el = document.getElementById('today-pill');
  if (!el) return;
  const today = new Date();
  el.querySelector('span').textContent = formatDateBR(today);
}

async function renderAulasDoDia() {
  const subtitle = document.getElementById('horario-subtitle');
  const list = document.getElementById('lista-aulas');
  list.innerHTML = '';

  try {
    const res = await fetch('data/aulas.json', { cache: 'no-store' });
    const data = await res.json();

    const now = new Date();
    const tz = data?.config?.timezone || 'America/Recife';
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(now);
    subtitle.textContent = `Hoje: ${formatDateBR(now)}`;

    // --- 🟠 Verifica ciclo 2 semanas com aula / 1 semana de pausa
    const baseDate = new Date(data?.config?.baseDate || '2025-09-16');
    const diffWeeks = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24 * 7));
    const isBreakWeek = diffWeeks % 3 === 2; // 0 e 1 = aula, 2 = pausa

    if (isBreakWeek) {
      list.innerHTML = `
        <div class="rounded-2xl border border-gray-200 bg-white p-6">
          <p class="text-gray-700">📌 Não há aulas esta semana (semana de pausa).</p>
        </div>
      `;
      return;
    }

    // --- 🟢 Filtra aulas do dia
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(now);
    const todayClasses = (data.classes || []).filter(c => {
      if (c.date) return c.date === todayStr;
      if (c.weekday) return c.weekday.toLowerCase().startsWith(weekday.toLowerCase().slice(0,3));
      return false;
    });

    if (!todayClasses.length) {
    list.innerHTML = `
      <div class="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-orange-50/80 to-white p-10 text-center shadow-md shadow-orange-100/40">
        <i data-lucide="calendar-x" class="w-11 h-11 mx-auto mb-4 text-orange-400 opacity-90"></i>
        <p class="text-gray-800 text-lg sm:text-xl font-semibold">
          Não há aulas hoje
        </p>
        <p class="text-gray-600 text-sm sm:text-base mt-2">
          Aproveite o dia livre para descansar ou se organizar 
        </p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }


    for (const cls of todayClasses) {
    const card = document.createElement('article');
    card.className = 'relative overflow-hidden rounded-2xl border border-orange-200 bg-orange-50 p-6 sm:p-7 shadow-md shadow-orange-100/50 hover:shadow-xl hover:shadow-orange-200/50 transition';
    card.innerHTML = `
        <div class="flex flex-col gap-4 h-full justify-between">
        <div>
            <div class="flex items-center gap-3 mb-2">
            <i data-lucide="book-open" class="w-6 h-6 text-orange-500 shrink-0"></i>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900">${cls.title || 'Aula'}</h3>
            </div>
            <p class="text-gray-700 text-sm sm:text-base">Professor(a): <span class="font-medium">${cls.teacher || '-'}</span></p>
            <p class="text-gray-700 text-sm sm:text-base">Horário: ${cls.start || ''} — ${cls.end || ''}</p>
        </div>

        ${cls.link ? `
            <a href="${cls.link}" target="_blank" rel="noopener"
            class="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-white font-medium hover:opacity-90 text-sm sm:text-base">
            <i data-lucide="external-link" class="w-4 h-4"></i>
            Entrar na aula
            </a>
        ` : ''}
        </div>
    `;
    list.appendChild(card);
    }

    if (window.lucide) lucide.createIcons();
  } catch (e) {
    console.error(e);
    list.innerHTML = `
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p class="text-red-700">Não foi possível carregar as aulas. Verifique o arquivo <code>data/aulas.json</code>.</p>
      </div>
    `;
  }
}


initLinks();
renderTodayPill();
router();
renderAulasDoDia();
