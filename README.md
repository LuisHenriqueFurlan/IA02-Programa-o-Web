# IA02 - Programação Web

Loja com CRUD de produtos (com imagem), carrinho de compras e finalização de venda.

- **Api/** – Node + Express + Sequelize (MariaDB, banco `loja`, usuário/senha `root`/`root`)
- **Front-end/** – React (Create React App) + Bootstrap

## Executando
```bash
cd Api && npm install && npm start          # http://localhost:5000
cd Front-end && npm install && npm start    # http://localhost:3000
```

## Endpoints
| Rota | Descrição |
|---|---|
| `POST /Produto/create` | multipart: `nome`, `preco` (>= 0), `imagem` (.jpeg/.png) |
| `GET /Produto/getAll`, `GET /Produto/getById/:id` | listar / buscar |
| `PATCH /Produto/update/:id`, `DELETE /Produto/delete/:id` | editar / excluir |
| `POST /Carrinho/create` | cria carrinho |
| `GET /Carrinho/getById/:id` | itens + total |
| `POST /Carrinho/addItem/:id` | body `{produtoId, quantidade}` |
| `PATCH /Carrinho/updateItem/:id/:itemId` | body `{quantidade}` |
| `DELETE /Carrinho/removeItem/:id/:itemId`, `DELETE /Carrinho/clear/:id` | remover / limpar |
| `POST /Venda/checkout` | body `{carrinhoId, cliente, formaPagamento}` |
| `GET /Venda/getAll`, `GET /Venda/getById/:id` | consultar vendas |
