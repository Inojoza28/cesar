// ========== ASSISTENTE DE VOZ ==========
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function startVoiceAssistant() {
  if (!SpeechRecognition) {
    alert("Seu navegador não suporta reconhecimento de voz.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onstart = () => {
    console.log("🎙️ Ouvindo...");
    updateVoiceUI(true);
    speak("Estou ouvindo");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    console.log("🔎 Você disse:", transcript);

    if (transcript.includes("hora de estudar")) {
      speak("Ambiente pronto!");
      openStudyLinks();
    } else {
      speak("Não entendi. Repita: hora de estudar.");
      setTimeout(() => recognition.start(), 1200); // recomeça após 1.2s
    }
  };

  recognition.onerror = (event) => {
    console.error("Erro no reconhecimento:", event.error);
    speak("Erro ao reconhecer. Tente novamente.");
    updateVoiceUI(false);
  };

  recognition.onend = () => {
    console.log("🎤 Encerrado.");
    updateVoiceUI(false);
  };
}

// ========== VOZ ==========
function speak(text) {
  speechSynthesis.cancel(); // limpa falas pendentes
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 1.05; // fala levemente mais rápido, soa natural
  speechSynthesis.speak(utterance);
}

// ========== FEEDBACK VISUAL ==========
function updateVoiceUI(listening) {
  const btn = document.getElementById("voice-start");
  if (!btn) return;

  if (listening) {
    btn.classList.add("bg-orange-600");
    btn.innerHTML = `<i data-lucide="mic" class="w-4 h-4"></i> Ouvindo...`;
    lucide.createIcons();
  } else {
    btn.classList.remove("bg-orange-600");
    btn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> Clique para falar`;
    lucide.createIcons();
  }
}

// ========== ABRIR LINKS ==========
async function openStudyLinks() {
  try {
    // Links fixos
    window.open("https://classroom.google.com/c/Nzk5ODgyOTY3NTY3?cjc=xqldstea", "_blank");
    window.open("https://cesar.lyceum.com.br/AOnline3/#/home/avisos", "_blank");

    // Aula de hoje via fetch do JSON
    const res = await fetch("data/aulas.json");
    const data = await res.json();

    const today = new Date();
    const tz = data?.config?.timezone || "America/Recife";
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(today);

    const todayClass = (data.classes || []).find(c => c.date === todayStr);

    if (todayClass?.link) {
      window.open(todayClass.link, "_blank");
    }
  } catch (err) {
    console.error("Erro ao abrir links:", err);
  }
}

// Liga botões
document.getElementById("card-voice").addEventListener("click", startVoiceAssistant);
document.getElementById("voice-start").addEventListener("click", startVoiceAssistant);
