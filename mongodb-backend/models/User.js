const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const MockUser = require('./MockUser');

if (process.env.NODE_ENV === 'mock') {
  module.exports = MockUser;
} else {
  const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'developer', 'hod', 'principal'],
      default: 'student'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    profilePicture: {
      type: String,
      default: 'default-profile.jpg'
    },
    // Developer specific fields
    title: String,
    bio: String,
    education: String,
    experience: String,
    socialLinks: {
      github: String,
      portfolio: String,
      instagram: String,
      email: String
    },
    // Teacher specific fields
    department: String,
    subjects: [String],
    qualification: String,
    designation: String,
    joiningDate: Date,
    // HOD specific fields
    message: String,
    // Student specific fields
    rollNumber: {
      type: String,
      sparse: true,
      trim: true
    },
    enrollmentNumber: {
      type: String,
      sparse: true,
      trim: true
    },
    semester: Number,
    batch: String,
    branch: String,
    fatherName: String,
    motherName: String,
    dateOfBirth: Date,
    contactNumber: String,
    address: String,
    class: String,
    attendance: Number,
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetOTP: String,
    resetOTPExpires: Date
  }, {
    timestamps: true
  });

  UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

  UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  module.exports = mongoose.model('User', UserSchema);
}
