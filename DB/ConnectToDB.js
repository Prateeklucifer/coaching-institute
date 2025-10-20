import sequelize from './sequelize';

let hasSynced = false;

export default async function ConnectToDB() {
  try {
    await sequelize.authenticate();
    // In development, keep schemas up-to-date automatically; in other
    // environments just ensure the tables exist without altering them.
    if (!hasSynced) {
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
      } else {
        await sequelize.sync();
      }
      hasSynced = true;
    }
    console.log('Successfully connected to MySQL');
  } catch (error) {
    console.error('MySQL connection error:', error);
    throw error;
  }
}
