const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.info(msg) : false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('SQLite database connected successfully');
    
    // Sync database
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized');
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };