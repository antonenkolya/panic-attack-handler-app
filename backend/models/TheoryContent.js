const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("TheoryContent", {
        theory_content_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        title: {
          type: Sequelize.STRING(200),
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        content: {
            type: Sequelize.STRING(2000),
            allowNull: false,
            validate:{
              notEmpty: true,
            }
          }
      },{
        timestamps: false,
        tableName: 'theory_content'
      });
}
