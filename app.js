const express    = require('express')
const app        = express()
const port       = process.env.PORT||4000
const bodyParser = require('body-parser')
const router     = require('./routes')

app
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(router)

app.listen(port, ()=>console.log(`App is listening to port ${port}`))