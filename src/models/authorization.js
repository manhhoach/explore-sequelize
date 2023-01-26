"use strict";


module.exports = async (sequelize, DataTypes) => {
    
    const module = require('./module')(sequelize, DataTypes)
    const permission = require('./permission')(sequelize, DataTypes)
    const role = require('./role')(sequelize, DataTypes)
    const authorization = sequelize.define('authorization', {
        moduleId: {
            type: DataTypes.INTEGER(4),
            ref: {
                model: module,
                key: 'id'
            }
        },
        roleId: {
            type: DataTypes.INTEGER(4),
            ref: {
                model: role,
                key: 'id'
            }
        },
        permissionId: {
            type: DataTypes.INTEGER(4),
            ref: {
                model: permission,
                key: 'id'
            }
        },
        createdDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    authorization.belongsTo(module, { foreignKey: 'moduleId' });
    authorization.belongsTo(permission, { foreignKey: 'permissionId' });
    authorization.belongsTo(role, { foreignKey: 'roleId' });

    module.hasMany(authorization, { foreignKey: 'moduleId' });
    permission.hasMany(authorization, { foreignKey: 'permissionId' });
    role.hasMany(authorization, { foreignKey: 'roleId' });

    

    return authorization;
}