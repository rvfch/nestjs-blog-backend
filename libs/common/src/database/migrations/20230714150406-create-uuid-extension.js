'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    );
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.sequelize.query(`DROP EXTENSION "uuid-ossp";`);
  },
};
