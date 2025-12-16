const welcomeMsg = document.getElementById('welcomeMsg');

window.onload = function() {
    anime({
        targets: welcomeMsg,
        opacity: [0, 1],
        duration: 1500, 
        easing: 'easeInOutQuad', 
        delay: 200,
        translateY: '-200px'
    });
};