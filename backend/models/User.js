const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("User", {
        user_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        email: {
          type: Sequelize.STRING(45),
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        password: {
            type: Sequelize.STRING(100),
            allowNull: false,
            validate:{
              notEmpty: true,
            }
          },
        role: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate:{
              notEmpty: true,
            }
          },
        seen_reminder: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
          }
      },{
        timestamps: false,
        tableName: 'users'
      });
}
