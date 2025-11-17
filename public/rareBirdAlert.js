function loadAlertRequests() {
    return fetch('http://localhost:3000/alerts')
    .then((response) => response.json());
}