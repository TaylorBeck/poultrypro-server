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

// Update a chicken
router.put('/:farmId/:chickenId', authenticateToken, async (req, res) => {
  try {
    const { farmId, chickenId } = req.params;
    const updatedChicken = req.body;
    const chickenRef = db.ref(`chickens/${farmId}/${chickenId}`);
    await chickenRef.update(updatedChicken);
    res.json({ id: chickenId, ...updatedChicken });
  } catch (error) {
    console.error('Error updating chicken:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a chicken
router.delete('/:farmId/:chickenId', authenticateToken, async (req, res) => {
  try {
    const { farmId, chickenId } = req.params;
    const chickenRef = db.ref(`chickens/${farmId}/${chickenId}`);
    await chickenRef.remove();
    res.json({ message: 'Chicken deleted successfully' });
  } catch (error) {
    console.error('Error deleting chicken:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
