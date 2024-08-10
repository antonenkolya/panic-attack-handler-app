const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("Location", {
        location_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
      },{
        timestamps: false,
        tableName: 'location'
      });
}
