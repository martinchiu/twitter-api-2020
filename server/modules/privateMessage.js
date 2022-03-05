const { User } = require('../../models')
const createRoomName = require('../../utils/roomName')

module.exports = (io, socket) => {
  socket.on('createRoom', data => {
    const roomName = createRoomName(...data)
    socket.join(roomName)
  })
  socket.on('privateMessage', data => {
    
  })
}
