const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');
const Venda = require('./Venda.js');

// O item guarda uma "foto" do produto no momento da venda (nome e preço),
// assim alterar/remover o produto não muda vendas antigas.
const ItemVenda = db.define('ItemVenda', {
    produtoId: { type: DataTypes.INTEGER, allowNull: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    precoUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false }
});

Venda.hasMany(ItemVenda, { as: 'itens', foreignKey: 'VendaId', onDelete: 'CASCADE' });
ItemVenda.belongsTo(Venda, { foreignKey: 'VendaId' });

module.exports = ItemVenda;
