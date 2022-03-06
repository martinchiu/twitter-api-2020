'use strict'
module.exports = (sequelize, DataTypes) => {
  const PrivateMessage = sequelize.define('PrivateMessage', {
    sendUserId: DataTypes.INTEGER,
    listenUserId: DataTypes.INTEGER,
    message: DataTypes.STRING
  }, {
    underscored: true
  })
  PrivateMessage.associate = function (models) {
    PrivateMessage.belongsTo(models.User, { foreignKey: 'sendUserId' })
    PrivateMessage.belongsTo(models.User, { foreignKey: 'listenUserId' })
  }
  return PrivateMessage
}
