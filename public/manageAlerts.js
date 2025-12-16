document.getElementById('manageAlertsTable').style.visibility = 'hidden';

const search = document.getElementById('searchAlertsSection');
document.addEventListener('DOMContentLoaded', (event) => {
    anime({
        targets: search,
        opacity: [0, 1],
        duration: 800, 
        easing: 'easeInOutQuad', 
        delay: 100,
    });
});

// prevent form submission from refreshing page
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
});

let tableAnimate;
// get alerts by email, display them by table
async function searchAlerts() {
    // reset table
    const table = document.getElementById('tableBody');
    if (table.hasChildNodes() == true) {
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }
        document.getElementById('manageAlertsTable').style.visibility = 'hidden';
    }

    // reset table animation
    if (tableAnimate != undefined) {
        tableAnimate.restart();
    }

    // get alerts
    await fetch('/alert', {
        headers: {
            email: document.getElementById('searchEmail').value,
        },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        // validate email
        if (responseJson['validate'] == 'fail') {
            alert('Email has invalid format or does not exist');
            return;
        };

        if (responseJson.length == 0) {
            alert('No results');
            return;
        }
        // add rows to table for each alert
        responseJson.forEach((alert) => {
            const row = document.createElement('tr');

            // email
            const email = document.createElement('td');
            email.innerHTML = alert['email'];

            // location ID w/ link
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

            // interval
            const interval = document.createElement('td');
            interval.innerHTML = alert['interval'];

            // delete button
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
        tableAnimate = anime({
            targets: document.getElementById('manageAlertsTable'),
            opacity: [0, 1],
            duration: 600, 
            easing: 'easeInOutQuad', 
            translateY: '-80px'
        });
    });
}

// listen for delete button click, delete row using its respective button
document.addEventListener('click', function(click) {
    if (click.target.className == 'deleteButton') {
        let deleteButtons = document.getElementsByClassName('deleteButton');
        let buttonId;
        for (let row in deleteButtons) {
            if (deleteButtons[row].contains(click.target) == true) {
                buttonId = deleteButtons[row].id;
                break;
            }
        }
        deleteRow(Number(buttonId));
        alert('Deletion successful');
    }
});

// delete row using button ID 
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