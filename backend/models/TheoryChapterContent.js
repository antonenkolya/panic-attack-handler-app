
const Sequelize = require("sequelize")
module.exports = function (sequelize){
    return sequelize.define("TheoryChapterContent", {
        theory_content_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
        theory_chapter_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          validate:{
            notEmpty: true,
          }
        },
      },{
        timestamps: false,
        tableName: 'theory_chapter_content'
      });
}
