if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const { CORSHeader } = require('./middleware/CORS-header')
const passport = require('./config/passport')
const router = require('./routes')

const app = express()
const PORT = process.env.PORT || 3000

// socket設定
const buildSocket = require('./server')
const server = require('http').Server(app)
buildSocket(server)

app.use(passport.initialize())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/api', CORSHeader, router)

app.get('/', (req, res) => res.send('Hello World!'))
server.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

module.exports = app
