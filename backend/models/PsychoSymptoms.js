const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("PsychoSymptoms", {
        psycho_symptom_id: {
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
        tableName: 'psycho_symptoms'
      });
}
