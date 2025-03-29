const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

class UserController {
  // Register a new user
  static async registerUser(req, res) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with this email or username'
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Return user details (excluding password)
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        token
      };

      res.status(201).json(userResponse);
    } catch (error) {
      res.status(500).json({
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  // User login
  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Return user details (excluding password)
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        token
      };

      res.json(userResponse);
    } catch (error) {
      res.status(500).json({
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Forgot password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

      // Save reset token and expiry
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = resetTokenExpiry;

      await user.save();

      // TODO: Send email with reset link
      // This would typically involve an email service like SendGrid
      // For now, we'll just return the reset token
      res.json({
        message: 'Password reset token generated',
        resetToken
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to generate reset token',
        error: error.message
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { resetToken, newPassword } = req.body;

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          message: 'Invalid or expired reset token'
        });
      }

      // Update password
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;

      await user.save();

      res.json({
        message: 'Password reset successful'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Password reset failed',
        error: error.message
      });
    }
  }

  // Get user profile
  static async getUserProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
        .select('-password')
        .populate('achievements');

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve profile',
        error: error.message
      });
    }
  }

  // Update user profile
  static async updateUserProfile(req, res) {
    try {
      const { username, profilePicture } = req.body;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Update fields if provided
      if (username) user.username = username;
      if (profilePicture) user.profilePicture = profilePicture;

      await user.save();

      res.json({
        id: user._id,
        username: user.username,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      res.status(500).json({
        message: 'Profile update failed',
        error: error.message
      });
    }
  }

  // Get user game stats
  static async getUserStats(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Fetch game-related stats
      const stats = {
        totalGamesPlayed: user.gamesPlayed,
        totalScore: user.totalScore,
        achievements: user.achievements
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve stats',
        error: error.message
      });
    }
  }
}
