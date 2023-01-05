"use strict";

module.exports = (sequelize, DataTypes) => {
    const product = sequelize.define('product', {  
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER(4)
        },   
        name: {
            type: DataTypes.STRING(1024)
        },
        price: { 
            type: DataTypes.INTEGER(32)      
        },
        quantity:{
            type: DataTypes.INTEGER(4),
        },
        totalSold:{
            type: DataTypes.INTEGER(4),
            defaultValue: 0
        },
        createdDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },{
        timestamps: false  
    });

    product.afterValidate((instance, options)=>{
        if(instance.quantity<0)
           throw new Error('Quantity must be greater than 0')
    })

    return product;
}