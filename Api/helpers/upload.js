const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Apenas .jpeg/.jpg e .png
const TIPOS_PERMITIDOS = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
};

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, crypto.randomUUID() + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const extensoes = TIPOS_PERMITIDOS[file.mimetype];
    if (!extensoes || !extensoes.includes(ext)) {
        return cb(new Error('FORMATO_INVALIDO'));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('imagem');

// Middleware que devolve os erros de upload como JSON
module.exports = (req, res, next) => {
    upload(req, res, (err) => {
        if (!err) return next();
        if (err.message === 'FORMATO_INVALIDO') {
            return res.status(422).json({ message: 'A imagem deve ser .jpeg ou .png!' });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(422).json({ message: 'A imagem deve ter no máximo 5MB!' });
        }
        return res.status(500).json({ message: 'Erro no upload: ' + err.message });
    });
};
