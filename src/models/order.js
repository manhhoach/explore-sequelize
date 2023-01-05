"use strict";

module.exports = (sequelize, DataTypes) => {
    const user=require('./user')(sequelize, DataTypes)
    const order = sequelize.define('order', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER(4)
        },
        userId: {
            type: DataTypes.INTEGER(4)
        },
        price:{
            type: DataTypes.INTEGER(32)
        },
        status:{
            type: DataTypes.INTEGER(4),
            defaultValue:0
        },
        createdDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });
    user.hasMany(order, {foreignKey: 'userId'});
    order.belongsTo(user);


    return order;
}