const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserByEmail, updateUser } = require('../services/dynamodbService');

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, gender, dateOfBirth } = req.body;

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (gender !== undefined) updates.gender = gender;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updatedUser = await updateUser(req.user.email, updates);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
