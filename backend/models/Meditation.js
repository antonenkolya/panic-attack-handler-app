const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("Meditation", {
        meditation_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        phrase: {
          type: Sequelize.STRING(1000),
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
      },{
        timestamps: false,
        tableName: 'meditation'
      });
}
