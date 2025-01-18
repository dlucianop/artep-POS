function showLoader(link, event) {
    event.preventDefault();

    const sections = document.querySelectorAll(".section");
    sections.forEach(section => {
        section.style.display = "none";
    });

    const loaderContainer = document.querySelector(".loader-container");
    if (loaderContainer) {
        loaderContainer.style.display = "flex";
    }

    link.style.pointerEvents = "none";
    link.style.opacity = "0.6";

    setTimeout(() => {
        window.location.href = link.href;
    }, 1000);
}
