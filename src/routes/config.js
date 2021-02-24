const axios = require('axios');
const router = require('express').Router();

router.get('/', async (req, res) => {
    res.render('config');
});

router.post('/', async (req, res) => {
    try {
        console.log('configuring');

        if (
            req.body.blingToken != '' &&
            req.body.pipedriveToken != '' &&
            req.body.pipedriveCompanyName != '' &&
            req.body.pipedriveCompanyName != null &&
            req.body.pipedriveToken != null &&
            req.body.blingToken != null
        ) {
            process.env['pipedriveCompanyName'] = req.body.pipedriveCompanyName;
            process.env['pipedriveToken'] = req.body.pipedriveToken;
            process.env['blingToken'] = req.body.blingToken;

            const responseOrg = await axios({
                url: '/organizationFields',
                method: 'get',
                baseURL: `https://${process.env.pipedriveCompanyName}.pipedrive.com/api/v1/`,
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    api_token: `${process.env.pipedriveToken}`,
                },
            });

            responseOrg.data.data.forEach((el) => {
                if (el.name == 'cpfcnpj') {
                    process.env['cpfcnpj'] = el.key;
                }
            });

            const responseDeal = await axios({
                url: '/dealFields',
                method: 'get',
                baseURL: `https://${process.env.pipedriveCompanyName}.pipedrive.com/api/v1/`,
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    api_token: `${process.env.pipedriveToken}`,
                },
            });

            responseDeal.data.data.forEach((el) => {
                if (el.name == 'Buy order made') {
                    process.env['buyOrderStatus'] = el.key;
                }
            });

            if (
                process.env.pipedriveCompanyName == null ||
                process.env.pipedriveCompanyName == '' ||
                process.env.pipedriveToken == null ||
                process.env.pipedriveToken == '' ||
                process.env.blingToken == null ||
                process.env.blingToken == '' ||
                process.env.cpfcnpj == null ||
                process.env.cpfcnpj == '' ||
                process.env.buyOrderStatus == null ||
                process.env.buyOrderStatus == ''
            ) {
                console.log('Config is null');
                res.redirect('/deals');
                return;
            }

            console.log(
                'pipedriveCompanyName: ' + process.env['pipedriveCompanyName']
            );
            console.log('pipedriveToken: ' + process.env['pipedriveToken']);
            console.log('blingToken: ' + process.env['blingToken']);
            console.log('buyOrderStatus: ' + process.env['buyOrderStatus']);
            console.log('cpfcnpj: ' + process.env['cpfcnpj']);
            console.log('configuring done');
        } else {
            console.log('Config is null');
        }
    } catch (err) {
        console.log(err);
    }
    res.redirect('/config');
});

module.exports = router;
