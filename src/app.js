if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const expressLayouts = require('express-ejs-layouts');
const express = require('express');
const app = express();

const indexRouter = require('./routes/index');
const dealsRouter = require('./routes/deals');
const ordersRouter = require('./routes/orders');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/deals', dealsRouter);
app.use('/orders', ordersRouter);

module.exports = app;
