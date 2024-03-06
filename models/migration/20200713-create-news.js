module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('news', {
      news_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "news_id",
      },
      name: {
        type: Sequelize.STRING(128),
        field: "name",
      },
      content: {
        type: Sequelize.TEXT,
        field: "content",
      },
      photo_url: {
        type: Sequelize.STRING(64),
        field: "photo_url",
      },
      author: {
        type: Sequelize.STRING(64),
        field: "author",
      },
      created_date: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: "created_date",
      },
      updated_date: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: "updated_date",
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('news');
  }
};