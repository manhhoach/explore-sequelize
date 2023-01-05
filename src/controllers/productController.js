const productService = require('./../services/productService')

const orderDetailService = require('./../services/orderDetailService')

const { responseSuccess, responseWithError } = require('./../utils/response')
const { getPagingData, getPagination } = require('./../utils/pagination');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

const responseProduct = (data) => {
    let product;
    if (data) {
        if (data.length > 0) {
            product = data.map(ele => {
                let prd = { ...ele.dataValues };
                if (prd.imageUrl)
                    prd.imageUrl = prd.imageUrl.split(';')
                return prd;
            })
        }
        else {
            product = { ...data.dataValues }
            if (product.imageUrl)
                product.imageUrl = product.imageUrl.split(';')
        }
    }
    return product;
}

module.exports.getAllPaging = async (req, res, next) => {
    try {
        const page_index = parseInt(req.query.page_index);
        const page_size = parseInt(req.query.page_size);
        const { limit, offset } = getPagination(page_index, page_size);
        let condition = {}, conditionCategory = {};
        let data = {
            limit: limit,
            offset: offset
        };
        if (req.query.categoryId) {
            conditionCategory = {
                [Op.or]: [{ id: parseInt(req.query.categoryId) }, { parentId: parseInt(req.query.categoryId) }]
            }
        }
        if (req.query.sort) {
            if (req.query.sort.startsWith('-')) {
                let columnName = req.query.sort.split('-')[1];
                data.order = [[columnName, 'DESC']]
            }
            else {
                data.order = [[req.query.sort, 'ASC']]
            }
        }
        else {
            data.order = [['createdDate', 'DESC']];
        }
        if (req.query.name) {
            condition.name = sequelize.where(sequelize.fn('LOWER', sequelize.col('product.name')), 'LIKE', '%' + req.query.name.toLowerCase() + '%')
        }
        if (req.query.price_start && req.query.price_end) {
            condition.price = {
                [Op.between]: [
                    parseInt(req.query.price_start),
                    parseInt(req.query.price_end)
                ]
            }
        }
        else if (req.query.price_start) {
            condition.price = {
                [Op.gte]: parseInt(req.query.price_start)
            }
        }
        else if (req.query.price_end) {
            condition.price = {
                [Op.lte]: parseInt(req.query.price_end)
            }
        }

        data.condition = condition;

        let products = await productService.getAllPaging(data, conditionCategory);

        products.rows = responseProduct(products.rows)

        let response = getPagingData(products, page_index, limit);
        res.json(responseSuccess(response));

    }
    catch (err) {
        res.json(responseWithError(err))
    }
}

module.exports.create = async (req, res, next) => {
    try {
        let productDetails = req.body.productDetails;
        if (req.body.imageUrl && req.body.imageUrl.length > 0) {
            req.body.imageUrl = req.body.imageUrl.join(";");
        }

        let product = await productService.create(req.body);

        let product_details = [];
        productDetails = productDetails.map(ele => {
            ele.details.map(detail => {
                product_details.push({
                    productId: product.id,
                    size: ele.size,
                    ...detail
                })
            })
        })

        product = responseProduct(product)
        res.json(responseSuccess(product));
    }
    catch (err) {
        res.json(responseWithError(err))
    }
}

module.exports.getById = async (req, res, next) => {
    try {
        let data = await productService.getById(req.params.id);

        res.json(responseSuccess(data))
    }
    catch (err) {
        res.json(responseWithError(err))
    }
}

module.exports.delete = async (req, res, next) => {
    try {
        await Promise.all([
            productService.destroyByCondition({
                id: { [Op.in]: req.body.id }
            }),

            orderDetailService.destroyByConditionUpgrade({ productId: { [Op.in]: req.body.id } })
        ])
        res.json(responseSuccess("PRODUCT DELETE SUCCESSFUL"));
    }
    catch (err) {
        res.json(responseSuccess("PRODUCT DELETE SUCCESSFUL"));
    }
}
const models = require('./../connectDB/db');
module.exports.update = async (req, res, next) => {
    try {
        let product = await models.products.findOne({ where: { id: req.params.id } })
        await models.products.update({ quantity: product.quantity - req.body.quantity }, {
            where: { id: req.params.id }
        })
        res.json(responseSuccess('PRODUCT UPDATE SUCCESSFUL'))
    }
    catch (err) {
        res.json(responseWithError(err))
    }
}
