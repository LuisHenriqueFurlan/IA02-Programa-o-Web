const db = require('../db/conn');
const Carrinho = require('../model/Carrinho');
const ItemCarrinho = require('../model/ItemCarrinho');
const Produto = require('../model/Produto');
const Venda = require('../model/Venda');
const ItemVenda = require('../model/ItemVenda');

module.exports = class VendaController {
    // Finaliza o carrinho gerando uma venda
    static async checkout(req, res) {
        const { carrinhoId, cliente, formaPagamento } = req.body;

        if (!carrinhoId) {
            res.status(422).json({ message: 'O carrinho é obrigatório!' });
            return;
        }
        if (!cliente || !String(cliente).trim()) {
            res.status(422).json({ message: 'O nome do cliente é obrigatório!' });
            return;
        }
        if (!formaPagamento) {
            res.status(422).json({ message: 'A forma de pagamento é obrigatória!' });
            return;
        }

        const t = await db.transaction();
        try {
            const carrinho = await Carrinho.findByPk(carrinhoId, {
                include: [{ model: ItemCarrinho, as: 'itens', include: [{ model: Produto, as: 'produto' }] }],
                transaction: t
            });
            if (!carrinho || carrinho.status !== 'aberto') {
                await t.rollback();
                res.status(404).json({ message: 'Carrinho não encontrado ou já finalizado!' });
                return;
            }
            if (carrinho.itens.length === 0) {
                await t.rollback();
                res.status(422).json({ message: 'O carrinho está vazio!' });
                return;
            }

            const total = carrinho.itens.reduce(
                (soma, i) => soma + Number(i.produto.preco) * i.quantidade, 0
            );

            const venda = await Venda.create(
                { cliente: String(cliente).trim(), formaPagamento, total },
                { transaction: t }
            );
            await ItemVenda.bulkCreate(carrinho.itens.map((i) => ({
                VendaId: venda.id,
                produtoId: i.produto.id,
                nome: i.produto.nome,
                precoUnitario: i.produto.preco,
                quantidade: i.quantidade
            })), { transaction: t });

            await carrinho.update({ status: 'finalizado' }, { transaction: t });
            await t.commit();

            const completa = await Venda.findByPk(venda.id, { include: [{ model: ItemVenda, as: 'itens' }] });
            res.status(201).json({ message: 'Venda finalizada com sucesso', venda: completa });
        } catch (err) {
            await t.rollback();
            res.status(500).json({ message: 'Erro ao finalizar a venda: ' + err });
        }
    }

    static async getAll(req, res) {
        try {
            const vendas = await Venda.findAll({
                include: [{ model: ItemVenda, as: 'itens' }],
                order: [['id', 'DESC']]
            });
            res.status(200).json(vendas);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar as vendas: ' + err });
        }
    }

    static async getById(req, res) {
        try {
            const venda = await Venda.findByPk(req.params.id, {
                include: [{ model: ItemVenda, as: 'itens' }]
            });
            if (!venda) {
                res.status(404).json({ message: 'Venda não encontrada!' });
                return;
            }
            res.status(200).json(venda);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar a venda: ' + err });
        }
    }
};
