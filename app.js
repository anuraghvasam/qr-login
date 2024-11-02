const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // Correct import of ObjectId
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');



const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection string
const uri = process.env.MONGO_URI || "mongodb+srv://avasam:db1@qrcluster.q6uvp.mongodb.net/";
const client = new MongoClient(uri);

// Encryption secret and algorithm
const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY || crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Encryption function
function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid encrypted text');
    }

    let textParts = text.split(':');
    if (textParts.length !== 2) {
        throw new Error('Malformed encrypted text');
    }

    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('qrlogin');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

// Regular login endpoint (email/username and password)
app.post('/login', async(req, res) => {
    const { emailOrPhone, password } = req.body;
    const db = await connectDB();
    const usersCollection = db.collection('customer_data');

    try {
        const user = await usersCollection.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // On successful login
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Failed to login' });
    }
});


// Sign-up endpoint
app.post('/signup', async(req, res) => {
    const db = await connectDB();
    const usersCollection = db.collection('customer_data');
    const { firstName, lastName, email, phone, password } = req.body;

    try {
        // Check if the email or phone is already in use
        const existingUser = await usersCollection.findOne({
            $or: [{ email: email }, { phone: phone }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email or phone already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
        });
        res.status(200).json({ message: 'Account created successfully!' });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ message: 'Error signing up user: ' + error.message });
    }
});


// QR Code generation endpoint
app.post('/generate-qr', async(req, res) => {
    const { emailOrPhone } = req.body; // We are only taking the email or phone, no password required
    const db = await connectDB();
    const usersCollection = db.collection('customer_data');

    try {
        // Log received email/phone
        console.log('Received emailOrPhone:', emailOrPhone);

        // Search for the user by email or phone
        const user = await usersCollection.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
        });

        if (!user) {
            console.error('User not found with email or phone:', emailOrPhone);
            return res.status(400).json({ message: 'User not found' });
        }

        console.log('User found:', user);

        // Generate a session ID and store it in the database
        const sessionId = crypto.randomBytes(16).toString('hex');
        console.log('Generated sessionId:', sessionId);

        await usersCollection.updateOne({ _id: user._id }, { $set: { qrSessionId: sessionId } });

        // Generate the QR code with the session ID
        const qrCode = await QRCode.toDataURL(sessionId);

        console.log('QR Code generated successfully.');

        // Send back the generated QR code and user data
        res.status(200).json({
            qrCode: qrCode,
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ message: 'Failed to generate QR code' });
    }
});



// QR Login endpoint
app.post('/qr-login', async(req, res) => {
    const { sessionId } = req.body;
    const db = await connectDB();
    const usersCollection = db.collection('customer_data');

    try {
        // Check if the session ID exists in the database
        const user = await usersCollection.findOne({ qrSessionId: sessionId });

        if (!user) {
            console.error('Invalid session ID:', sessionId);
            return res.status(400).json({ message: 'Invalid session ID' });
        }

        console.log('Valid session ID found for user:', user.email);

        // Optionally invalidate the session ID after use (if one-time login)
        await usersCollection.updateOne({ _id: user._id }, { $unset: { qrSessionId: "" } });

        // Log the user in by sending user details
        res.status(200).json({
            success: true,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Error during QR login:', error);
        res.status(500).json({ message: 'Failed to login via QR' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});