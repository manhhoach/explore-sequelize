"use strict";

module.exports = (sequelize, DataTypes) => {
    const role = sequelize.define('role', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER(4)
        },
        name: {
            type: DataTypes.STRING(255)
        },
        createdDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    
    return role;
}