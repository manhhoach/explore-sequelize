"use strict";

module.exports = (sequelize, DataTypes) => {
    const module = sequelize.define('module', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER(4)
        },  
        name:{
            type: DataTypes.STRING(100),
        },
        createdDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });    

    return module;
}