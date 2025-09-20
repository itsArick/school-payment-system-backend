import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
const { hash, compare } = bcrypt;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export default model('User', userSchema);
