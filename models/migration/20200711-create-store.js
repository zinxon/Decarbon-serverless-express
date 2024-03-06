module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('store', {
      store_id: {
        type: Sequelize.STRING(64),
        field: "store_id",
        primaryKey: true,
      },
      merchant_id: {
        type: Sequelize.STRING(64),
        field: "merchant_id",
        allowNull: false
      },
      login_id: {
        type: Sequelize.STRING(64),
        field: "merchant_id",
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(16),
        field: "name",
        allowNull: false
      },
      opening_period: {
        type: Sequelize.TEXT,
        field: "opening_period",
      },
      phone: {
        type: Sequelize.STRING(16),
        field: "phone",
      },
      latitude: {
        type: Sequelize.DOUBLE,
        field: "latitude",
      },
      longitude: {
        type: Sequelize.DOUBLE,
        field: "longitude",
      },
      address: {
        type: Sequelize.STRING(256),
        field: "address",
        allowNull: false
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
    return queryInterface.dropTable('store');
  }
}