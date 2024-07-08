const router = require('express').Router();
const multer = require('multer');
const { fileUploadController } = require('./controller');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('filename'),fileUploadController);
module.exports = router