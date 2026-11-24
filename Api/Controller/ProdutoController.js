const fs = require('fs');
const path = require('path');
const Produto = require('../model/Produto');

function removerImagem(nomeArquivo) {
    if (!nomeArquivo) return;
    fs.unlink(path.join(__dirname, '..', 'uploads', nomeArquivo), () => {});
}

// Valida e converte o preço. Retorna {erro} ou {valor}
function validarPreco(preco) {
    if (preco === undefined || preco === null || preco === '') {
        return { erro: 'O preço é obrigatório!' };
    }
    const valor = Number(preco);
    if (Number.isNaN(valor)) {
        return { erro: 'O preço deve ser um número!' };
    }
    if (valor < 0) {
        return { erro: 'O preço não pode ser negativo!' };
    }
    return { valor };
}

module.exports = class ProdutoController {
    static async create(req, res) {
        const { nome, preco } = req.body;
        const imagem = req.file ? req.file.filename : null;

        if (!nome) {
            removerImagem(imagem);
            res.status(422).json({ message: 'O nome é obrigatório!' });
            return;
        }

        const p = validarPreco(preco);
        if (p.erro) {
            removerImagem(imagem);
            res.status(422).json({ message: p.erro });
            return;
        }

        const produto = new Produto({ nome, preco: p.valor, imagem });

        try {
            await produto.save();
            res.status(201).json({ message: 'Produto criado com sucesso', produto });
        } catch (err) {
            removerImagem(imagem);
            res.status(500).json({ message: 'Erro ao criar o produto: ' + err });
        }
    }

    static async getAll(req, res) {
        try {
            const produtos = await Produto.findAll({ order: [['id', 'DESC']] });
            res.status(200).json(produtos);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar os produtos: ' + err });
        }
    }

    static async getById(req, res) {
        const { id } = req.params;

        const produto = await Produto.findByPk(id);

        if (!produto) {
            res.status(404).json({ message: 'Produto não encontrado!' });
            return;
        }

        res.status(200).json(produto);
    }

    static async update(req, res) {
        const { id } = req.params;
        const { nome, preco } = req.body;
        const novaImagem = req.file ? req.file.filename : null;

        const produto = await Produto.findByPk(id);
        if (!produto) {
            removerImagem(novaImagem);
            res.status(404).json({ message: 'Produto não encontrado!' });
            return;
        }

        const dados = {};
        if (nome !== undefined) {
            if (!nome) {
                removerImagem(novaImagem);
                res.status(422).json({ message: 'O nome é obrigatório!' });
                return;
            }
            dados.nome = nome;
        }
        if (preco !== undefined) {
            const p = validarPreco(preco);
            if (p.erro) {
                removerImagem(novaImagem);
                res.status(422).json({ message: p.erro });
                return;
            }
            dados.preco = p.valor;
        }
        if (novaImagem) dados.imagem = novaImagem;

        try {
            const imagemAntiga = produto.imagem;
            await produto.update(dados);
            if (novaImagem) removerImagem(imagemAntiga);
            res.status(200).json({ message: 'Produto atualizado com sucesso', produto });
        } catch (err) {
            removerImagem(novaImagem);
            res.status(500).json({ message: 'Erro ao atualizar o produto: ' + err });
        }
    }

    static async delete(req, res) {
        const { id } = req.params;
        const produto = await Produto.findByPk(id);
        if (!produto) {
            res.status(404).json({ message: 'Produto não encontrado!' });
            return;
        }
        try {
            const imagem = produto.imagem;
            await produto.destroy();
            removerImagem(imagem);
            res.status(200).json({ message: 'Produto deletado com sucesso!' });
        } catch (err) {
            res.status(500).json({ message: 'Erro ao deletar o produto: ' + err });
        }
    }
};
