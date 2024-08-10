const Sequelize = require('sequelize');
module.exports = function (sequelize) {
    return sequelize.define('PanicAttackPsySymp', {
      panic_attack_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      psycho_symptom_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      }
    }, {
      timestamps: false,
      tableName: 'panic_attack_psy_symp'
    });
  };