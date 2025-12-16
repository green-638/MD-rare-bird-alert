const welcomeMsg = document.getElementById('welcomeMsg');

document.addEventListener('DOMContentLoaded', (event) => {
    anime({
        targets: welcomeMsg,
        opacity: [0, 1],
        duration: 1500, 
        easing: 'easeInOutQuad', 
        delay: 200,
        translateY: '-200px'
    });
});