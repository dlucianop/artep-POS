const btnCollapse = document.getElementById('btnCollapse');
const form = document.getElementById('form-info-client');
const clientcollapse = document.getElementById('client-collapse');

btnCollapse.addEventListener('click', () => {
  if (form.classList.contains('visible')) {
    btnCollapse.style.transition = 'transform 0.4s ease';
    btnCollapse.style.transform = 'rotate(0deg)';

    form.classList.remove('visible');
    clientcollapse.style.marginBottom = '0';
    form.style.display = 'none';
  } else {
    btnCollapse.style.transition = 'transform 0.4s ease';
    btnCollapse.style.transform = 'rotate(180deg)';

    form.style.display = 'grid';
    clientcollapse.style.marginBottom = '10px';
    setTimeout(() => form.classList.add('visible'), 10);
  }
});
