/**EVITAR QUE LA VENTA SEA CHICA */

window.addEventListener('resize', function() {
    if (window.innerWidth < 1280 || window.innerHeight < 720) {
        window.resizeTo(1280, 720);
    }
});