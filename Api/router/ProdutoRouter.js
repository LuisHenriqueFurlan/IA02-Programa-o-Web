const router = require('express').Router();
const ProdutoController = require('../Controller/ProdutoController.js');
const upload = require('../helpers/upload.js');

router.post('/create', upload, ProdutoController.create);
router.get('/getAll', ProdutoController.getAll);
router.get('/getById/:id', ProdutoController.getById);
router.patch('/update/:id', upload, ProdutoController.update);
router.delete('/delete/:id', ProdutoController.delete);

module.exports = router;
