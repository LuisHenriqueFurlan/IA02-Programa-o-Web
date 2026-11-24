const Carrinho = require('../model/Carrinho');
const ItemCarrinho = require('../model/ItemCarrinho');
const Produto = require('../model/Produto');

// Carrega o carrinho com itens + produtos e calcula o total
async function carregarCarrinho(id) {
    const carrinho = await Carrinho.findByPk(id, {
        include: [{ model: ItemCarrinho, as: 'itens', include: [{ model: Produto, as: 'produto' }] }]
    });
    if (!carrinho) return null;
    const json = carrinho.toJSON();
    json.total = json.itens.reduce(
        (soma, item) => soma + Number(item.produto.preco) * item.quantidade, 0
    );
    return json;
}

module.exports = class CarrinhoController {
    static async create(req, res) {
        try {
            const carrinho = await Carrinho.create();
            res.status(201).json(await carregarCarrinho(carrinho.id));
        } catch (err) {
            res.status(500).json({ message: 'Erro ao criar o carrinho: ' + err });
        }
    }

    static async getById(req, res) {
        try {
            const carrinho = await carregarCarrinho(req.params.id);
            if (!carrinho) {
                res.status(404).json({ message: 'Carrinho não encontrado!' });
                return;
            }
            res.status(200).json(carrinho);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar o carrinho: ' + err });
        }
    }

    static async addItem(req, res) {
        const { id } = req.params;
        const { produtoId } = req.body;
        const quantidade = req.body.quantidade === undefined ? 1 : Number(req.body.quantidade);

        if (!produtoId) {
            res.status(422).json({ message: 'O produto é obrigatório!' });
            return;
        }
        if (!Number.isInteger(quantidade) || quantidade < 1) {
            res.status(422).json({ message: 'A quantidade deve ser um inteiro maior que zero!' });
            return;
        }

        try {
            const carrinho = await Carrinho.findByPk(id);
            if (!carrinho || carrinho.status !== 'aberto') {
                res.status(404).json({ message: 'Carrinho não encontrado ou já finalizado!' });
                return;
            }
            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                res.status(404).json({ message: 'Produto não encontrado!' });
                return;
            }

            const item = await ItemCarrinho.findOne({ where: { CarrinhoId: id, ProdutoId: produtoId } });
            if (item) {
                await item.update({ quantidade: item.quantidade + quantidade });
            } else {
                await ItemCarrinho.create({ CarrinhoId: id, ProdutoId: produtoId, quantidade });
            }
            res.status(200).json(await carregarCarrinho(id));
        } catch (err) {
            res.status(500).json({ message: 'Erro ao adicionar o item: ' + err });
        }
    }

    static async updateItem(req, res) {
        const { id, itemId } = req.params;
        const quantidade = Number(req.body.quantidade);

        if (!Number.isInteger(quantidade) || quantidade < 1) {
            res.status(422).json({ message: 'A quantidade deve ser um inteiro maior que zero!' });
            return;
        }

        try {
            const item = await ItemCarrinho.findOne({ where: { id: itemId, CarrinhoId: id } });
            if (!item) {
                res.status(404).json({ message: 'Item não encontrado!' });
                return;
            }
            await item.update({ quantidade });
            res.status(200).json(await carregarCarrinho(id));
        } catch (err) {
            res.status(500).json({ message: 'Erro ao atualizar o item: ' + err });
        }
    }

    static async removeItem(req, res) {
        const { id, itemId } = req.params;
        try {
            const item = await ItemCarrinho.findOne({ where: { id: itemId, CarrinhoId: id } });
            if (!item) {
                res.status(404).json({ message: 'Item não encontrado!' });
                return;
            }
            await item.destroy();
            res.status(200).json(await carregarCarrinho(id));
        } catch (err) {
            res.status(500).json({ message: 'Erro ao remover o item: ' + err });
        }
    }

    static async clear(req, res) {
        const { id } = req.params;
        try {
            const carrinho = await Carrinho.findByPk(id);
            if (!carrinho) {
                res.status(404).json({ message: 'Carrinho não encontrado!' });
                return;
            }
            await ItemCarrinho.destroy({ where: { CarrinhoId: id } });
            res.status(200).json(await carregarCarrinho(id));
        } catch (err) {
            res.status(500).json({ message: 'Erro ao limpar o carrinho: ' + err });
        }
    }
};
