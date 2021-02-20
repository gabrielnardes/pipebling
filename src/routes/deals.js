const axios = require('axios');
const router = require('express').Router();

const company = 'gabrielenterprises';
const pipedriveToken = 'c3e5072d575ea486a01b59c094aac192726e5b2a';

router.get('/', async (req, res) => {
    let pipeData;

    await axios({
        url: '/deals',
        method: 'get',
        baseURL: `https://${company}.pipedrive.com/api/v1/`,
        headers: {
            'Content-Type': 'application/json',
        },
        params: {
            api_token: `${pipedriveToken}`,
        },
    })
        .then(function (pipedrive) {
            pipeData = pipedrive.data.data;
        })
        .catch(function (err) {
            console.log(err);
        });

    let output;
    for (let i = 0; i < pipeData.length; i++) {
        output += pipeData[i].title + '  ';
    }

    res.send(output);
});

router.get('/won', async (req, res) => {
    let pipeData;

    await axios({
        url: '/deals',
        method: 'get',
        baseURL: `https://${company}.pipedrive.com/api/v1`,
        headers: {
            'Content-Type': 'application/json',
        },
        params: {
            status: 'won',
            api_token: `${pipedriveToken}`,
        },
    })
        .then(function (pipedrive) {
            pipeData = pipedrive.data.data;
        })
        .catch(function (err) {
            console.log(err);
        });

    let output;
    for (let i = 0; i < pipeData.length; i++) {
        output += pipeData[i].title + '  ';
    }

    res.send(output);
});

module.exports = router;
