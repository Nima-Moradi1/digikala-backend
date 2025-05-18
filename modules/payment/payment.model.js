const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");

const Payment = sequelize.define(
  "payment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: DataTypes.BOOLEAN, defaultValue: false },
    amount: { type: DataTypes.DECIMAL },
    //the id reference we get from portals like Zarinpal to check with them if a payment goes wrong
    refId: { type: DataTypes.STRING, allowNull: true },
    authority: { type: DataTypes.STRING, allowNull: true },
    //why can it be null ? because a user can charge his wallet without ordering anything!
    orderId: { type: DataTypes.INTEGER, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    freezeTableName: true,
    modelName: "payment",
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = {
  Payment,
};
