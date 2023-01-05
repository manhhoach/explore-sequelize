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

//db.products.sync({alter: true})

module.exports = db;