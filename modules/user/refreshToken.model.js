// //? Why did we create this file ? >>>
//  we assume that someone has gotten access to our
// refreshToken , and since it lasts for 30 days and we have an endpoint that can get the refreshToken
// and re-create the accessToken and refreshToken , anyone with access to that refreshToken can always send requests
// and recieve new data as a HACKER !
// so we should create a blacklist of all the previous refreshTokens, so that it can only be used ONCE!

const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const RefreshTokenModel = sequelize.define(
  "refresh_token",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type: DataTypes.TEXT, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    freezeTableName: true,
    modelName: "refresh_token",
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = {
  RefreshTokenModel,
};
