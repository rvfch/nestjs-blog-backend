'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = 'tenant_8e70bd91-628b-4459-ae38-954e88efc974';

    await queryInterface.dropTable('Image');

    await queryInterface.createTable(
      'UserImage',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'User',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        schema,
      },
    );

    await queryInterface.createTable(
      'ArticleImage',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        articleId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Article',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        schema,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ArticleImage');
    await queryInterface.dropTable('UserImage');
    await queryInterface.createTable(
      'Images',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        articleId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Article',
            key: 'id',
          },
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        schema,
      },
    );
  },
};
