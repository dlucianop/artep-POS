const closeButton = document.getElementById("close-modal");
const modal = document.getElementById("modal");
const form = document.getElementById("formProduct");

let isFormDirty = false;

form.addEventListener("input", () => {
    isFormDirty = true;
});

function modalAdd() {
    modal.style.display = "block";
    isFormDirty = false;
}

closeButton.addEventListener("click", () => {
    if (isFormDirty) {
        const confirmClose = confirm("¿Estás seguro de que quieres salir sin guardar los cambios?");
        if (!confirmClose) {
            return;
        }
    }
    modal.style.display = "none";
    form.reset();
    isFormDirty = false;
});
