function updateHourDate() {
    const hour = document.getElementById('hour');
    const date = document.getElementById('date');

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const minutesFormat = minutes < 10 ? '0' + minutes : minutes;
    const secondsFormat = seconds < 10 ? '0'+ seconds : seconds;

    const hourFormat = `${hours}:${minutesFormat}:${secondsFormat} ${ampm}`;
    hour.textContent = hourFormat;

    const dateFormat = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    date.textContent = dateFormat;
}

setInterval(updateHourDate, 1000);
updateHourDate();