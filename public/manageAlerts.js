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
        const table = document.getElementById('tableBody');
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
                link.target = '_blank';
                location.appendChild(link);

                const interval = document.createElement('td');
                interval.innerHTML = alert['interval'];

                const holdButton = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = 'X';
                deleteButton.id = alert['id'];
                deleteButton.className = 'deleteButton';
                holdButton.appendChild(deleteButton);

                row.appendChild(email);
                row.appendChild(location);
                row.appendChild(interval);
                row.appendChild(deleteButton);

                table.appendChild(row);
            })
            document.getElementById('manageAlertsTable').style.visibility = 'visible';
        });
    }
}

document.addEventListener('click', function(click) {
    if (click.target.className == 'deleteButton') {
        let deleteButtons = document.getElementsByClassName('deleteButton');
        let buttonId;
        for (row in deleteButtons) {
            if (deleteButtons[row].contains(click.target) == true) {
                buttonId = deleteButtons[row].id;
                break;
            }
        }
        deleteRow(Number(buttonId));
        alert('Deletion successful');
    }
});

async function deleteRow(buttonId) {
    await fetch('/alert', {
        method: 'DELETE',
        body: JSON.stringify({
            // button id equivalent to row id
            id: `${buttonId}`,
        }),
        headers: {
            'Content-type': 'application/json',
        },
    });
}