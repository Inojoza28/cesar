const LINKS = {
  calendario: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vToFdKaJjZZt1gE1gRaerQZ8ECKvemD4SjtGLPyM7mbETXeKhBPs_iAOqUCXhaO7R2jN0U3l62Ps6Ps/pubhtml?gid=268309876&single=true',
  portal: 'https://cesar.lyceum.com.br/AOnline3/#/home/avisos',
  classroom: 'https://classroom.google.com/c/Nzk5ODgyOTY3NTY3?cjc=xqldstea',
  duvidas: 'https://sites.google.com/cesar.org.br/especializacoes/p%C3%A1gina-inicial?authuser',
  tutorial: 'https://drive.google.com/file/d/1ggLZEK6GtLDJfFjpNFvtIYOT-nKnZzpj/view',
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

    home.querySelectorAll('.card-animate').forEach(card => {
      card.style.animation = 'none';
      card.offsetHeight;
      card.style.animation = '';
    });
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

    // --- 🟢 Filtra aulas do dia
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(now);
    const todayClasses = (data.classes || []).filter(c => {
      if (c.date) return c.date === todayStr;
      if (c.weekday) return c.weekday.toLowerCase().startsWith(weekday.toLowerCase().slice(0,3));
      return false;
    });

    if (!todayClasses.length) {
      // 📌 Verifica se há aula amanhã
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(tomorrow);

      const tomorrowClasses = (data.classes || []).filter(c => c.date === tomorrowStr);

      list.innerHTML = `
        <div class="rounded-2xl border border-orange-200 dark:border-[rgb(255_131_45_/_82%)]
        bg-gradient-to-br from-orange-50 via-orange-50/80 to-white
        dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-900
        p-10 text-center shadow-md shadow-orange-100/40 dark:shadow-black/10 transition-colors">

          <i data-lucide="calendar-x" 
            class="w-11 h-11 mx-auto mb-4 text-orange-400 dark:text-[rgb(255_131_45)] opacity-90">
          </i>

          <p class="text-gray-800 dark:text-white text-lg sm:text-xl font-semibold">
            Não há aulas hoje
          </p>

          <p class="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2">
            ${
              tomorrowClasses.length
                ? `⚡ Mas amanhã tem aula: <span class="font-medium">${tomorrowClasses[0].title}</span> com <span class="font-medium">${tomorrowClasses[0].teacher}</span> às ${tomorrowClasses[0].start}.`
                : "Aproveite o dia livre para descansar ou se organizar."
            }
          </p>
        </div>
      `;

      if (window.lucide) lucide.createIcons();
      return;
    }


    // --- Renderiza os cards das aulas
    for (const cls of todayClasses) {
      const card = document.createElement('article');
      card.className = `relative overflow-hidden rounded-2xl border border-orange-200 dark:border-[rgb(255_131_45_/_82%)]
        bg-orange-50 dark:bg-gray-800/80 p-6 sm:p-7 shadow-md shadow-orange-100/50
        dark:shadow-black/10 hover:shadow-xl hover:shadow-orange-200/50 transition`;

      card.innerHTML = `
        <div class="flex flex-col gap-4 h-full justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <i data-lucide="book-open" 
                class="w-6 h-6 text-orange-500 dark:text-[rgb(255_131_45)] shrink-0">
              </i>
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                ${cls.title || 'Aula'}
              </h3>
            </div>

            <p class="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              Professor(a): <span class="font-medium">${cls.teacher || '-'}</span>
            </p>

            ${cls.email ? `
            <p class="mt-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              <span class="font-medium">E-mail do professor(a):</span>
              <a href="mailto:${cls.email}" 
                class="ml-1 underline hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                ${cls.email}
              </a>
            </p>` : ''}


            <p class="text-gray-700 dark:text-gray-300 text-sm sm:text-base mt-1">
              Horário: ${cls.start || ''} — ${cls.end || ''}
            </p>
          </div>

          ${
            cls.link
              ? `
            <a href="${cls.link}" target="_blank" rel="noopener"
              class="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-orange dark:bg-[rgb(255_131_45_/_82%)] text-white font-medium hover:opacity-90 text-sm sm:text-base transition">
              <i data-lucide="external-link" class="w-4 h-4"></i>
              Entrar na aula
            </a>
          ` : ''
          }
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
