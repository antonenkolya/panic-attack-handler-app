const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  return sequelize.define('UserPanicAttack', {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    panic_attack_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    timestamps: false,
    tableName: 'user_panic_attack'
  });
};