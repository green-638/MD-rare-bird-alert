document.getElementById('manageAlertsTable').style.visibility = 'hidden';

const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
});

async function searchAlerts() {
    // validate email input
    const email = document.getElementById('searchEmail').value;
    const validate = validateInput(email);
    if (validate) {
        return false;
    }
    else {
        // reset table
        const table = document.getElementById('manageAlertsTable');
        if (table.hasChildNodes() == true) {
            while (table.firstChild) {
                table.removeChild(table.firstChild);
            }
        }

        await fetch('/alert', {
            headers: {
                email: document.getElementById('searchEmail').value,
            },
        })
        .then((response) => response.json())
        .then((responseJson) => {
            responseJson.forEach((alert) => {
                const row = document.createElement('tr');

                const email = document.createElement('td');
                email.innerHTML = alert['email'];

                const location = document.createElement('td');
                const link = document.createElement('a');
                if (alert['location_type'] == 'county') {
                    link.href = `https://ebird.org/region/${alert['location_id']}`;
                }
                else {
                    link.href = `https://ebird.org/hotspot/${alert['location_id']}`;
                }
                link.innerHTML = `${alert['location_id']}`;
                location.appendChild(link);


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
}