const User       = require('../models/User');
const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc    Register new user (student only — public)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name: name || '', email, password, role: 'student' });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create admin, faculty, or student user
// @route   POST /api/auth/create-user
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ message: 'Please provide email, password and role' });

    if (!['student', 'faculty', 'admin'].includes(role))
      return res.status(400).json({ message: 'Role must be student, faculty or admin' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name: name || '', email, password, role });

    res.status(201).json({
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      message: 'User created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a user (name, email, role, optional password)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role, password } = req.body;

    if (email && email !== user.email) {
      if (await User.findOne({ email }))
        return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name !== undefined) user.name = name;
    if (role && ['student', 'faculty', 'admin'].includes(role)) user.role = role;
    if (password && password.length >= 6) user.password = password;

    await user.save();
    res.status(200).json({
      message: 'User updated successfully',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot delete your own account' });

    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password — send reset link via email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from:    `"EduCoach" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Password Reset Request — EduCoach',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#f8fafc;border-radius:8px;">
          <h2 style="color:#1e293b;margin-bottom:0.5rem;">Reset Your Password</h2>
          <p style="color:#64748b;margin-bottom:1.5rem;">
            Hi ${user.name || user.email},<br/>
            Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:0.75rem 1.5rem;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
          <p style="color:#94a3b8;font-size:0.82rem;margin-top:1.5rem;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpire:  { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpire  = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change password (logged-in user)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Please provide current and new password' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
