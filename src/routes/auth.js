import express from 'express';
import { auth, db } from '../config/firebase.js';

const router = express.Router();

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
      displayName: name
    });

    // Prepare user data for Realtime Database
    const userData = {
      name,
      email,
      role,
      farms: {} // Initialize empty farms object
    };

    // If role is admin, create a default farm
    if (role === 'admin') {
      const newFarmRef = db.ref('farms').push();
      const farmId = newFarmRef.key;
      await newFarmRef.set({
        name: `${name}'s Farm`,
        type: 'default',
        size: 'small'
      });
      userData.farms[farmId] = true;
    }

    // Store user data in Realtime Database
    await db.ref(`users/${userRecord.uid}`).set(userData);

    return res.status(201).json({
      message: 'User registered successfully',
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
