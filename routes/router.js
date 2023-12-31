const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const User = require('../models/userSchema');
const Card = require('../models/cardSchema');


// router.get('/', (req, res) => {
//     console.log("hello");
// });


router.post('/signup', async (req, res) => {
    try {
        // Validate input
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists.' });
        }

        // Create a new User instance
        let user = new User();

        // Set the email and hash the password
        user.email = req.body.email;
        user.password = await bcrypt.hash(req.body.password, 10);

        // Save the user to the database
        const doc = await user.save();

        // Send the saved user document as a JSON response
        res.json(doc);
    } catch (error) {
        // Handle errors, for example, send a 500 Internal Server Error response
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const storage = multer.diskStorage({
    destination: 'uploads/',
    // 
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });

router.post('/dashboard', upload.fields([{ name: 'logoimage', minCount: 1 }, { name: 'mainimage', minCount: 1 }]), async (req, res) => {
    let card = new Card();
    card.company_name = req.body.company_name;
    card.title = req.body.title;
    card.category = req.body.category;
    card.logoimage = 'uploads/' + req.files['logoimage'][0].filename; // Store the filename in the database
    card.mainimage = 'uploads/' + req.files['mainimage'][0].filename;
    card.first_color = req.body.first_color;
    card.second_color = req.body.second_color;

    const doc = await card.save();

    // console.log(doc);
    // console.log(doc.logoimage)
    res.json(doc);
});

router.get('/dashboard', async (req, res) => {
    const docs = await Card.find({});
    res.json(docs);
});

router.delete('/dashboard/:id', async (req, res) => {
    const doc = await Card.findByIdAndDelete(req.params.id);
    res.json(doc);
});

router.put('/dashboard/:id', upload.fields([{ name: 'logoimage', minCount: 1 }, { name: 'mainimage', minCount: 1 }]), async (req, res) => {
    try {
        const updateFields = {
            ...(req.body.company_name && { company_name: req.body.company_name }),
            ...(req.body.title && { title: req.body.title }),
            ...(req.body.category && { category: req.body.category }),
            ...(req.files && req.files['logoimage'] && { logoimage: 'uploads/' + req.files['logoimage'][0].filename }),
            ...(req.files && req.files['mainimage'] && { mainimage: 'uploads/' + req.files['mainimage'][0].filename }),
            ...(req.body.first_color && { first_color: req.body.first_color }),
            ...(req.body.second_color && { second_color: req.body.second_color }),
        };

        const doc = await Card.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });

        if (!doc) {
            // Card not found
            return res.status(404).json({ error: 'Card not found.' });
        }

        // Successfully updated
        res.json(doc);
    } catch (error) {
        // Handle other errors
        console.error('Error updating card:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;