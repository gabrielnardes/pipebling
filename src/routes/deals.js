const axios = require('axios');
const router = require('express').Router();

router.get('/', async (req, res) => {
    try {
        const response = await axios({
            url: '/deals',
            method: 'get',
            baseURL: `https://${process.env.pipedriveCompanyName}.pipedrive.com/api/v1/`,
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                api_token: `${process.env.pipedriveToken}`,
            },
        });

        res.render('deals', { deals: response.data.data });
    } catch (err) {
        res.redirect('/');
        console.log(err);
    }
});

router.get('/won', async (req, res) => {
    try {
        const response = await axios({
            url: '/deals',
            method: 'get',
            baseURL: `https://${process.env.pipedriveCompanyName}.pipedrive.com/api/v1/`,
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                status: 'won',
                api_token: `${process.env.pipedriveToken}`,
            },
        });

        res.render('deals/won', { deals: response.data.data });
    } catch (err) {
        res.redirect('/');
        console.log(err);
    }
});

module.exports = router;
