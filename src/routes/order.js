const express = require('express');
const router = express.Router();
const orderController = require('./../controllers/orderController');
const jwt_token = require('./../middlewares/jwt_token')


router.use(jwt_token.checkToken);
router.get('/', orderController.getOrdersByStatus);
router.get('/stat', orderController.statistics);

router.put('/:orderId', orderController.updateStatus);



module.exports = router;