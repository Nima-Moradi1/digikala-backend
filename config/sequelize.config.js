const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize({
  //since we're using mySQL , we installed the driver for it > mysql2
  dialect: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("connected to mySQL successfully");
  })
  .catch((err) => {
    console.log("cannot connect to database");
  });

module.exports = sequelize;
