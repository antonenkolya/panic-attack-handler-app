const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("Card", {
        card_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        content: {
          type: Sequelize.STRING(300),
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        type: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate:{
              notEmpty: true,
            }
          }
      },{
        timestamps: false,
        tableName: 'cards'
      });
}
