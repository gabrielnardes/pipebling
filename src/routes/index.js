const router = require('express').Router();

router.get('/', (req, res) => {
    console.log('\nHOME: cpfcnpj custom field key');
    console.log(process.env.cpfcnpj);

    console.log('\nHOME: buyOrderStatus custom field key');
    console.log(process.env.buyOrderStatus);
    res.render('index');
});

module.exports = router;
