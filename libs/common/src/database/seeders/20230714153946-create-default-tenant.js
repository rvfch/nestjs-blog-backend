/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Tenant', [
      {
        id: '8e70bd91-628b-4459-ae38-954e88efc974',
        name: 'default',
        password:
          '$argon2id$v=19$m=65536,t=3,p=4$XkY5tA1y7bO3cXukEce9Mw$gLYgUsn/ovwvv9RrjpTvGuaMT1emqbHQVQP0R1RC9vE', // 123456
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Tenant', null, {});
  },
};
