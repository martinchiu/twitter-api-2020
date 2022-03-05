if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const { CORSHeader } = require('./middleware/CORS-header')
const passport = require('./config/passport')
const router = require('./routes')

const app = express()
const PORT = process.env.PORT || 3000

// socket設定(原本)
// const server = require('http').createServer(app)
// const buildSocket = require('./server')
// buildSocket(server)
// server.listen(PORT)
const socketIO = require('socket.io')
const INDEX = '/index.html'
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'],
    credentials: true
  },
  rejectUnauthorized: false
})
io.on('connection', (socket) => {
  console.log('Client connected')
  socket.on('disconnect', () => console.log('Client disconnected'))
})

setInterval(() => io.emit('time', new Date().toTimeString()), 1000)

app.use(passport.initialize())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/api', CORSHeader, router)

app.get('/', (req, res) => res.send('Hello World!'))
// app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

module.exports = app
