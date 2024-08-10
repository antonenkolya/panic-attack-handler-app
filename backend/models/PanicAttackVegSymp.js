const Sequelize = require('sequelize');
module.exports = function (sequelize) {
    return sequelize.define('PanicAttackVegSymp', {
      panic_attack_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      vegetative_symptom_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      }
    }, {
      timestamps: false,
      tableName: 'panic_attack_veg_symp'
    });
  };