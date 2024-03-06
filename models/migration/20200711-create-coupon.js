module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('coupon', {
      coupon_id: {
        type: Sequelize.INTEGER,
        field: 'coupon_id',
        primaryKey: true,
      },
      merchant_id: {
        type: Sequelize.STRING(64),
        field: 'merchant_id',
        allowNull: false
      },
      store_id: {
        type: Sequelize.STRING(64),
        field: 'store_id',
        allowNull: false
      },
      require_coins: {
        type: Sequelize.INTEGER,
        field: 'require_coins',
        defaultValue: 0
      },
      name: {
        type: Sequelize.STRING(64),
        field: 'name',
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        field: 'description',
      },
      generated_reason: {
        type: Sequelize.STRING(64),
        field: 'generated_reason',
      },
      base_discount: {
        type: Sequelize.INTEGER,
        field: 'base_discount',
        defaultValue: 0
      },
      percentage_discount: {
        type: Sequelize.INTEGER,
        field: 'percentage_discount',
        defaultValue: 0
      },
      photo_url: {
        type: Sequelize.STRING(128),
        field: 'photo_url',
      },
      status: {
        type: Sequelize.TINYINT(1),
        field: 'status',
        defaultValue: 1
      },
      start_date: {
        type: 'TIMESTAMP',
        field: 'start_date',
      },
      end_date: {
        type: 'TIMESTAMP',
        field: 'end_date',
      },
      created_date: {
        type: 'TIMESTAMP',
        field: 'created_date',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_date: {
        type: 'TIMESTAMP',
        field: 'updated_date',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('coupon');
  }
};