const axios = require('axios');
const router = require('express').Router();
const Deal = require('../models/deal');

router.get('/won', async (req, res) => {
    try {
        const dealsDatabase = await Deal.find();
        res.render('deals/won', { deals: dealsDatabase });
    } catch (err) {
        res.redirect('/');
        console.log(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        console.log('delete');
        console.log(req.params.id);

        await Deal.deleteOne({ number: `${req.params.id}` }, function (err) {
            if (err) return err;
            // deleted at most one tank document
        });
        const dealsDatabase = await Deal.find();
        res.render('deals/won', { deals: dealsDatabase });
    } catch (err) {
        res.redirect('/');
        console.log(err);
    }
});

router.get('/import', async (req, res) => {
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

        let dealsPipedrive = [];
        let dealsPipedriveId = [];
        for (let i = 0; i < response.data.data.length; i++) {
            dealsPipedrive[i] = response.data.data[i];
            dealsPipedriveId[i] = response.data.data[i].id;
        }

        const dealsDatabase = await Deal.find();
        let dealsDatabaseId = [];
        for (let i = 0; i < dealsDatabase.length; i++) {
            dealsDatabaseId[i] = dealsDatabase[i].number;
        }

        for (let i = 0; i < dealsPipedriveId.length; i++) {
            if (!dealsDatabaseId.includes(dealsPipedrive[i].id)) {
                const response = await axios({
                    url: `/deals/${dealsPipedrive[i].id}/products`,
                    method: 'get',
                    baseURL: `https://${process.env.pipedriveCompanyName}.pipedrive.com/api/v1/`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        api_token: `${process.env.pipedriveToken}`,
                    },
                });

                let itens = [];
                for (let i = 0; i < response.data.data.length; i++) {
                    itens[i] = {
                        name: response.data.data[i].name,
                        price: response.data.data[i].item_price,
                        quantity: response.data.data[i].quantity,
                    };
                }

                console.log('Saving');
                const newDeal = new Deal({
                    number: dealsPipedrive[i].id,
                    buyOrderCode: 'b' + dealsPipedrive[i].id,
                    totalAmount: dealsPipedrive[i].value,
                    supplier: {
                        id: dealsPipedrive[i].org_id.value,
                        name: dealsPipedrive[i].org_id.name,
                    },
                    itens: itens,
                });
                await newDeal.save();
            }
        }
        res.redirect('/deals/won');
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
