const ICONOS = {
    advertencia: "⚠️",
    error: "❌",
    exito: "✅",
    success: "✅",
    info: "ℹ️",
    peligro: "⛔",
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
    let timeoutId;
    
    toast.innerHTML = `
        <div class="toast-content">
            ${icono} ${message}
            <div class="toast-buttons">
                <button id="toast-confirm-ok">Aceptar</button>
                <button id="toast-confirm-cancel">Cancelar</button>
            </div>
        </div>
    `;
    toast.classList.add('show-toast');

    const limpiar = () => {
        toast.classList.remove('show-toast');
        toast.innerHTML = '';
        clearTimeout(timeoutId);
        document.getElementById('toast-confirm-ok')?.removeEventListener('click', aceptar);
        document.getElementById('toast-confirm-cancel')?.removeEventListener('click', cancelar);
    };

    const aceptar = () => {
        limpiar();
        onConfirm(true);
    };

    const cancelar = () => {
        limpiar();
        onConfirm(false);
    };

    timeoutId = setTimeout(cancelar, 15000);

    document.getElementById('toast-confirm-ok').addEventListener('click', aceptar);
    document.getElementById('toast-confirm-cancel').addEventListener('click', cancelar);
}

module.exports = { showToast, showConfirmToast, ICONOS }