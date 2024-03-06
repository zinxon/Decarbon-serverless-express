module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user', {
      user_id: {
        type: Sequelize.STRING(64),
        field: "user_id",
        primaryKey: true,
      },
      login_id: {
        type: Sequelize.STRING(64),
        field: "login_id",
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(64),
        field: "first_name",
      },
      last_name: {
        type: Sequelize.STRING(64),
        field: "first_name",
      },
      gender: {
        type: Sequelize.STRING(4),
        field: "gender",
      },
      phone: {
        type: Sequelize.STRING(16),
        field: "phone",
      },
      email: {
        type: Sequelize.STRING(32),
        field: "email",
      },
      coins: {
        type: Sequelize.INTEGER,
        field: "coins",
        defaultValue: 0
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
    return queryInterface.dropTable('user');
  }
}