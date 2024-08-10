const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("VegetativeSymptoms", {
        vegetative_symptom_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        description: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
      },{
        timestamps: false,
        tableName: 'vegetative_symptoms'
      });
}
