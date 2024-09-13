import express from 'express';
import { auth, db } from '../config/firebase.js';
import { seedAdminData } from '../utils/seedData.js';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const router = express.Router();

// Create SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate role
    if (role !== 'admin' && role !== 'customer') {
      return res
        .status(400)
        .json({ error: 'Invalid role. Must be either "admin" or "customer".' });
    }

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false
    });

    // Prepare user data for Realtime Database
    const userData = {
      name,
      email,
      role,
      image: `https://s3-poultrypro.s3.us-west-2.amazonaws.com/face-1.png`,
      farms: {} // Initialize empty farms object
    };

    // If role is admin, create default farms with detailed data
    if (role === 'admin') {
      await seedAdminData(name, userData);
    }

    // Store user data in Realtime Database
    await db.ref(`users/${userRecord.uid}`).set(userData);

    if (email.includes('beck.taylorg')) {
      try {
        // Generate email verification link
        const verificationLink = await auth.generateEmailVerificationLink(email);

        // Send verification email using AWS SES
        const params = {
          Source: process.env.SES_SENDER_EMAIL,
          Destination: {
            ToAddresses: [email]
          },
          Message: {
            Subject: {
              Data: 'Welcome to PoultryPro - Verify Your Email'
            },
            Body: {
              Html: {
                Data: `
                  <h1>Welcome to PoultryPro!</h1>
                  <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                  <a href="${verificationLink}">Verify Email</a>
                  <p>Once verified, you can log in at: <a href="https://poultrypro.net/sign-in">https://poultrypro.net/sign-in</a></p>
                `
              }
            }
          }
        };

        const command = new SendEmailCommand(params);
        await sesClient.send(command);
      } catch (error) {
        console.log(error.message);
      }
    }

    return res.status(201).json({
      message:
        'User registered successfully. Please check your email to verify your account.',
      userId: userRecord.uid
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user data from Realtime Database
    const userSnapshot = await db.ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();

    const user = {
      uid: uid,
      email: decodedToken.email,
      name: userData.name,
      role: userData.role,
      farms: userData.farms
    };

    res.json({
      user
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

export default router;
