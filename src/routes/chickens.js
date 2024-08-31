import express from 'express';
import { db } from '../config/firebase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all chickens for a farm
router.get('/:farmId', authenticateToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const chickensRef = db.ref(`chickens/${farmId}`);
    const snapshot = await chickensRef.once('value');
    const chickens = snapshot.val();
    res.json(chickens);
  } catch (error) {
    console.error('Error fetching chickens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new chicken
router.post('/:farmId', authenticateToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const newChicken = req.body;
    const chickensRef = db.ref(`chickens/${farmId}`);
    const newChickenRef = chickensRef.push();
    await newChickenRef.set(newChicken);
    res.status(201).json({ id: newChickenRef.key, ...newChicken });
  } catch (error) {
    console.error('Error adding chicken:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
