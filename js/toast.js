const ICONOS = {
    advertencia: "⚠️",
    error: "❌",
    exito: "✅",
    info: "ℹ️",
    prohibido: "⛔",
    reloj: "⏳",
    check: "✔️",
    carga: "🔄",
    pregunta: "❓",
    corazon: "❤️",
    estrella: "⭐",
    triste: "😞",
    feliz: "😊"
};

function showToast(message, icono = ICONOS.info) {
    const toast = document.getElementById('simple-toast');
    toast.innerHTML = `${icono} ${message}`;
    toast.classList.add('show-toast');
  
    setTimeout(() => {
        toast.classList.remove('show-toast');
    }, 2000);
}

module.exports = { showToast, ICONOS }