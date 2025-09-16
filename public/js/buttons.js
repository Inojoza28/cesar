// ========== MENU FLUTUANTE ==========
const fabToggle = document.getElementById('fab-toggle');
const fabInfo = document.getElementById('fab-info');
const fabTheme = document.getElementById('fab-theme');
let fabOpen = false;

fabToggle.addEventListener('click', () => {
  fabOpen = !fabOpen;
  const buttons = [fabInfo, fabTheme];

  buttons.forEach((btn, i) => {
    if (fabOpen) {
      btn.classList.remove('hidden');
      setTimeout(() => {
        btn.classList.remove('opacity-0', 'translate-y-2');
      }, i * 80);
    } else {
      btn.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => btn.classList.add('hidden'), 300);
    }
  });

  // 🔁 Troca ícone menu ↔ x com animação
  fabToggle.innerHTML = `<i data-lucide="${fabOpen ? 'x' : 'plus'}" class="w-5 h-5 transition-transform duration-300"></i>`;
  lucide.createIcons();
});


// ========== MODAL DE INFORMAÇÕES ==========
const infoModal = document.getElementById('info-modal');
document.getElementById('fab-info').addEventListener('click', () => {
  infoModal.classList.remove('hidden', 'opacity-0');
  infoModal.classList.add('flex');
});
document.getElementById('close-info').addEventListener('click', () => {
  infoModal.classList.add('hidden');
});

// ========== TEMA ESCURO/CLARO ==========
const root = document.documentElement;
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') root.classList.add('dark');

document.getElementById('fab-theme').addEventListener('click', () => {
  root.classList.toggle('dark');
  const isDark = root.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  // Troca ícone sol/lua
  fabTheme.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5"></i>`;
  lucide.createIcons();
});
