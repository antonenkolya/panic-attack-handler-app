
const Sequelize = require('sequelize');

module.exports = function(sequelize) {
  const Subscription = sequelize.define('Subscription', {
    subscription_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    endpoint: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    auth: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    p256dh: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    timezone: {
      type: Sequelize.STRING(50),  
      allowNull: false
    }
  }, {
    tableName: 'subscriptions',
    timestamps: false
  });

  return Subscription;
};
