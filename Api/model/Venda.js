const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');

const Venda = db.define('Venda', {
    cliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    formaPagamento: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Venda;
