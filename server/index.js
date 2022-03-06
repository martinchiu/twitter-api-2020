const meaasge = require('./modules/message')
const privateMessage = require('./modules/privateMessage')

module.exports = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.front_end_web_url,
      allowedHeaders: ['Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'],
      credentials: true
    }
  })
  io.on('connection', (socket) => {
    // 可以在伺服器端顯示通道過來的所有事件，以及相關的參數
    socket.onAny((event, ...args) => {
      console.log(event, args)
    })
    socket.on('disconnect', (reason) => console.log(reason))

    meaasge(io, socket)
    privateMessage(io, socket)
  })
}
