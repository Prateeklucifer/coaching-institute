const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');
require('dotenv').config();

const dbConfig = {
  database: process.env.MYSQL_DB_NAME || 'coaching_institute',
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  dialect: 'mysql',
  dialectModule: mysql2,
  logging: console.log
};

async function resetDatabase() {
  // Create a connection without specifying the database
  const sequelize = new Sequelize('', dbConfig.username, dbConfig.password, {
    ...dbConfig,
    database: ''
  });

  try {
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL server');

    // Drop the database if it exists
    console.log(`🗑️  Dropping database: ${dbConfig.database}`);
    await sequelize.query(`DROP DATABASE IF EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database dropped`);

    // Create a new database
    console.log(`🆕 Creating new database: ${dbConfig.database}`);
    await sequelize.query(`CREATE DATABASE \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created');

    // Close the connection
    await sequelize.close();
    console.log('🔌 Disconnected from MySQL server');
    
    console.log('\n✅ Database reset complete!');
    console.log('🚀 Run your application to apply migrations and seed data.');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the reset function
resetDatabase();
