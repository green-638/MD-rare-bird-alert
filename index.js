const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const validator = require("email-validator");
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// initialize supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// initialize headers for eBird API
let myHeaders = new Headers();
let requestOptions = {};
requestOptions.method = 'GET';
requestOptions.redirect = 'follow';
myHeaders.append("X-eBirdApiToken", process.env.EBIRD_KEY);
requestOptions.headers = myHeaders;

// get recent rare bird reports by location and time period
function getReports(locId, days) {
    return fetch(`https://api.ebird.org/v2/data/obs/${locId}/recent/notable?detail=full&back=${days}`,
        requestOptions)
    .then((response) => response.json());
}

// get a location ID's name
function getLocName(locId) {
    return fetch(`https://api.ebird.org/v2/ref/region/info/${locId}`,
        requestOptions)
    .then((response) => response.json());
}

// get alerts from DB, send emails- called by cron
app.get('/api/task', async (req, res) => {
    // get all alerts
    const {data, error} = await supabase.from('alerts')
    .select();

    if (error) {
        console.log(`Error ${error}`);
        res.statusCode = 500;
        res.send('task failed');
    }
    // for each alert
    for (row in data) {
        // get current date
        const date = new Date();
        // get alert date
        const alertDate = new Date(data[row]['alert_date']);
        // continue if alert's date matches today's date
        if (date.getMonth() == alertDate.getMonth() &
        date.getDate() == alertDate.getDate() &
        date.getFullYear() == alertDate.getFullYear()) {

            // set next alert date
            alertDate.setDate(alertDate.getDate() + Number(data[row]['interval']));
            // push date change to DB
            const { error } = await supabase
            .from('alerts')
            .update({ alert_date: `${alertDate}` })
            .eq('id', data[row]['id']);

            // get reports from alert location during interval
            const reports = await getReports(data[row]['location_id'], data[row]['interval']);
            if (Object.keys(reports).length == 0) {
                continue;
            }

            // email
            // configure email transporter
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "rarebirdnotifier@gmail.com",
                    pass: process.env.GOOGLE_APP_PASSWORD
                }
            });
            // build table to hold eBird data
            let itemsArray = `<tr style="font-weight: bold;">
            <td>Location<td>
            <td>Species<td>
            <td>Quantity<td>
            <td>Date<td>
            <td>Checklist<td>
            <tr>`;
            // build new rows
            const reportHistory = [];
            reports.forEach(row => {
                // skip duplicate reports from same checklist- happens when pics uploaded
                for (reportItem in reportHistory) {
                    if (row['subId'] == reportHistory[reportItem][0] &
                        row['comName'] == reportHistory[reportItem][1]) {
                        return;
                    }
                }

                let items = '';
                items += '<td>' + row['locName'] + '<td>';
                items += '<td>' + row['comName'] + '<td>';
                if (row['howMany'] == 'undefined') {
                    items += '<td>' + 'X' + '<td>';
                }
                else {
                    items += '<td>' + row['howMany'] + '<td>';
                }
                items += '<td>' + row['obsDt'] + '<td>';
                items += '<td>' + `https://ebird.org/checklist/${row['subId']}` + '<td>';
                
                itemsArray += '<tr>' + items + '<tr>';

                reportHistory.push([row['subId'], row['comName']]);
            });
            // get alert location name
            let alertLoc = await getLocName(data[row]['location_id']);
            alertLoc = alertLoc['result'];
            // get current date
            const today = new Date();
            today.setDate(today.getDate() - 1);
            const date = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
     
            // configure email info
            const options = {
                from: '"Rare Bird Alert" <rarebirdnotifiergmail.com>',
                to: `${data[row]['email']}`,
                subject: `${alertLoc} ${date} Rare Bird Alert`,
                html: `<table>${itemsArray}</table>`
            }
            // send email
            await new Promise((resolve, reject) => {
                transporter.sendMail(options, function(error, data) {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                    else {
                        console.log('Message sent: ', data.response);
                        resolve(data);
                    }
                });
            });
        }
    }
    res.send('Task completed');
});

// get alerts from DB using email
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

// delete alerts from DB
app.delete('/alert', async (req, res) => {
    const {data, error} = await supabase
    .from('alerts')
    .delete()
    .eq('id', `${req.body.id}`);

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

// post alerts to DB
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
});

// routing
app.get('/', (req, res) => {
    res.sendFile('public/home.html', {root: __dirname});
});

app.get('/rareBirdAlert', (req, res) => {
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