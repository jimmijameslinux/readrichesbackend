require('dotenv').config();
const express = require('express');
// const mongoose = require('mongoose');
const app = express();
require('./db/connection');
// const User = require('./models/userSchema');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const path = require('path');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log(path.join(__dirname, 'uploads'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// // login
// app.post('/login', async (req, res) => {
//   try {
//     // Validate input
//     if (!req.body.email || !req.body.password) {
//       return res.status(400).json({ error: 'Email and password are required.' });
//     }

//     // Find the user by email
//     const user = await User.findOne({ email: req.body.email });

//     // If the user is not found, return a 404 Not Found response
//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     // Compare the input password with the hashed password
//     const passwordMatch = await bcrypt.compare(req.body.password, user.password);

//     // If the passwords don't match, return a 401 Unauthorized response
//     if (!passwordMatch) {
//       return res.status(401).json({ error: 'Incorrect password.' });
//     }

//     // Send a 200 OK response
//     res.json({ message: 'Login successful!' });
//   } catch (error) {
//     // Handle errors
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // signup or login with google
// app.post('/google', async (req, res) => {
//   try {
//     // Validate input
//     if (!req.body.email) {
//       return res.status(400).json({ error: 'Email is required.' });
//     }

//     // Check if the user already exists
//     const existingUser = await User.findOne({ email: req.body.email });

//     if (!existingUser) {
//       // If the user doesn't exist, create a new User instance
//       let newUser = new User();

//       // Set the email (you might want to set other fields based on Google data)
//       newUser.email = req.body.email;

//       // Save the new user to the database
//       const doc = await newUser.save();

//       // Send the saved user document as a JSON response for signup
//       return res.json(doc);
//     }

//     // If the user already exists, log them in
//     // You might want to perform additional login logic here if needed

//     // Send a 200 OK response for login
//     res.json({ message: 'Login successful!' });

//   } catch (error) {
//     // Handle errors, for example, send a 500 Internal Server Error response
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


