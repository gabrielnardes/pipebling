const axios = require('axios');
const router = require('express').Router();
// const Deal = require('../models/deal');

router.post('/new/:id', async (req, res) => {
    try {
        console.log('order/new/id');
        console.log(req.body.number);
        console.log(req.body.buyOrderCode);
        console.log('total: R$' + req.body.totalAmount);

        console.log(req.body.supplierId);
        console.log(req.body.supplierName);

        if (req.body.itensQuantity > 1) {
            for (let i = 0; i < req.body.itensQuantity; i++) {
                console.log(req.body.itemName[i]);
                console.log('qty: ' + req.body.itemQuantity[i]);
                console.log('un.: $' + req.body.itemPrice[i]);
            }
        } else {
            console.log(req.body.itemName);
            console.log('qty: ' + req.body.itemQuantity);
            console.log('un.: $' + req.body.itemPrice);
        }

        const cpf = '990.355.758-22';

        const responseBling = await axios({
            url: `/contato/${cpf}/json`,
            method: 'get',
            baseURL: 'https://bling.com.br/Api/v2/',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                apikey: `${process.env.blingToken}`,
            },
        });
        let supplier = responseBling.data.retorno.contatos[0].contato;

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
        // console.log(itens);

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
        console.log(pedidoxml);

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
        console.log(response.data.retorno.erros);
        res.redirect('/deals/won');
    } catch (err) {
        console.log(err);
        res.redirect('/deals/won');
    }
});

router.get('/', async (req, res) => {
    try {
        const response = await axios({
            url: '/pedidoscompra/json',
            method: 'get',
            baseURL: 'https://bling.com.br/Api/v2/',
            headers: {
                'Content-Type': 'application/json',
            },
            params: {
                apikey: `${process.env.blingToken}`,
            },
        });
        let blingData = response.data.retorno.pedidoscompra;
        let orders = [];
        for (let i = 0; i < blingData[0].length; i++) {
            orders[i] = {
                numeropedido: blingData[0][i].pedidocompra.numeropedido,
                ordemcompra: blingData[0][i].pedidocompra.ordemcompra,
                fornecedorId: blingData[0][i].pedidocompra.fornecedor.id,
                fornecedorNome: blingData[0][i].pedidocompra.fornecedor.nome,
            };
        }
        res.render('orders', { orders: orders });
    } catch (err) {
        console.log(err);
    }
});

router.post('/test', async (req, res) => {
    try {
        console.log('new');
        const msg = req.body.msg;
        console.log(msg);
        res.redirect('/deals/won');
    } catch (err) {
        console.log(err);
    }
});

router.post('/', async (req, res) => {
    console.log('Post /');
    let pedidoxml =
        '\
                <?xml version="1.0" encoding="utf-8" ?>\
                <pedidocompra>\
                    <numeropedido>12</numeropedido>\
                    <ordemcompra>777777</ordemcompra>\
                    <fornecedor>\
                        <id>11367046329</id>\
                        <nome>Maria</nome>\
                    </fornecedor>\
                <itens>\
                    <item>\
                        <descricao>Produto 2</descricao>\
                        <qtde>10</qtde>\
                        <valor>12.50</valor>\
                    </item>\
                </itens>\
                <parcelas>\
                    <parcela>\
                        <nrodias>30</nrodias>\
                        <valor>125.00</valor>\
                    </parcela>\
                </parcelas>\
                </pedidocompra>';

    try {
        await axios({
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
        res.redirect('/orders');
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
