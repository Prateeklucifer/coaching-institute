const { sequelize } = require("../DB/sequelize.js");

async function resetUsersTable() {
  try {
    // Drop the users table if it exists
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DROP TABLE IF EXISTS users');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Users table dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting users table:', error);
    process.exit(1);
  }
}

resetUsersTable();
