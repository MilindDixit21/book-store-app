import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken} from '../utils/jwt.js';

// Register new user
export const register = async (req, res) => {
  const user = new User(req.body);
  await user.save();
  const token = generateToken(user);
  res.status(201).json({ token });
};

// Login existing user
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const isMatch = user && await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  res.json({ token: generateToken(user) });
};

// Admin-only role update
export const updateRole = async (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin','editor','viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `Role updated to ${role}` });
};

//get userByid
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  res.json(user);
};


//get All users
export const getAllUsers = async (req, res) =>{
  const users = await User.find().select('-password');
  res.json(users);
};