const orderDetailService = require('./../services/orderDetailService')
const orderService = require('./../services/orderService')
const { responseSuccess, responseWithError } = require('./../utils/response')

const checkMyCart = async (data) => {
    let [cart, order_detail] = await Promise.all([
        orderService.findOne({ userId: data.userId, status: data.status }),
        orderDetailService.findOne({ id: data.id })
    ])
    if (cart && cart.id === order_detail.orderId)
        return true;
    return false;
}

module.exports.updateQuantity = async (req, res, next) => {
    try {
        let data = { userId: req.user.id, status: 0, id: req.params.id }
        let isMyOrder = await checkMyCart(data)
        if (isMyOrder) {
            await orderDetailService.updateByCondition({ quantity: req.body.quantity }, { id: req.params.id })
            res.json(responseSuccess("UPDATE QUANTITY SUCCESSFULLY"))
        }
        else {
            res.json(responseWithError("UPDATE QUANTITY FAILED"))
        }
    }
    catch (err) {
        res.json(responseWithError(err))
    }
}

module.exports.destroy = async (req, res, next) => {
    try {
        let [myCart, conditionRemove = -1] = req.params.id == 0 ?
            [orderService.findOne({ userId: req.user.id, status: 0 })] :
            [checkMyCart({ userId: req.user.id, status: 0, id: req.params.id }), { id: req.params.id }];
        myCart = await myCart;
        if (myCart) {
            conditionRemove = conditionRemove === -1 ? { orderId: myCart.id } : { id: req.params.id }
            let data = await orderDetailService.destroyByCondition(conditionRemove)
            if (data !== 0)
                res.json(responseSuccess("DELETE ALL PRODUCT SUCCESSFULLY"))
            else
                res.json(responseWithError("DELETE ALL PRODUCT FAILED"))
        }

    }
    catch (err) {
        res.json(responseWithError(err))
    }
}
