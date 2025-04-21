const ICONOS = {
    advertencia: "⚠️",
    error: "❌",
    exito: "✅",
    success: "✅",
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

function showConfirmToast(message, onConfirm, icono = ICONOS.pregunta) {
    const toast = document.getElementById('simple-toast');
    toast.innerHTML = `
        ${icono} ${message}
        <div style="margin-top: 8px;">
            <button id="toast-confirm-ok">Aceptar</button>
            <button id="toast-confirm-cancel">Cancelar</button>
        </div>
    `;
    toast.classList.add('show-toast');

    const limpiar = () => {
        toast.classList.remove('show-toast');
        toast.innerHTML = '';
    };

    const aceptar = () => {
        limpiar();
        onConfirm(true);
    };

    const cancelar = () => {
        limpiar();
        onConfirm(false);
    };

    setTimeout(() => {
        cancelar();
    }, 20000);

    setTimeout(() => {
        document.getElementById('toast-confirm-ok')?.addEventListener('click', aceptar);
        document.getElementById('toast-confirm-cancel')?.addEventListener('click', cancelar);
    }, 100);
}

module.exports = { showToast, showConfirmToast, ICONOS }