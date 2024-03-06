module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('favourite', {
      favourite_id: {
        type: Sequelize.INTEGER,
        field: "favourite_id",
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.STRING(64),
        field: "user_id",
        allowNull: false
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
    return queryInterface.dropTable('favourite');
  }
};