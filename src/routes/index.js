const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('index', { body: 'Index page' });
});

module.exports = router;
