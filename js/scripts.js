
const hamburger = document.getElementById('hamburger');
const menu = document.querySelector('.menu');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    menu.classList.toggle('open');
});
