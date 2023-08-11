'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tenant', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    const schema = 'tenant_8e70bd91-628b-4459-ae38-954e88efc974';

    await queryInterface.createSchema(schema);
    await queryInterface.createTable(
      'User',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        isAdmin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        ip: {
          type: Sequelize.STRING,
          allowNull: true,
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
      'Article',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        perex: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM('PUBLISHED', 'DRAFT'),
          allowNull: false,
          defaultValue: 'DRAFT',
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
      'Comment',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
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
        userId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'User',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        parentId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Comment',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        ratingScore: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
      'Credentials',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        version: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false,
        },
        lastPassword: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        passwordUpdatedAt: {
          type: Sequelize.INTEGER,
          defaultValue: Sequelize.literal('extract(epoch from now())'),
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
      { schema },
    );

    await queryInterface.createTable(
      'Image',
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
    await queryInterface.createTable(
      'Rating',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        isUpvote: {
          type: Sequelize.BOOLEAN,
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
        commentId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Comment',
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
    await queryInterface.dropTable('User', { schema });
    await queryInterface.dropTable('Article', { schema });
    await queryInterface.dropTable('Comment', { schema });
    await queryInterface.dropTable('Credentials', { schema });
    await queryInterface.dropTable('Image', { schema });
    await queryInterface.dropTable('Rating', { schema });
  },
};
