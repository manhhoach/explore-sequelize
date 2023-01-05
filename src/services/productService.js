const models=require('./../connectDB/db');
const sequelize=require('sequelize');

module.exports.getAllPaging=async(data, conditionCategory)=>{
   
    return models.products.findAndCountAll({
        where: data.condition,
        limit: data.limit,
        offset: data.offset,
        order: data.order,
        include:{
            model: models.categories,
            where: conditionCategory,
            attributes: []
        }
    });
}

module.exports.getAll=async(data, conditionCategory)=>{
   
    return models.products.findAll({
        where: data.condition,
        limit: data.limit,
        offset: data.offset,
        order: data.order,
        include:{
            model: models.categories,
            where: conditionCategory,
            attributes: []
        }
    });
}
module.exports.create=async(data)=>{
    return models.products.create(data);
}

module.exports.updateByCondition= async (data, condition) => {
    return models.products.update(data,{where: condition})
}

module.exports.destroyByCondition= async (condition) => {
    return models.products.destroy({where: condition})
}

module.exports.getByCondition= async(condition) => {
    return models.products.findAll({where: condition})
}
module.exports.getById= async(id) => {
    return models.products.findOne({where: {id: id}})
}

module.exports.incrementTotalSold=(number, condition)=>{
    return models.products.increment({totalSold: number}, {
        where: condition
    })
}

module.exports.calcTotalSold=()=>{
    return models.products.sum('totalSold');
}

// module.exports.incrementTotalSold=(number, condition)=>{
//     return models.products.update({totalSold: sequelize.literal(`totalSold + ${number}`)}, {
//         include: {
//             model: models.product_details,
//             where: condition
//         }
//     })
// }