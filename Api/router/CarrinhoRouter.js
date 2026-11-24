const router = require('express').Router();
const CarrinhoController = require('../Controller/CarrinhoController.js');

router.post('/create', CarrinhoController.create);
router.get('/getById/:id', CarrinhoController.getById);
router.post('/addItem/:id', CarrinhoController.addItem);
router.patch('/updateItem/:id/:itemId', CarrinhoController.updateItem);
router.delete('/removeItem/:id/:itemId', CarrinhoController.removeItem);
router.delete('/clear/:id', CarrinhoController.clear);

module.exports = router;
