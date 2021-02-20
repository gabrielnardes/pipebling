const axios = require('axios');
const router = require('express').Router();
const fs = require('fs');
const parseString = require('xml2js').parseString;
const blingToken =
    'a612baa61c8bdb029998a818741c333b4f462fbbc3b780056e90cac14ca41fc8f8da5a57';

router.get('/', async (req, res) => {
    let output = [];

    await axios({
        url: '/pedidoscompra/json',
        method: 'get',
        baseURL: 'https://bling.com.br/Api/v2/',
        headers: {
            'Content-Type': 'application/json',
        },
        params: {
            apikey: `${blingToken}`,
        },
    })
        .then(function (res) {
            const blingData = res.data.retorno.pedidoscompra;
            for (let i = 0; i < blingData[0].length; i++) {
                output[i] = [
                    blingData[0][i].pedidocompra.numeropedido,
                    blingData[0][i].pedidocompra.ordemcompra,
                    blingData[0][i].pedidocompra.fornecedor.id,
                    blingData[0][i].pedidocompra.fornecedor.nome,
                ];
            }
        })
        .catch(function (err) {
            console.log(err);
        });
    res.send(output);
});

// temporary POST, until HTML isn't done
router.get('/new', async () => {
    let pedidoxml;

    fs.readFile('C:/dev/api/pipedrive/pedido1.xml', (err, data) => {
        if (err) throw err;
        parseString(data, function () {
            pedidoxml =
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

            axios({
                url: '/pedidocompra/json',
                method: 'post',
                baseURL: 'https://bling.com.br/Api/v2/',
                headers: {
                    'Content-Type': 'text/xml',
                },
                params: {
                    apikey: `${blingToken}`,
                    xml: pedidoxml,
                },
            })
                .then(function () {})
                .catch(function (err) {
                    console.log(err);
                });
        });
    });
});

module.exports = router;
