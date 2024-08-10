const Sequelize = require('sequelize');
module.exports = function (sequelize) {
  return sequelize.define('PanicAttackCard', {
    panic_attack_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    card_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    timestamps: false,
    tableName: 'panic_attack_card'
  });
};
