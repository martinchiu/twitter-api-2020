const createRoomName = (sendUserId, listenUserId) => {
  if (sendUserId > listenUserId) { return String(listenUserId) + String(sendUserId) }

  return String(sendUserId) + String(listenUserId)
}

module.exports = createRoomName
