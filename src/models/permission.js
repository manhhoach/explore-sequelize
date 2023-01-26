"use strict";

module.exports = (sequelize, DataTypes) => {
    
    const permission = sequelize.define('permission', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER(4)
        },
        name: {
            type: DataTypes.STRING(100),
        },
        createdDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });


    return permission;
}