const { Sequelize, DataTypes } = require('sequelize');
let db = {};
require('dotenv').config({})

let DB_DBNAME = process.env.DB_DBNAME || 'demo-transaction';
let DB_USERNAME = process.env.DB_USERNAME || 'root';
let DB_PASSWORD = process.env.DB_PASSWORD || null ;
let DB_HOST = process.env.DB_HOST || 'localhost';
let DB_DIALECT = process.env.DB_DIALECT || 'mysql';
let DB_PORT = process.env.DB_PORT || '3306';


const sequelize = new Sequelize(DB_DBNAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    port: DB_PORT,
    timezone: "+07:00",
    define: {
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    },
});




db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.products = require('../models/product')(sequelize, DataTypes)
db.users = require('../models/user')(sequelize, DataTypes)
db.orders = require('../models/order')(sequelize, DataTypes)
db.order_details = require('../models/order_detail')(sequelize, DataTypes)

db.modules=require('../models/module')(sequelize, DataTypes)
db.permissions=require('../models/permission')(sequelize, DataTypes)
db.roles=require('../models/role')(sequelize, DataTypes)
db.authorizations=require('../models/authorization')(sequelize, DataTypes)


db.orders.hasMany(db.order_details);
db.order_details.belongsTo(db.orders);

db.order_details.belongsTo(db.products)
db.products.hasMany(db.order_details);


// db.orders.sync({alter: true})
// db.order_details.sync({alter: true})




// const queryInterface = sequelize.getQueryInterface();
// sequelize.sync({alter: true}).then(()=>{
//     return queryInterface.addConstraint('tests',  {
//         fields:['moduleId', 'permissionId', 'roleId'],
//         type: 'unique',
//         name: 'custom_unique_constraint'
//     });
// })

module.exports = db;