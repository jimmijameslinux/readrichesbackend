require('dotenv').config();
const express = require('express');
// const mongoose = require('mongoose');
const app = express();
require('./db/connection');
// const User = require('./models/userSchema');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router');
// const path = require('path');

const port = process.env.PORT || 3001;



// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect("mongodb+srv://readrichesdb:readrichesdb@readriches.npmuuhx.mongodb.net/?retryWrites=true&w=majority");
//   // await mongoose.connect("mongodb://localhost:27017/readrichesdb");
//   console.log("Connected to DB")

// }


app.use(cors());
app.use(bodyParser.json());
app.use(router);
app.use('/uploads', express.static("./uploads"));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




