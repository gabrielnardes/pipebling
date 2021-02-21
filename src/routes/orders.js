const axios = require('axios');
const router = require('express').Router();

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

router.post('/', async (req, res) => {
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
