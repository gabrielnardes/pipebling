const express = require('express');
const app = express();

const indexRouter = require('./routes/index');
const dealsRouter = require('./routes/deals');
const ordersRouter = require('./routes/orders');

// app.use(express.urlencoded({ limit: '10mb', extended: false }));

app.use('/', indexRouter);
app.use('/deals', dealsRouter);
app.use('/orders', ordersRouter);

module.exports = app;
