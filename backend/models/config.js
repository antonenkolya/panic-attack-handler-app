require('dotenv').config(); 
const Sequelize = require("sequelize")

const sequelize = new Sequelize(process.env.MYSQLDATABASE, process.env.MYSQLUSER, process.env.MYSQLPASSWORD, {
  dialect: "mysql",
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT
});
// const sequelize = new Sequelize("panic_handler_app", "root", "root_PSW3-@", {
//   dialect: "mysql",
//   host: "localhost"
// });


const TheoryChapter = require('./TheoryChapter')(sequelize) //sequelize передаётся в качестве аргумента, чтобы повторно не прописывать подключение к бд
const TheoryContent = require('./TheoryContent')(sequelize) 
const TheoryChapterContent = require('./TheoryChapterContent')(sequelize)

const Meditation = require('./Meditation')(sequelize) 
const Card = require('./Card')(sequelize) 
const User = require('./User')(sequelize) 
const UserCard = require('./UserCard')(sequelize) 

const UserMood = require('./UserMood')(sequelize) 

const Location = require('./Location')(sequelize) 
const VegetativeSymptoms = require('./VegetativeSymptoms')(sequelize) 
const PsychoSymptoms = require('./PsychoSymptoms')(sequelize) 

const PanicAttacks = require('./PanicAttacks')(sequelize)
const UserPanicAttack = require('./UserPanicAttack')(sequelize) 

const PanicAttackCard = require('./PanicAttackCard')(sequelize) 
const PanicAttackPsySymp = require('./PanicAttackPsySymp')(sequelize) 
const PanicAttackVegSymp = require('./PanicAttackVegSymp')(sequelize) 
const RefreshToken = require('./RefreshToken')(sequelize) 
const Subscriptions = require('./Subscriptions')(sequelize) 



TheoryContent.hasMany(TheoryChapterContent, { foreignKey: 'theory_content_id' });
TheoryChapter.hasMany(TheoryChapterContent, { foreignKey: 'theory_chapter_id' });
TheoryChapterContent.belongsTo(TheoryContent, { foreignKey: 'theory_content_id' });
TheoryChapterContent.belongsTo(TheoryChapter, { foreignKey: 'theory_chapter_id' });

User.hasMany(UserCard, { foreignKey: 'user_id' });
User.hasMany(UserMood, { foreignKey: 'user_id' });
Card.hasMany(UserCard, { foreignKey: 'card_id' });
UserCard.belongsTo(User, { foreignKey: 'user_id' });
UserCard.belongsTo(Card, { foreignKey: 'card_id' });
UserMood.belongsTo(User, { foreignKey: 'user_id' });

PanicAttacks.hasOne(Location, { foreignKey: 'location_id' });
Location.hasMany(PanicAttacks, { foreignKey: 'location' });

User.hasMany(UserPanicAttack, { foreignKey: 'user_id' });
UserPanicAttack.belongsTo(User, { foreignKey: 'user_id' });
PanicAttacks.hasOne(UserPanicAttack, { foreignKey: 'panic_attack_id' });
UserPanicAttack.belongsTo(PanicAttacks, { foreignKey: 'panic_attack_id' });

PanicAttackVegSymp.belongsTo(VegetativeSymptoms, { foreignKey: 'vegetative_symptom_id' });
VegetativeSymptoms.hasOne(PanicAttackVegSymp, { foreignKey: 'vegetative_symptom_id' });

PanicAttackPsySymp.belongsTo(PsychoSymptoms, { foreignKey: 'psycho_symptom_id' });
PsychoSymptoms.hasOne(PanicAttackPsySymp, { foreignKey: 'psycho_symptom_id' });

PanicAttackCard.belongsTo(Card, { foreignKey: 'card_id' });
Card.hasOne(PanicAttackCard, { foreignKey: 'card_id' });

RefreshToken.belongsTo(User, { foreignKey: 'user_id' });
module.exports ={
    sequelize: sequelize,
    theoryChapter: TheoryChapter,
    theoryContent: TheoryContent,
    theoryChapterContent: TheoryChapterContent,
    card: Card,
    user: User,
    userCard: UserCard,
    userMood: UserMood,
    meditation: Meditation,

    location: Location,
    vegSymp: VegetativeSymptoms,
    psySymp: PsychoSymptoms,
    panicAttacks: PanicAttacks,
    userPanicAttacks: UserPanicAttack,
    panicAttackCard: PanicAttackCard,
    panicAttackPsySymp: PanicAttackPsySymp,
    panicAttackVegSymp: PanicAttackVegSymp,
    refreshToken: RefreshToken,
    subscriptions: Subscriptions
}
