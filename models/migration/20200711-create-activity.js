module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('activity', {
      activity_id: {
        type: Sequelize.INTEGER,
        field: "activity_id",
        primaryKey: true,
      },
      merchant_id: {
        type: Sequelize.STRING(64),
        field: "merchant_id",
        allowNull: false
      },
      store_id: {
        type: Sequelize.STRING(64),
        field: "store_id",
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(64),
        field: "name",
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(256),
        field: "address",
        allowNull: false
      },
      reward_coins: {
        type: Sequelize.INTEGER,
        field: "reward_coins",
        defaultValue: 0
      },
      photo_url: {
        type: Sequelize.STRING(128),
        field: "photo_url",
      },
      description: {
        type: Sequelize.TEXT,
        field: "description",
      },
      form_of_participation: {
        type: Sequelize.STRING(64),
        field: "form_of_participation",
      },
      status: {
        type: Sequelize.STRING(64),
        field: "status",
        defaultValue: 1
      },
      type: {
        type: Sequelize.STRING(64),
        field: "type",
      },
      start_date: {
        type: 'TIMESTAMP',
        field: "start_date",
      },
      end_date: {
        type: 'TIMESTAMP',
        field: "end_date",
      },
      created_date: {
        type: 'TIMESTAMP',
        field: "created_date",
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_date: {
        type: 'TIMESTAMP',
        field: "updated_date",
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('activity');
  }
};