if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const { CORSHeader } = require('./middleware/CORS-header')
const passport = require('./config/passport')
const router = require('./routes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(passport.initialize())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/api', CORSHeader, router)

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

// socket設定
const socketIO = require('socket.io')
const meaasge = require('./server/modules/message')
const io = socketIO(app, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'],
    credentials: true
  },
  rejectUnauthorized: false
})
io.on('connection', (socket) => {
  // 可以在伺服器端顯示通道過來的所有事件，以及相關的參數
  socket.onAny((event, ...args) => {
    console.log(event, args)
  })
  socket.on('disconnect', (reason) => console.log(reason))
  meaasge(io, socket)
})

module.exports = app
