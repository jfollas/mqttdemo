var express = require('express')
var app = express()
 
app.use(express.static('public'))

app.get('/', function(req, res) {
  res.redirect('/paho')
})
 
app.get('/test', function(req, res) {
  res.send('{"msg": "This is a test response"}')
})

app.listen(8000)
console.log("Listening on port 8000")