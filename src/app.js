if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const express = require('express');
const app = express();

const indexRouter = require('./routes/index');
const dealsRouter = require('./routes/deals');
const ordersRouter = require('./routes/orders');
const configRouter = require('./routes/config');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

app.use('/', indexRouter);
app.use('/deals', dealsRouter);
app.use('/orders', ordersRouter);
app.use('/config', configRouter);

module.exports = app;
