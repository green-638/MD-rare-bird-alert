const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const validator = require("email-validator");
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// initialize supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// configure emailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rarebirdnotifier@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// get all rows
async function getRows() {
    const {data, error} = await supabase.from('alerts')
    .select()

    if (error) {
        console.log(`Error ${error}`);
        res.statusCode = 500;
    }
    else {
        return data;
    }
}

async function updateDate(id, alertDate) {
    const { error } = await supabase
    .from('alerts')
    .update({ alert_date: `${alertDate}` })
    .eq('id', id);
}

// find alerts to be sent
// 0 0 0 * * * for midnight
cron.schedule('0 53 9 * * *', () => {
    // initialize tasks array, wipes tasks from previous day
    const tasks = [];
    getRows()
    .then((response) => {
        allRows = response;
        // iterate through rows
        for (let row in allRows) {
            // get current date
            const date = new Date();
            // get alert date
            const alertDate = new Date(allRows[row]['alert_date']);
            // add row to matches array if alert date is today
            
            if (date.getMonth() == alertDate.getMonth() &
            date.getDate() == alertDate.getDate() &
            date.getFullYear() == alertDate.getFullYear()) {
                const hours = alertDate.getHours();
                const minutes = alertDate.getMinutes();
                const seconds = alertDate.getSeconds();
       
                // add task to tasks array
                tasks.push(cron.schedule(`${seconds} ${minutes} ${hours} * * *`, () => {
                    sendEmail(allRows[row]['email'], allRows[row]['location_id'], allRows[row]['interval']);
                }));
                // set next alert date
                alertDate.setDate(alertDate.getDate() + Number(allRows[row]['interval']));
                // push change to DB
                updateDate(allRows[row]['id'], alertDate);
            }
        }
    })
});

let myHeaders = new Headers();
let requestOptions = {};
requestOptions.method = 'GET';
requestOptions.redirect = 'follow';
myHeaders.append("X-eBirdApiToken", process.env.EBIRD_KEY);
requestOptions.headers = myHeaders;

function getBirds(locId, days) {
    return fetch(`https://api.ebird.org/v2/data/obs/${locId}/recent/notable?detail=full&back=${days}`,
        requestOptions)
    .then((response) => response.json());
}

function getLocName(locId) {
    return fetch(`https://api.ebird.org/v2/ref/region/info/${locId}`,
        requestOptions)
    .then((response) => response.json());
}

// send email
async function sendEmail(email, locId, days) {
    const data = await getBirds(locId, days);

    if (data.length == 0) {
        return;
    }

    // array of td's
    let itemsArray = `<tr style="font-weight: bold;">
    <td>Location<td>
    <td>Species<td>
    <td>Quantity<td>
    <td>Date<td>
    <td>Checklist<td>
    <tr>`;
    data.forEach(row => {
        let items = '';
        items += '<td>' + row['locName'] + '<td>';
        items += '<td>' + row['comName'] + '<td>';
        items += '<td>' + row['howMany'] + '<td>';
        items += '<td>' + row['obsDt'] + '<td>';
        items += '<td>' + `https://ebird.org/checklist/${row['subId']}` + '<td>';
        
        itemsArray += '<tr>' + items + '<tr>';
    });

    // get alert location name
    let alertLoc = await getLocName(locId);
    alertLoc = alertLoc['result'];
    // get current date
    const today = new Date();
    const date = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    
    (async () => {
    const info = await transporter.sendMail({
        from: '"Rare Bird Alert" <rarebirdnotifiergmail.com>',
        to: `${email}`,
        subject: `${alertLoc} ${date} Rare Bird Alert`,
        html: `<table>${itemsArray}</table>`,
    });
    console.log("Message sent:", info.messageId);
    })()
};


// get alerts
app.get('/alert', async (req, res) => {
    // validate email- used by createAlert() and searchAlerts()
    const validate = validator.validate(req.headers.email);
    if (validate == false) {
        console.log('Failed email validation');
        res.send({validate: 'fail'});
        return;
    }

    const {data, error} = await supabase.from('alerts')
    .select('id, email, location_id, interval, alert_date')
    .eq('email', `${req.headers.email}`);

    if (error) {
        console.log(`Error ${error}`);
        res.statusCode = 500;
        res.send(error);
        return;
    }
    else {
        res.send(data);
    }
});

// delete alerts
app.delete('/alert', async (req, res) => {
    const {data, error} = await supabase
    .from('alerts')
    .delete()
    .eq('id', `${req.body.id}`)

    if (error) {
        console.log(`Error ${error}`);
        res.statusCode = 500;
        res.send(error);
        return;
    }
    else {
        res.send(data);
    }
});

// post alerts
app.post('/alert', async (req, res) => {
    console.log('Add alert request');
    console.log('Request:', req.body);

    const email = req.body.email;
    const locId = req.body.locId;
    const locType = req.body.locType;
    const interval = req.body.interval;
    const date = req.body.date;
    
    const {data, error} = await supabase.from('alerts').insert({
        email: email,
        location_id: locId,
        location_type: locType,
        interval: interval,
        alert_date: date,
    })
    .select();

    if (error) {
        console.log(`Error ${error}`);
        res.statusCode = 500;
        res.send(error);
        return;
    }
    else {
        res.send(data);
    }
    res.send(req.body);
});

// get rare bird alert page
app.get('/', (req, res) => {
    res.sendFile('public/rareBirdAlert.html', {root: __dirname});
});

app.get('/manageAlerts', (req, res) => {
    res.sendFile('public/manageAlerts.html', {root: __dirname});
});

app.get('/help', (req, res) => {
    res.sendFile('public/help.html', {root: __dirname});
});

app.get('/aboutProject', (req, res) => {
    res.sendFile('public/aboutProject.html', {root: __dirname});
});


app.listen(port, () => {
    console.log('listening on', port);
});