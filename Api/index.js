const express = require('express');
const path = require('path');
const app = express();
const port = 5000;
const conn = require('./db/conn.js');
const cors = require('cors');

app.use(express.json());
app.use(cors({ credentials: true, origin: '*' }));

// Imagens dos produtos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Os models precisam ser carregados antes do sync() para criar as tabelas
require('./model/Produto.js');
require('./model/Carrinho.js');
require('./model/ItemCarrinho.js');
require('./model/Venda.js');
require('./model/ItemVenda.js');

const ProdutoRouter = require('./router/ProdutoRouter.js');
const CarrinhoRouter = require('./router/CarrinhoRouter.js');
const VendaRouter = require('./router/VendaRouter.js');
app.use('/Produto', ProdutoRouter);
app.use('/Carrinho', CarrinhoRouter);
app.use('/Venda', VendaRouter);

conn
    .sync()
    .then(() => { app.listen(port, () => console.log('API rodando na porta ' + port)); })
    .catch((err) => console.log(err));
