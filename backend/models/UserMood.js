const Sequelize = require("sequelize");
module.exports = function (sequelize) {
  return sequelize.define("UserMood", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      validate:{
        notEmpty: true,
      }    
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
      primaryKey: true,
      validate:{
        notEmpty: true,
      }
    },
    mood: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate:{
        notEmpty: true,
      }
    },
    notes: {
      type: Sequelize.STRING(1000),
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'user_mood'
  });
};
