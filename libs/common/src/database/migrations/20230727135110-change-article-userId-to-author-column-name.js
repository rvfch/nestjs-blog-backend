'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = 'tenant_8e70bd91-628b-4459-ae38-954e88efc974';

    await queryInterface.renameColumn(
      { tableName: 'Article', schema },
      'userId',
      'author',
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = 'tenant_8e70bd91-628b-4459-ae38-954e88efc974t';

    await queryInterface.renameColumn(
      { tableName: 'Article', schema },
      'author',
      'userId',
    );
  },
};
