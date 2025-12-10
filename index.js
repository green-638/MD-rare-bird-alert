const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const validator = require("email-validator");

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// initialize supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

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
    .select('id, email, location_id, interval')
    .eq('email', `${req.headers.email}`);

    if (error) {
        console.log(`Error ${error}`);
        res.statusCode = 500;
        res.send(error);
        return;
    } else {
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
    } else {
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
    } else {
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