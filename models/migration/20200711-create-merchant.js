module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('merchant', {
      merchant_id: {
        type: Sequelize.STRING(64),
        field: "merchant_id",
        primaryKey: true,
      },
      login_id: {
        type: Sequelize.STRING(64),
        field: "login_id",
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(64),
        field: "name",
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        field: "description",
      },
      address: {
        type: Sequelize.STRING(256),
        field: "address",
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(16),
        field: "phone",
      },
      email: {
        type: Sequelize.STRING(32),
        field: "email",
      },
      opening_period: {
        type: Sequelize.TEXT,
        field: "opening_period",
      },
      photo_url: {
        type: Sequelize.STRING(128),
        field: "photo_url",
      },
      website: {
        type: Sequelize.STRING(64),
        field: "website",
      },
      openrice: {
        type: Sequelize.STRING(64),
        field: "openrice",
      },
      facebook: {
        type: Sequelize.STRING(64),
        field: "facebook",
      },
      instagram: {
        type: Sequelize.STRING(64),
        field: "instagram",
      },
      tags: {
        type: Sequelize.TEXT,
        field: 'tags',
      },
      business_registration_number: {
        type: Sequelize.STRING(64),
        field: 'business_registration_number',
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
    return queryInterface.dropTable('merchant');
  }
};