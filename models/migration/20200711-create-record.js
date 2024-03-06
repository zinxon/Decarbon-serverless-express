module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('record', {
      record_id: {
        type: Sequelize.STRING(64),
        field: "record_id",
        primaryKey: true,
        autoIncrement: true
      },
      activity_id: {
        type: Sequelize.INTEGER,
        field: "activity_id",
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        field: "coupon_id",
      },
      merchant_id: {
        type: Sequelize.STRING(64),
        field: "merchant_id",
        allowNull: false
      },
      user_id: {
        type: Sequelize.STRING(64),
        field: "user_id",
        allowNull: false
      },
      store_id: {
        type: Sequelize.STRING(64),
        field: "store_id",
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(16),
        field: "type",
        allowNull: false,
      },
      coins: {
        type: Sequelize.INTEGER,
        field: "coins",
        defaultValue: 0,
      },
      user_old_coins: {
        type: Sequelize.INTEGER,
        field: "user_old_coins",
        defaultValue: 0,
      },
      user_new_coins: {
        type: Sequelize.INTEGER,
        field: "user_new_coins",
        defaultValue: 0,
      },
      remarks: {
        type: Sequelize.STRING(256),
        field: "remarks",
      },
      status: {
        type: Sequelize.TINYINT(1),
        field: "status",
        defaultValue: 1
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
    return queryInterface.dropTable('record');
  }
}