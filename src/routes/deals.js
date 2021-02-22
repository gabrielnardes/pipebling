const axios = require('axios');
const router = require('express').Router();
const Deal = require('../models/deal');

router.get('/won', async (req, res) => {
    try {
        const dealsDatabase = await Deal.find();

        console.log(dealsDatabase[0].itens[0].name);

        res.render('deals/won', { deals: dealsDatabase });
    } catch (err) {
        res.redirect('/');
        console.log(err);
    }
});

router.get('/import', async (req, res) => {
    console.log('import');
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
                // console.log(itens);

                console.log('Saving');
                // console.log(dealsPipedrive[i].id);
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
                // console.log(newDeal.itens);
                console.log(newDeal);
                // console.log(newDeal.itens.length);
                await newDeal.save();
            }
        }
        res.redirect('/deals/won');
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
