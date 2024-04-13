const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const textflow = require('textflow.js')

// payment
require("dotenv").config();
// const express = require("express");
const Razorpay = require("razorpay");

// aws thing
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const NormalUser = require('../models/userSchema');
const GoogleUser = require('../models/userSchema');
// const UserProfilecreate = require('../models/userSchema');
const Card = require('../models/cardSchema');
const userDashboard = require('../models/userSchema');
const userSubscriptions = require('../models/userSchema');
// ----------------------------

// router.get('/', (req, res) => {
//     console.log("hello");
// });
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
let otp = null;
let userinputotp = null;
let verified = false;

router.post('/signup', async (req, res) => {
    try {
        console.log(req.body);
        // Validate input
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Check if the email already exists
        const existingUser = await NormalUser.User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists.' });
        }

        // Create a new User instance
        let user = new NormalUser.User();

        // Create a new userdashboard instance
        let userdashboard = new userDashboard.UserDashboard();

        // Set the email and hash the password
        user.email = req.body.email;
        user.password = await bcrypt.hash(req.body.password, 10);
        // loginStatus
        user.loginStatus = false;
        // creditscore
        user.creditscore = 2;

        
        otp = generateOTP()

        sendOtpEmail(req.body.email, otp);
        // Save the user to the database
        if(verified===true){
        const doc = await user.save();
        res.json(doc);

        }
        // Set the user id and card id
        // userdashboard.user = doc._id;
        // userdashboard.card = cardid;

        // otp
 
        // Save the userdashboard to the database
        

        // if otp generated redirect to otp input page and if otp is coorect then 
        // if(req.body.otp==otp){
        // const doc2 = await userdashboard.save();
        // res.json(doc2);

        // }


        // Send the saved user document as a JSON response
        // res.json(doc);

        // Send the welcome email
        // sendWelcomeEmail(req.body.email);
    } catch (error) {
        // Handle errors, for example, send a 500 Internal Server Error response
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/userprofile/:id',
    async (req, res) => {
        try {
            const user = await GoogleUser.User_2.findById(req.params.id) || await NormalUser.User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            console.log(req.body.name);

            // if (req.file) {
            //     const uploadToS3 = (params, buffer) => {
            //         return new Promise((resolve, reject) => {
            //             s3.upload(params, (err, data) => {
            //                 if (err) {
            //                     console.error(`Error uploading ${params.Key}:`, err);
            //                     reject(err);
            //                 } else {
            //                     console.log(`${params.Key} uploaded:`, data.Location);
            //                     resolve(data.Location);
            //                 }
            //             });
            //         });
            //     }

            //     const profileImageParams = { Bucket: 'readriches.com', Key: 'Readriches/present/profile/' + req.file.originalname, Body: req.file.buffer };
            //     const profileImageUrl = await uploadToS3(profileImageParams, req.file.buffer);
            //     user.profileimage = 'https://d3adsj07fvh2eo.cloudfront.net/Readriches/present/profile/' + req.file.originalname;
            // }

            if (req.body.name) {
                user.name = req.body.name;
            }
            // if(req.body.email){
            //     user.email = req.body.email;
            // }
            if (req.body.picture) {
                user.picture = req.body.picture;
            }

            const update = {
                // ...(req.file && { profileimage: user.profileimage }),
                ...(req.body.name && { name: user.name }),
                // ...(req.body.email && { email: user.email }),
                ...(req.body.picture && { picture: user.picture }),
            }

            const doc = await GoogleUser.User_2.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }) || await NormalUser.User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
            res.json(doc);
            console.log(doc);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: error.message });
        }
    });

// Define a function to send the welcome email
const sendWelcomeEmail = (email) => {
    // Create a transporter object
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'readriches@gmail.com',
            pass: 'mvig jmmq nvgu wzpf'
        }
    });

    // Define the email options
    let mailOptions = {
        from: 'readriches@gmail.com',
        to: email, // Use the email parameter passed to the function
        subject: 'Welcome to ReadRiches',
        html: `
      <!DOCTYPE html>
      <html lang="en">
  
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Open+Sans:wght@400&display=swap"
              rel="stylesheet">
          <style>
              /* Your CSS styles */
          </style>
      </head>
  
      <body>
          <div class="container">
              <img class="logo" src="https://media.discordapp.net/attachments/1213053824399450113/1213114025584365618/Screenshot_2024-03-01_144932.png?ex=65f44b7a&is=65e1d67a&hm=8fb09fcf20d38e8f783301092f8a7df06e9253d874f1a461f4ed81ca4a1ae7ae&=&format=webp&quality=lossless&width=631&height=593" alt="Logo" style="max-width: 200px;">
              <h1>Welcome to ReadRiches</h1>
              <hr>
              <p>
                  Dear ${email}<br><br>
                  Thank you for joining us on this business and finance reading adventure. We're excited to have you with us!<br><br>
                  Best regards,<br>
                  ReadRiches Team
              </p>
  
              <img class="image" src="https://media.discordapp.net/attachments/1213053824399450113/1213115528487374938/Screenshot_2024-03-01_185740.png?ex=65f44ce0&is=65e1d7e0&hm=94a7820636b390b5c7eed2780c92d8ceab9234f37703b59e88d44def2ebbef91&=&format=webp&quality=lossless&width=687&height=276" alt="undraw-reading-list-4boi" border="0">
              <div class="footer">
                  <p>
                      This is an automatically generated email. Please do not reply to this email.
                  </p>
                  <p>
                      For any inquiries or support, please contact us at <a
                          href="mailto:ReadRiches@gmail.com">ReadRiches@gmail.com</a>
                  </p>
                  <p>
                      © 2024 ReadRiches. All rights reserved.
                  </p>
              </div>
          </div>
      </body>
  
      </html>
      `
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Error occurred:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};



// Multer storage for general file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Multer storage for video uploads
const storageVideo = multer.memoryStorage();
const uploadVideo = multer({
    storage: storageVideo,
    fileFilter: (req, file, cb) => {
        const acceptedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/3gpp', 'video/3gpp2', 'video/avi', 'video/mpeg', 'video/ogg', 'video/x-matroska', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/3gpp', 'video/3gpp2', 'video/avi', 'video/mpeg', 'video/ogg', 'video/x-matroska'];

        if (!acceptedVideoTypes.includes(file.mimetype)) {
            return cb(new Error('Only video files are allowed!'), false);
        }

        cb(null, true);
    }
});

// Combined route handler for uploading logo, main images, and videos
router.post('/dashboard', upload.fields([{ name: 'logoimage', maxCount: 1 }, { name: 'mainimage', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        // Check if files are provided
        if (!req.files || !req.files['logoimage'] || !req.files['mainimage'] || !req.files['video']) {
            return res.status(400).json({ error: 'Logo image, main image, and video are required.' });
        }

        // Upload logo image and main image to S3
        const uploadToS3 = (params, buffer) => {
            return new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                    if (err) {
                        console.error(`Error uploading ${params.Key}:`, err);
                        reject(err);
                    } else {
                        console.log(`${params.Key} uploaded:`, data.Location);
                        resolve(data.Location);
                    }
                });
            });
        };

        const logoImageParams = {
            Bucket: 'readriches.com',
            Key: 'Readriches/present/logo/' + req.files['logoimage'][0].originalname,
            Body: req.files['logoimage'][0].buffer
        };
        const mainImageParams = { Bucket: 'readriches.com', Key: 'Readriches/present/bgimage/' + req.files['mainimage'][0].originalname, Body: req.files['mainimage'][0].buffer };

        //  logo image url format https://d3adsj07fvh2eo.cloudfront.net/Readriches/present/logo/logoimage-1709294752251.png

        const logoImageUrl = await uploadToS3(logoImageParams, req.files['logoimage'][0].buffer);
        const mainImageUrl = await uploadToS3(mainImageParams, req.files['mainimage'][0].buffer);

        const newlogoImageUrl = 'https://d3adsj07fvh2eo.cloudfront.net/Readriches/present/logo/' + req.files['logoimage'][0].originalname;
        const newmainImageUrl = 'https://d3adsj07fvh2eo.cloudfront.net/Readriches/present/bgimage/' + req.files['mainimage'][0].originalname;
        console.log(logoImageUrl, mainImageUrl);
        // Upload video to S3
        const videoParams = { Bucket: 'readriches.com', Key: 'Readriches/present/video/' + req.files['video'][0].originalname, Body: req.files['video'][0].buffer };
        const videoUrl = await uploadToS3(videoParams, req.files['video'][0].buffer);

        const newvideoUrl = 'https://d3adsj07fvh2eo.cloudfront.net/Readriches/present/video/' + req.files['video'][0].originalname;
        console.log(videoUrl);

        // Create a new card instance
        const card = new Card({
            company_name: req.body.company_name,
            title: req.body.title,
            category: req.body.category,
            logoimage: newlogoImageUrl,
            mainimage: newmainImageUrl,
            first_color: req.body.first_color,
            second_color: req.body.second_color,
            video: newvideoUrl
        });

        // Save the card to the database
        const doc = await card.save();
        res.json(doc);
    } catch (error) {
        // Handle errors
        console.error('Error creating card:', error);
        res.status(500).json({ error: error.message });
    }
});


// let cardid = null;

router.get('/dashboard', async (req, res) => {
    const docs = await Card.find({});
    // if (docs && docs.length > 0) {
    //     cardid = docs[0]._id;
    // }
    res.json(docs);
});


router.delete('/dashboard/:id', async (req, res) => {
    const doc = await Card.findByIdAndDelete(req.params.id);
    await userDashboard.UserDashboard.findOneAndDelete(req.params.card);
    res.json(doc);
});

router.put('/dashboard/:id', upload.fields([{ name: 'logoimage', minCount: 1 }, { name: 'mainimage', minCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    // if any field is updated not all fields are required
    try {
        const card = await Card.findById(req.params.id);


        if (!card) {
            return res.status(404).json({ error: 'Card not found.' });
        }

        const uploadToS3 = (params, buffer) => {
            return new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                    if (err) {
                        console.error(`Error uploading ${params.Key}:`, err);
                        reject(err);
                    } else {
                        console.log(`${params.Key} uploaded:`, data.Location);
                        resolve(data.Location);
                    }
                });
            });
        }

        if (req.files['logoimage']) {
            const logoImageParams = {
                Bucket: 'readriches.com',
                Key: 'Readriches/present/logo/' + req.files['logoimage'][0].originalname,
                Body: req.files['logoimage'][0].buffer
            };
            const logoImageUrl = await uploadToS3(logoImageParams, req.files['logoimage'][0].buffer);
            card.logoimage = 'https://d3adsj07fvh2eo.cloudfront.net/Readriches/present/logo/' + req.files['logoimage'][0].originalname;
        }

        if (req.files['mainimage']) {
            const mainImageParams = { Bucket: 'readriches.com', Key: 'Readriches/present/bgimage/' + req.files['mainimage'][0].originalname, Body: req.files['mainimage'][0].buffer };
            const mainImageUrl = await uploadToS3(mainImageParams, req.files['mainimage'][0].buffer);
            card.mainimage = 'https://d3adsj07fvh2eo.cloudfront.net/Readriches/present/bgimage/' + req.files['mainimage'][0].originalname;
        }

        if (req.files['video']) {
            const videoParams = { Bucket: 'readriches.com', Key: 'Readriches/present/video/' + req.files['video'][0].originalname, Body: req.files['video'][0].buffer };
            const videoUrl = await uploadToS3(videoParams, req.files['video'][0].buffer);
            card.video = 'https://d3adsj07fvh2eo.cloudfront.net/Readriches/present/video/' + req.files['video'][0].originalname;
        }

        if (req.body.company_name) {
            card.company_name = req.body.company_name;
        }

        if (req.body.title) {
            card.title = req.body.title;
        }

        if (req.body.category) {
            card.category = req.body.category;
        }

        if (req.body.first_color) {
            card.first_color = req.body.first_color;
        }

        if (req.body.second_color) {
            card.second_color = req.body.second_color;
        }

        const update = {
            ...(req.files['logoimage'] && { logoimage: card.logoimage }),
            ...(req.files['mainimage'] && { mainimage: card.mainimage }),
            ...(req.files['video'] && { video: card.video }),
            ...(req.body.company_name && { company_name: card.company_name }),
            ...(req.body.title && { title: card.title }),
            ...(req.body.category && { category: card.category }),
            ...(req.body.first_color && { first_color: card.first_color }),
            ...(req.body.second_color && { second_color: card.second_color })
        }

        const doc = await Card.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
        // if (doc && doc.length > 0) {
        //     cardid = req.params.id;
        // }
        res.json(doc);
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/creditscore/:id', async (req, res) => {
    try {
        const user = await GoogleUser.User_2.findById(req.params.id) || await NormalUser.User.findById(req.params.id);

        if (!user) {
            // User not found
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if creditscore is greater than 0
        const doc = await GoogleUser.User_2.findByIdAndUpdate(req.params.id,
            {
                $inc:
                    { creditscore: -1 }
            },
            { new: true }) || await NormalUser.User.findByIdAndUpdate(req.params.id,
                {
                    $inc:
                        { creditscore: -1 }
                },
                { new: true })
            ;
        // Successfully updated
        return res.json(doc);


    } catch (error) {
        // Handle other errors
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// router.put('/creditscore/:id', async (req, res) => {
//     try {
//         const userdash = await userDashboard.UserDashboard.find({ user: req.params.id });
//         if (!userdash) {
//             return res.status(404).json({ error: 'User not found.' });
//         }

//         // if(req.body.progress)
//         // {
//         //     const doc = await userDashboard.UserDashboard.findByIdAndUpdate(userdash[0]._id, 
//         //         { $set: 
//         //             { progressvalue: req.body.progress } 
//         //         }, 
//         //         { new: true });
//         //     // Successfully updated
//         //     return res.json(doc);
//         // }
//         return res.json(userdash);

//     } catch (error) {
//         // Handle other errors
//         console.error('Error updating user:', error);
//         res.status(500).json({ error: 'Internal server error.' });
//     }
// });

// signup or login with google
router.post('/google', async (req, res) => {
    try {
        // Validate input
        if (!req.body.email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        // Check if the user already exists
        const existingUser = await GoogleUser.User_2.findOne({ email: req.body.email });

        if (!existingUser) {
            // If the user doesn't exist, create a new User instance
            let newUser = new GoogleUser.User_2();

            // create a new userdashboard instance
            // let userdashboard = new userDashboard.UserDashboard();

            // Set the name (you might want to set other fields based on Google data)
            newUser.name = req.body.name;

            // Set the email (you might want to set other fields based on Google data)
            newUser.email = req.body.email;

            // set the google picture
            newUser.picture = req.body.picture;

            // set the creditscore
            newUser.creditscore = 2;

            // set the loginStatus
            newUser.loginStatus = true;

            newUser.newname = null;

            // userdashboard.user = newUser._id;
            // userdashboard.card = cardid;
            // newUser.newpicture = null;
            // Save the new user to the database
            const existingUser = await newUser.save();

            // // Save the userdashboard to the database
            // const doc2 = await userdashboard.save();

            //send welcome email

            // Send the saved user document as a JSON response for signup
            // console.log(req.body.name);




            // sendWelcomeGEmail(req.body.email, req.body.name);



            // existingUser.loginStatus = true;
            // await existingUser.save();
            return res.json(existingUser);
        }

        // If the user already exists, update login status
        existingUser.loginStatus = true;
        await existingUser.save();

        // Send a 200 OK response for login
        return res.json(existingUser);


    } catch (error) {
        // Handle errors, for example, send a 500 Internal Server Error response
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// login
router.post('/login', async (req, res) => {
    try {
        // Validate input
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find the user by email
        const user = await NormalUser.User.findOne({ email: req.body.email });

        // If the user is not found, return a 404 Not Found response
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Compare the input password with the hashed password
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        // If the passwords don't match, return a 401 Unauthorized response
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        // Send a 200 OK response
        res.json(user);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Define a function to send the welcome email
const sendWelcomeGEmail = (email, name) => {
    // Create a transporter object
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'readriches@gmail.com',
            pass: 'mvig jmmq nvgu wzpf'
        }
    });

    // Define the email options
    let mailOptions = {
        from: 'readriches@gmail.com',
        to: email, // Use the email parameter passed to the function
        subject: 'Welcome to ReadRiches',
        html: `
      <!DOCTYPE html>
      <html lang="en">
  
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Open+Sans:wght@400&display=swap"
              rel="stylesheet">
          <style>
              /* Your CSS styles */
          </style>
      </head>
  
      <body>
          <div class="container">
              <img class="logo" src="https://media.discordapp.net/attachments/1213053824399450113/1213114025584365618/Screenshot_2024-03-01_144932.png?ex=65f44b7a&is=65e1d67a&hm=8fb09fcf20d38e8f783301092f8a7df06e9253d874f1a461f4ed81ca4a1ae7ae&=&format=webp&quality=lossless&width=631&height=593" alt="Logo" style="max-width: 200px;">
              <h1>Welcome to ReadRiches</h1>
              <hr>
              <p>
                  Dear ${name}<br><br>
                  Thank you for joining us on this business and finance reading adventure. We're excited to have you with us!<br><br>
                  Best regards,<br>
                  ReadRiches Team
              </p>
  
              <img class="image" src="https://media.discordapp.net/attachments/1213053824399450113/1213115528487374938/Screenshot_2024-03-01_185740.png?ex=65f44ce0&is=65e1d7e0&hm=94a7820636b390b5c7eed2780c92d8ceab9234f37703b59e88d44def2ebbef91&=&format=webp&quality=lossless&width=687&height=276" alt="undraw-reading-list-4boi" border="0">
              <div class="footer">
                  <p>
                      This is an automatically generated email. Please do not reply to this email.
                  </p>
                  <p>
                      For any inquiries or support, please contact us at <a
                          href="mailto:ReadRiches@gmail.com">ReadRiches@gmail.com</a>
                  </p>
                  <p>
                      © 2024 ReadRiches. All rights reserved.
                  </p>
              </div>
          </div>
      </body>
  
      </html>
      `
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Error occurred:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// contact to admin

// Endpoint to handle form submission
router.post('/contact', async (req, res) => {

    const { name, email, phone, message } = req.body;
    console.log(email);
    console.log(req.body.email)

    // Validate form data
    if (!name || !email || !message || !phone) {
        return res.status(400).json({ message: 'Name, email, and message are required fields.' });
    }

    // Create transporter for sending emails
    const transporter = nodemailer.createTransport({
        // You need to provide your SMTP configuration here
        // Example using Gmail:
        service: 'gmail',
        auth: {
            user: 'readriches@gmail.com',
            pass: 'mvig jmmq nvgu wzpf'
        },
    });

    try {
        // Send email
        await transporter.sendMail({
            from: req.body.email, // Your Gmail address
            to: 'readriches@gmail.com', // Recipient email address
            subject: 'New Contact Form Submission',
            html: `<p>Name: ${name}</p>
      <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>
      <p>Message: ${message}</p>`,
        });

        res.status(200).json({ message: 'Form submitted successfully.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'An error occurred while sending the email.' });
    }
});

const sendOtpEmail = (email, otp) => {
    // Create a transporter object
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'readriches@gmail.com',
            pass: 'mvig jmmq nvgu wzpf'
        }
    });

    // Define the email options
    let mailOptions = {
        from: 'readriches@gmail.com',
        to: email, // Use the email parameter passed to the function
        subject: 'Welcome to ReadRiches',
        html: `
 <!DOCTYPE html>
 <html lang="en">

 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Open+Sans:wght@400&display=swap"
         rel="stylesheet">
     <style>
         /* Your CSS styles */
     </style>
 </head>

 <body>
     <div class="container">
         <img class="logo" src="https://media.discordapp.net/attachments/1213053824399450113/1213114025584365618/Screenshot_2024-03-01_144932.png?ex=65f44b7a&is=65e1d67a&hm=8fb09fcf20d38e8f783301092f8a7df06e9253d874f1a461f4ed81ca4a1ae7ae&=&format=webp&quality=lossless&width=631&height=593" alt="Logo" style="max-width: 200px;">
         <h1>Welcome to ReadRiches</h1>
         <hr>
         <p>
             Dear ${email}<br><br>
             Your OTP is ${otp}<br><br>
             Best regards,<br>
             ReadRiches Team
         </p>

         <img class="image" src="https://media.discordapp.net/attachments/1213053824399450113/1213115528487374938/Screenshot_2024-03-01_185740.png?ex=65f44ce0&is=65e1d7e0&hm=94a7820636b390b5c7eed2780c92d8ceab9234f37703b59e88d44def2ebbef91&=&format=webp&quality=lossless&width=687&height=276" alt="undraw-reading-list-4boi" border="0">
         <div class="footer">
             <p>
                 This is an automatically generated email. Please do not reply to this email.
             </p>
             <p>
          For any inquiries or support, please contact us at <a
          href="mailto:ReadRiches@gmail.com">ReadRiches@gmail.com</a>
  </p>
  <p>
      © 2024 ReadRiches. All rights reserved.
  </p>
</div>
</div>
</body>
</html>

`
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Error occurred:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};



// payment

router.post("/orders", async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: req.body.amount * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_74394",
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});


// otp----------------------------

// const otpapi = 'SUkQ5COAVD0W5opwBN9O5V4ZIeYFckTqnKNQxFF824klWbIfb12QdTH4ZA794D3N'
// router.post('/otp', async (req, res) => {
//     try {
//         console.log(req.body.phone);

//         textflow.useKey(otpapi);

//         // Sending an SMS in one line
//         // textflow.sendSMS(`"${req.body.phone}"`, "Readriches Otp");

//         res.status(200).json({ message: 'Otp sent successfully.' });
//         // OTP Verification
//         // User has sent his phone number for verification
//         // textflow.sendVerificationSMS(`"${req.body.phone}"`, verificationOptions);

//         // // Show him the code submission form
//         // // We will handle the verification code ourselves

//         // // The user has submitted the code
//         // let result = await textflow.verifyCode("+11234567890", "USER_ENTERED_CODE");
//         // if result.valid is true, then the phone number is verified.
//     }
//     catch (error) {
//         res.status(500).send(error);
//     }
// });

// // otp verification

router.post('/otpverify', async (req, res) => {
    try {
        // console.log(req.body.phone);
        console.log(req.body.otp);
        // send otp
        userinputotp = req.body.otp;

        if (userinputotp == otp) {
            res.status(200).json({ message: 'Otp verified successfully.' });
            verified = true;
        }

        else{
            res.status(400).json({ message: 'Otp not verified.' });
            verified = false;
        }
    }
    catch (error) {
        res.status(500).send(error);
    }
});



// get /login
router.get('/login', async (req, res) => {
    const docs = await NormalUser.User.find({});
    // cache the user data

    res.json(docs);
    // console.log(docs);
});

// get /google
router.get('/google', async (req, res) => {
    const docs = await GoogleUser.User_2.find({});
    res.json(docs);
    // console.log(docs);
});


//userdashboard cards

router.post('/createUserDashboards', async (req, res) => {
    try {
        // Fetch all cards from cardSchema
        const cards = await Card.find({}); // Fetch all cards

        // Extract cardid from each card object
        const cardIds = cards.map(card => card._id.toString()); // Assuming '_id' is the ObjectId of the card

        // Fetch the userid for which you want to create the user dashboards
        const { userid } = req.body;

        // Iterate through each cardid and create a new user dashboard
        const userDashboards = [];

        const newUserDashboards = cardIds.map(async cardid => {
            // Check if a user dashboard entry with the given userid and cardid already exists
            const existingDashboard = await userDashboard.UserDashboard.findOne({ user: userid, card: cardid });

            if (!existingDashboard) {
                return new userDashboard.UserDashboard({
                    user: userid,
                    card: cardid,
                    progressvalue: 0
                }).save();
            } else {
                return existingDashboard; // Return the existing dashboard entry
            }
        });

        try {
            const userDashboards = await Promise.all(newUserDashboards);
            return res.json(userDashboards);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json(userDashboards);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/getUserDashboardIds/:userId', async (req, res) => {
    try {
        // Find all UserDashboards by user ID
        const userdashboards = await userDashboard.UserDashboard.find({ userId: req.params.user });

        if (!userdashboards || userdashboards.length === 0) {
            return res.status(404).json({ error: 'UserDashboards not found.' });
        }

        // Return an array of UserDashboard IDs
        const userDashboardIds = userdashboards.map(userdashboard => userdashboard._id);
        res.json({ userDashboardIds });
    } catch (error) {
        console.error('Error fetching user dashboard IDs:', error);
        res.status(500).json({ error: error.message });
    }
});

// put /createUserDashboards/:id
// put /createUserDashboards/:userId/:id
router.put('/createUserDashboards/:userId/:id', async (req, res) => {
    try {
        const userdashboard = await userDashboard.UserDashboard.findOne({ user: req.params.userId, card: req.params.id });

        if (!userdashboard) {
            return res.status(404).json({ error: 'UserDashboard not found.' });
        }

        if (req.body.progress) {
            userdashboard.progressvalue = req.body.progress;
        }

        const update = {
            ...(req.body.progress && { progressvalue: userdashboard.progressvalue }),
        }

        const doc = await userDashboard.UserDashboard.findOneAndUpdate({ user: req.params.userId, card: req.params.id }, { $set: update }, { new: true });
        res.json(doc);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
});



// get /createUserDashboards
router.get('/createUserDashboards/:id', async (req, res) => {
    const docs = await userDashboard.UserDashboard.find({})
    res.json(docs);
});

// get /createUserDashboards
router.get('/createUserDashboards', async (req, res) => {
    const docs = await userDashboard.UserDashboard.find({})
    res.json(docs);
});

// post /createUserSubscriptions creating userid,subscriptiontaken,subscriptionstartdate,subscriptionenddate

router.post('/createUserSubscriptions', async (req, res) => {
    try {
        // const existingDashboard = await userSubscriptions.MemberSubscription.findOne({ subscriptiontype:req.body.subscriptiontype });

        // if (existingDashboard) {
        //     return res.status(409).json({ error: 'Subscription already exists.' });
        // }

        const userSubscription = new userSubscriptions.MemberSubscription({
            user: req.body.user,
            subscriptiontype: req.body.subscriptiontype,
            subscriptiontaken: req.body.subscriptiontaken,
            subscriptionstartdate: req.body.subscriptionstartdate,
            subscriptionenddate: req.body.subscriptionenddate,
        });

        const doc = await userSubscription.save();
        res.json(doc);

    } catch (error) {
        console.error('Error creating user subscriptions:', error);
        res.status(500).json({ error: error.message });
    }
});

// put /createUserSubscriptions/:id

// router.put('/createUserSubscriptions/:id', async (req, res) => {
//     try {
//         const userSubscription = await userSubscriptions.MemberSubscription.findOne({ user: req.params.id });

//         if (!userSubscription) {
//             return res.status(404).json({ error: 'User subscription not found.' });
//         }

//         if (req.body.subscriptiontype) {
//             userSubscription.subscriptiontype = req.body.subscriptiontype;
//         }

//         if (req.body.subscriptiontaken) {
//             userSubscription.subscriptiontaken = req.body.subscriptiontaken;
//         }

//         if (req.body.subscriptionstartdate) {
//             userSubscription.subscriptionstartdate = req.body.subscriptionstartdate;
//         }

//         if (req.body.subscriptionenddate) {
//             userSubscription.subscriptionenddate = req.body.subscriptionenddate;
//         }

//         const update = {
//             ...(req.body.subscriptiontype && { subscriptiontype: userSubscription.subscriptiontype }),
//             ...(req.body.subscriptiontaken && { subscriptiontaken: userSubscription.subscriptiontaken }),
//             ...(req.body.subscriptionstartdate && { subscriptionstartdate: userSubscription.subscriptionstartdate }),
//             ...(req.body.subscriptionenddate && { subscriptionenddate: userSubscription.subscriptionenddate }),
//         }

//         const doc = await userSubscriptions.MemberSubscription.findOneAndUpdate({ user: req.params.id }, { $set: update }, { new: true });
//         res.json(doc);
//     } catch (error) {
//         console.error('Error updating user subscription:', error);
//         res.status(500).json({ error: error.message });
//     }
// });    

router.get('/createUserSubscriptions', async (req, res) => {
    const docs = await userSubscriptions.MemberSubscription.find({})
    res.json(docs);
});



module.exports = router;