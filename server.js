var express = require('express');
var ethos = require('./routes/ethos_table');

var app = express();

//app.configure(function(){
    //app.use(express.logger('dev'));
    //app.use(express.bodyParser());
    app.use(function(req, res, next) {
        if (req.headers.origin) {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
            res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
            if (req.method === 'OPTIONS') return res.send(200)
        }
        next();
    });
//});

app.get('/update', ethos.update);

app.listen(5001);
console.log('listening to port 5001');