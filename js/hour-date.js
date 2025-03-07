function updateHour() {
    const hour = document.getElementById('sale-hour');
    if (!hour) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const minutesFormat = minutes.toString().padStart(2, '0');
    const secondsFormat = seconds.toString().padStart(2, '0');

    hour.value = `${hours}:${minutesFormat}:${secondsFormat} ${ampm}`;
}

function updateDate() {
    const date = document.getElementById('sale-date');
    if (!date) return;

    const now = new Date();
    const dateFormat = now.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    date.value = dateFormat;

    const nowTime = now.getTime();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - nowTime;

    setTimeout(() => {
        updateDate();
        setInterval(updateDate, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
}

updateHour();
updateDate();

setInterval(updateHour, 1000);

