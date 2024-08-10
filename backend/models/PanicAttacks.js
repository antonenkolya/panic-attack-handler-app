const Sequelize = require("sequelize")
module.exports = function (sequelize) {
  return sequelize.define('PanicAttack', {
    panic_attack_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    duration: {
      type: Sequelize.TIME,
      allowNull: false
    },
    severity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    location: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    location_details: {
      type: Sequelize.STRING(300),
      allowNull: false
    },
    triggers: {
      type: Sequelize.STRING(1000),
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'panic_attacks'
  });
};
