'use strict'
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    userId: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    source: DataTypes.STRING
  }, {
    underscored: true
  })
  Message.associate = function (models) {
    Message.belongsTo(models.User, { foreignKey: 'userId' })
  }
  return Message
}
