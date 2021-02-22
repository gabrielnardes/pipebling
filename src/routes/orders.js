const axios = require('axios');
const router = require('express').Router();
const Deal = require('../models/deal');

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

router.post('/new/:id', async (req, res) => {
    const order = new Deal({
        id: req.body.id,
        title: req.body.title,
        personName: req.body.personName,
        orgName: req.body.orgName,
        status: req.body.status,
    });

    console.log('order/new/id');
    console.log(order.id);
    console.log(order.title);
    console.log(order.personName);
    console.log(order.orgName);
    console.log(order.status);
    res.redirect('/deals/won');

    // orderNumber: {
    // buyOrderCode: {
    // supplierId: {
    // supplierName:

    // renderNewPage(res, new Book());

    // try {
    //     const authors = await Author.find({});
    //     const params = {
    //         authors: authors,
    //         book: book,
    //     };
    //     if (hasError) params.errorMessage = `Error ${form.errorVerb} this book`;
    //     res.render(`books/new`, params);
    // } catch {
    //     res.redirect('/books');
    // }
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
