const axios = require('axios');
const router = require('express').Router();
const Deal = require('../models/deal');

router.get('/', async (req, res) => {
    try {
        const dealsDatabase = await Deal.find();
        res.render('deals', { deals: dealsDatabase });
    } catch (err) {
        res.redirect('/');
        console.log(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        console.log(`Deleting ${req.params.id}`);

        await Deal.deleteOne({ number: `${req.params.id}` }, function (err) {
            if (err) return err;
        });
        res.redirect('/deals');
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

        if (response.data.data == null) {
            console.log('None won deal was found');
            res.redirect('/deals');
            return;
        }

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
            if (
                dealsPipedrive[i][process.env.buyOrderStatus] != null &&
                dealsPipedrive[i][process.env.buyOrderStatus] != ''
            ) {
                if (dealsPipedrive[i][process.env.buyOrderStatus] == 'True') {
                    console.log(
                        `\nDeal ${dealsPipedrive[i].id} was already ordered`
                    );
                } else {
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

                        const cpf = await getCpfCnpj(
                            dealsPipedrive[i].org_id.value
                        );

                        let itens = [];
                        for (let i = 0; i < response.data.data.length; i++) {
                            itens[i] = {
                                name: response.data.data[i].name,
                                price: response.data.data[i].item_price,
                                quantity: response.data.data[i].quantity,
                            };
                        }

                        console.log('Saving to database');
                        const newDeal = new Deal({
                            number: dealsPipedrive[i].id,
                            buyOrderCode: 'b' + dealsPipedrive[i].id,
                            totalAmount: dealsPipedrive[i].value,
                            supplier: {
                                id: dealsPipedrive[i].org_id.value,
                                name: dealsPipedrive[i].org_id.name,
                                cpfcnpj: cpf,
                            },
                            itens: itens,
                        });
                        await newDeal.save();
                    }
                }
            } else {
                console.log('\nDeal: ' + dealsPipedrive[i].id);
                console.log('buyOrderStatus is null');
            }
        }
    } catch (err) {
        console.log(err);
    }
    res.redirect('/deals');
});

async function getCpfCnpj(orgId) {
    const response = await axios({
        url: `/organizations/${orgId}`,
        method: 'get',
        baseURL: `https://${process.env.pipedriveCompanyName}.pipedrive.com/api/v1/`,
        headers: {
            'Content-Type': 'application/json',
        },
        params: {
            api_token: `${process.env.pipedriveToken}`,
        },
    });

    return response.data.data[process.env.cpfcnpj];
}

module.exports = router;
