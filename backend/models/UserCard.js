
const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("UserCard", {
        user_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        card_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
      },{
        timestamps: false,
        tableName: 'user_cards'
      });
}
