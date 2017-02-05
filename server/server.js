var express = require('express')
var app = express()
var port = process.env.PORT || 9000
var mysql = require('mysql')
var bodyParser = require('body-parser')
var morgan = require('morgan')

app.use(bodyParser({ limit: '50mb' }))
app.use(express.static(__dirname + '/../client'))
app.use(morgan('dev'))

//POST
app.post('/api/data', function(req, res) {
    var wb = req.body.wb
    filename = req.body.filename
    var tip = ""
    var lastcf = ""
    var qString = ""

    //filter filename
    if (filename.includes('con') && filename.includes('sop')) {
        tip = 'con sop'
    } else if (filename.includes('con') && filename.includes('sot')) {
        tip = 'con sot'
    } else if (filename.includes('bus') && filename.includes('sop')) {
        tip = 'bus sop'
    } else if (filename.includes('bus') && filename.includes('sot')) {
        tip = 'bus sot'
    }

    Object.keys(wb.Sheets.Foglio1).forEach(function(key, index) {
        var rowValue = wb.Sheets.Foglio1[key].h
        console.log(index);

        //they have no idex when cell is empty ><
        if (index > 0) {
            //insert in DB
            if (index > 0) {
                if (index % 2 == 0) { //EVEN (B)
                    qString = "UPDATE ultima_nota SET contratto = '" + rowValue + "' WHERE cf = '" + lastcf + "'"
                    lastcf = ""
                } else { //ODD (A)
                    lastcf = rowValue
                    qString = "INSERT INTO ultima_nota (cf, tip) VALUES ('" + rowValue + "', '" + tip + "')"

                }
                connection.query(qString, function(error) {
                    if (error) {
                        console.log('error in query');
                    } else {
                        console.log('query success');
                    }
                })
            }

        }
    });
    //res.json({ success: true, message: 'user created' })
})


var connection = mysql.createConnection({
    host: 'x',
    user: 'x',
    password: 'x',
    database: 'x'
})
connection.connect(function(error) {
    if (error) {
        console.log('error');
    } else {
        console.log('connected to mysql');
    }
})

app.listen(port, function() {
    console.log('server running on', port);

})