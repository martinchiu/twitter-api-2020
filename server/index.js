const meaasge = require('./modules/message')

module.exports = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      allowedHeaders: ['Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'],
      credentials: true
    }
  })
  io.on('connection', (socket) => {
    meaasge(io, socket)
  })
}
