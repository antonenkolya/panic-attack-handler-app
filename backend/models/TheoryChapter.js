
const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("TheoryChapter", {
        theory_chapter_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        name: {
          type: Sequelize.STRING(200),
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        }
      },{
        timestamps: false,
        tableName: 'theory_chapters'
      });

      
}
