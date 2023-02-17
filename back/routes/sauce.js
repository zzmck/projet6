const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, sauceCtrl.allSauce);
router.post('/', auth,  multer, sauceCtrl.addSauce);
router.get('/:id', auth, sauceCtrl.oneSauce);
router.put('/:id', auth,  multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports=router;