const app = require('./app');

app.listen(process.env.PORT || 3000, function () {
    console.log(
        'Server listening on port %d in %s mode',
        this.address().port,
        app.settings.env
    );
});
