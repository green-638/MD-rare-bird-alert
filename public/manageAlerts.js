document.getElementById('manageAlertsTable').style.visibility = 'hidden';

function searchAlerts() {
    // validate email input
    const email = document.getElementById('email').value;
    const validate = validateInput(email);
    if (validate) {
        return false;
    }
    loadAlertRequests();
    return false;
}

async function loadAlertRequests() {
    await fetch('/alerts')
    .then((response) => response.json())
    .then((responseJson) => {
        const table = document.getElementById('manageAlertsTable');
        responseJson.forEach((alert) => {
            const row = document.createElement('tr');

            const email = document.createElement('td');
            email.innerHTML = alert['email'];

            const location = document.createElement('td');
            location.innerHTML = alert['location'];

            const interval = document.createElement('td');
            interval.innerHTML = alert['interval'];

            row.appendChild(email);
            row.appendChild(location);
            row.appendChild(interval);

            table.appendChild(row);

        })
        table.style.visibility = 'visible';
    });
}