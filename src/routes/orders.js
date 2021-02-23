const axios = require('axios');
const router = require('express').Router();
const Deal = require('../models/deal');

router.post('/new/:id', async (req, res) => {
    try {
        console.log('order/new/id');
        console.log(req.body.number);
        console.log(req.body.buyOrderCode);
        console.log('total: R$' + req.body.totalAmount);

        console.log(req.body.supplierId);
        console.log(req.body.supplierName);
        console.log(req.body.cpfcnpj);

        if (req.body.itensQuantity > 1) {
            console.log('itens > 1');
            for (let i = 0; i < req.body.itensQuantity; i++) {
                console.log(req.body.itemName[i]);
                console.log('qty: ' + req.body.itemQuantity[i]);
                console.log('un.: $' + req.body.itemPrice[i]);
            }
        } else {
            console.log('itens = 1');
            console.log(req.body.itemName);
            console.log('qty: ' + req.body.itemQuantity);
            console.log('un.: $' + req.body.itemPrice);
        }

        const responseBling = await axios({
            url: `/contato/${req.body.cpfcnpj}/json`,
            method: 'get',
            baseURL: 'https://bling.com.br/Api/v2/',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                apikey: `${process.env.blingToken}`,
            },
        });

        let supplier;
        try {
            supplier = responseBling.data.retorno.contatos[0].contato;
        } catch (error) {
            console.log('Supplier not found');
            res.redirect('/deals/won');
            return;
        }

        let itens = '';
        if (req.body.itensQuantity > 1) {
            for (let i = 0; i < req.body.itensQuantity; i++) {
                itens += `<item>\
                            <descricao>${req.body.itemName[i]}</descricao>\
                            <qtde>${req.body.itemQuantity[i]}</qtde>\
                            <valor>${req.body.itemPrice[i]}</valor>\
                          </item>`;
            }
        } else {
            itens = `<item>\
                        <descricao>${req.body.itemName}</descricao>\
                        <qtde>${req.body.itemQuantity}</qtde>\
                        <valor>${req.body.itemPrice}</valor>\
                      </item>`;
        }

        let pedidoxml = `\
                <?xml version="1.0" encoding="utf-8" ?>\
                <pedidocompra>\
                    <numeropedido>${req.body.number}</numeropedido>\
                    <ordemcompra>${req.body.buyOrderCode}</ordemcompra>\
                    <fornecedor>\
                        <id>${supplier.id}</id>\
                        <nome>${req.body.supplierName}</nome>\
                    </fornecedor>\
                <itens>\
                    ${itens}\
                </itens>\
                <parcelas>\
                    <parcela>\
                        <nrodias>30</nrodias>\
                        <valor>${req.body.totalAmount}</valor>\
                    </parcela>\
                </parcelas>\
                </pedidocompra>`;

        const response = await axios({
            url: '/pedidocompra/json',
            method: 'post',
            baseURL: 'https://bling.com.br/Api/v2/',
            headers: {
                'Content-Type': 'text/xml',
            },
            params: {
                apikey: `${process.env.blingToken}`,
                xml: pedidoxml,
            },
        });
        if (response.data.retorno.erros != null) {
            console.log(response.data.retorno.erros);
        }

        console.log('update buy order status');
        const resUpdateStatus = await axios({
            url: `/deals/${req.body.number}`,
            method: 'put',
            baseURL: `https://${process.env.pipedriveCompanyName}.pipedrive.com/api/v1/`,
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                api_token: `${process.env.pipedriveToken}`,
            },
            data: {
                c01ceb30fe5d9f972b6c684121d5ecae5b4fa049: '13',
            },
        });
        console.log(resUpdateStatus.data);

        console.log('deleting after make order');
        await Deal.deleteOne({ number: `${req.body.number}` }, function (err) {
            if (err) return err;
        });
        res.redirect('/deals/won');
    } catch (err) {
        console.log(err);
        res.redirect('/deals/won');
    }
});

module.exports = router;
