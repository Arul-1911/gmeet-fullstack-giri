const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const routes = require('./routes');
const cors = require('cors');

//middleware
app.use(cors());



app.use(express.json());
app.use('/api',routes);




//connecting to mongodb
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("Database connected");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}
connectToDatabase(); // calling the connection function

//app listining port
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
