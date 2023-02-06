const orderService = require('../services/orderService')
const orderDetailService = require('../services/orderDetailService')
const { responseSuccess, responseWithError } = require('../utils/response')
const productService = require('./../services/productService');
const constant = require('./../utils/constant');
const moment = require('moment');
const { Op } = require('sequelize');
const db = require('./../connectDB/db');
const models = require('./../connectDB/db');



module.exports.getAll = async (req, res, next) => {
    try {
        let condition = {
            userId: req.user.id,
            status: constant[0].VALUE  
        }
        let cart = await orderService.getProductInCart(condition);
        res.json(cart)



        // if (Array.isArray(cart) && cart.length > 0) {
        //     cart = await Promise.all(
        //         cart.map(async (order_detail) => {
        //             let product = await productService.getById(order_detail.product_detail.productId);
        //             product = {
        //                 id: product.id,
        //                 name: product.name,
        //                 price: product.price,
        //                 imageUrl: product.imageUrl ? product.imageUrl.split(';') : null,
        //                 totalSold: product.totalSold,
        //                 code: order_detail.product_detail.code,
        //                 size: order_detail.product_detail.size,
        //                 color: order_detail.product_detail.color,
        //                 quantity: order_detail.product_detail.quantity
        //             }

        //             return {
        //                 id: order_detail.id,
        //                 orderId: order_detail.orderId,
        //                 productDetailId: order_detail.productDetailId,
        //                 quantity: order_detail.quantity,
        //                 status: order_detail.status,
        //                 createdDate: order_detail.createdDate,
        //                 product
        //             }
        //         }))
        //     res.json(responseSuccess(cart))
        // }
        // else {
        //     res.json(responseSuccess([]))
        // }
    }
    catch (err) {
        res.json(responseWithError(err))
    }
}


module.exports.create = async (req, res, next) => {
    try {
        let condition = {
            userId: req.user.id,
            status: constant[0].VALUE
        }
        let checkCart = await orderService.findOne(condition);

        if (checkCart) {
            let checkProduct = await orderDetailService.findOne({
                orderId: checkCart.id,
                productId: req.body.productId,
            });
            if (checkProduct) {
                await orderDetailService.updateByCondition(
                    { quantity: req.body.quantity + checkProduct.quantity },
                    { id: checkProduct.id }
                )
            }
            else {
                await orderDetailService.create({
                    orderId: checkCart.id,
                    ...req.body,
                    status: constant[0].VALUE
                })
            }
        }
        else {
            let cart = await orderService.create({
                userId: req.user.id,
                status: constant[0].VALUE
            });

            await orderDetailService.create({
                orderId: cart.id,
                ...req.body,
                status: constant[0].VALUE
            })

        }
        res.json(responseSuccess())

    }
    catch (err) {
        res.json(responseWithError(err))
    }
}

module.exports.checkOut = async (req, res, next) => {
    const t = await db.sequelize.transaction();
    try {

        // step 1: create new order with status unpaid
        let status = 1;
        let new_order = await models.orders.create({
            userId: req.user.id,
            price: req.body.price,
            status: status
        }, { transaction: t });

        await Promise.all(
            req.body.products.map(async (ele) => {
                await models.order_details.create({
                    orderId: new_order.id,
                    productId: ele.productId,
                    quantity: ele.quantity,
                    status: status
                }, { transaction: t })
                let pro = await models.products.findOne({ where: { id: ele.productId } })
                await models.products.update({ quantity: pro.quantity - ele.quantity }, { where: { id: ele.productId }, transaction: t })
            })
        );

        // step 2: order payment user 
        await models.users.update({ money: req.user.money - req.body.price }, { where: { id: req.user.id }, transaction: t })

        //step 3: update status payment of order
        status = 2;
        await models.orders.update({ status: status }, { where: { id: new_order.id }, transaction: t })
        await models.order_details.update({ status: status }, { where: { orderId: new_order.id }, transaction: t })

        await t.commit();

        res.json(responseSuccess())
    }
    catch (err) {

        console.log(err)
        await t.rollback();
        res.json(responseWithError(err.message))
    }
}


module.exports.getOrdersByStatus = async (req, res, next) => {
    try {
        let condition = {
            status: parseInt(req.query.status)
        }
        if (req.user.type === 'USER') {
            condition.userId = req.user.id
        }
        let order_details = await orderDetailService.getMyOrder(condition)

        let m = new Map();
        for (let order_detail of order_details) {
            let counter = m.get(order_detail.order.id);

            let response_element = {
                id: order_detail.id,
                orderId: order_detail.orderId,
                productDetailId: order_detail.productDetailId,
                quantity: order_detail.quantity,
                status: order_detail.status,
                createdDate: order_detail.createdDate,
                product: {
                    id: order_detail.product_detail.product.id,
                    name: order_detail.product_detail.product.name,
                    price: order_detail.product_detail.product.price,
                    imageUrl: order_detail.product_detail.product.imageUrl ? order_detail.product_detail.product.imageUrl.split(';') : null,
                    totalSold: order_detail.product_detail.product.totalSold,
                    code: order_detail.product_detail.code,
                    size: order_detail.product_detail.size,
                    color: order_detail.product_detail.color,
                    quantity: order_detail.product_detail.quantity

                }
            }
            if (!counter) {
                m.set(order_detail.order.id, [response_element])
            }
            else {
                counter.push(response_element)
                m.set(order_detail.order.id, counter)
            }
        }
        let data = [];
        for (let [key, value] of m) {
            let order_detail = order_details.find(ele => ele.order.id === key);
            console.log()
            let order = {
                ...order_detail.order.dataValues,
                deliveryProgress: order_detail.order.deliveryProgress.split(';').map(ele => JSON.parse(ele))
            }
            data.push({
                ...order,
                orderDetails: value
            })
        }
        res.json(responseSuccess(data))
    }
    catch (err) {
        console.log(err)
        res.json(responseWithError(err))
    }
}



const updateStatus = async (status, orderId) => {
    let order = await orderService.findOne({ id: orderId });
    let deliveryProgress = `${JSON.stringify({ status: order.status, time: new Date() })};${order.deliveryProgress}`;
    return Promise.all([
        orderService.updateByCondition({ status: status, deliveryProgress }, { id: orderId }),
        orderDetailService.updateByCondition({ status: status }, { orderId: orderId })
    ])
}

module.exports.updateStatus = async (req, res, next) => {
    try {
        if (constant[req.body.status].PERMISSION === req.user.type) {
            if (req.body.status === 3) {
                await Promise.all(
                    req.body.orderDetails.map(async (ele) => {
                        await productService.incrementTotalSold(ele.quantity, { id: ele.productId })

                    })
                )
            }
            await updateStatus(req.body.status, parseInt(req.params.orderId))
            res.json(responseSuccess())
        }
        else {
            res.json(responseWithError("YOU CAN NOT ACCESS THIS ROUTE"))
        }

    }
    catch (err) {
        res.json(responseWithError(err))
    }
}
const stats = {
    day: {
        step: 3,
        count: 8,
        stepValue: 'hours'
    },
    week: {
        step: 1,
        count: 7,
        stepValue: 'days'
    },
    month: {
        step: 3,
        count: 10,
        stepValue: 'days'
    },
}
module.exports.statistics = async (req, res, next) => {
    try {

        let dateConditions = [];
        for (let i = 0; i < stats[req.query.q].count; i++) {
            let timeEnd = moment().subtract(stats[req.query.q].step * i, stats[req.query.q].stepValue).format('YYYY-MM-DDThh:mm:ss')
            let timeStart = moment().subtract(stats[req.query.q].step * (i + 1), stats[req.query.q].stepValue).format('YYYY-MM-DDThh:mm:ss')
            dateConditions.push(
                {
                    timeStart: moment.utc(timeStart).toDate(),
                    timeEnd: moment.utc(timeEnd).toDate()
                }
            )
        }
        let data = await Promise.all(
            dateConditions.map(async (date) => {
                let num = await orderDetailService.calcSumByCondition({
                    createdDate: {
                        [Op.between]: [date.timeStart, date.timeEnd]
                    },
                    status: 3
                })
                return {
                    ...date,
                    number: num ? num : 0
                }

            })
        )
        let totalSoldAllProducts = await productService.calcTotalSold();
        data = data.map(ele => {
            return {
                ...ele, totalSold: totalSoldAllProducts
            }
        }
        )
        res.json(responseSuccess(data))
    }
    catch (err) {
        console.log(err)
        res.json(responseWithError(err))
    }
}

const stripe = require('stripe')('sk_test_51JnCLGHHZgJAXgW0FilTG2ffM37O2WdSypyeEcgejMiupnk9pQHlLzbtucaqREcy6SOLqHoW8WF0HEp98dxXYA3H00OSCy9B2R')
module.exports.checkOutStripe = async (req, res, next) => {
    try {
        let line_items = req.body.products.map(ele => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: ele.name
                    },
                    unit_amount: ele.price,
                },
                quantity: ele.quantity
            }
        })
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: 'http://localhost:3000/cart/check-out/success',
            cancel_url: 'http://localhost:3000/cart/check-out/cancel',
        });
        res.json(responseSuccess(session))

    }
    catch (err) {
        res.json(responseWithError(err))
    }
}
module.exports.getResultCheckOut = async (req, res, next) => {
    try {
        let result = req.params.result;
        if (result === 'success')
            res.json(responseSuccess())
        else
            res.json(responseWithError())
    }
    catch (err) {
        res.json(responseWithError(err))
    }
}
