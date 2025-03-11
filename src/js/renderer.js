$(document).ready(function() {
    $("#agregarProducto").button();
    $("#cargarProductos").button();

    $("#agregarProducto").click(() => {
        window.api.agregarProducto('Producto UI', 75, 10)
            .then(() => alert('Producto agregado con jQuery UI'));
    });

    $("#cargarProductos").click(() => {
        window.api.getProductos().then((productos) => {
            $("#listaProductos").empty();
            productos.forEach(p => {
                $("#listaProductos").append(`<li>${p.nombre} - $${p.precio} - Stock: ${p.stock}</li>`);
            });
        });
    });
});
