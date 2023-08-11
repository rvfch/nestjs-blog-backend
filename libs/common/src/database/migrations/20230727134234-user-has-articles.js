'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = 'tenant_8e70bd91-628b-4459-ae38-954e88efc974';

    await queryInterface.addColumn({ tableName: 'Article', schema }, 'userId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    const schema = 'tenant_8e70bd91-628b-4459-ae38-954e88efc974';

    await queryInterface.removeColumn(
      { tableName: 'Article', schema },
      'userId',
    );
  },
};
