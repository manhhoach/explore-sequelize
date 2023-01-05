const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const { sequelize } = require('./connectDB/db')
const route = require('./routes')
require('dotenv').config();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.send('Welcome')
})

app.use(route)



app.listen(port, async () => {
  console.log(`Example app listening on http://localhost:${port}`)
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})