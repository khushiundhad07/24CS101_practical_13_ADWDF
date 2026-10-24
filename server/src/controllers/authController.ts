import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { TOKEN_EXPIRY, jwtSecret } from '../config';

const SALT_ROUNDS = 10;

// POST /auth/register → 201 with the new user (no password), 409 if the email is taken
export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (await User.exists({ email })) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    // bcrypt salts automatically and is deliberately slow, which makes brute-forcing hashes expensive.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login → 200 with a JWT valid for 1 hour, 401 on wrong email or password
export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // Compare the plain password with the stored hash; never compare hashes with ===.
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !isMatch) {
      // Same message for both cases, so the response doesn't reveal which emails exist.
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id.toString(), email: user.email }, jwtSecret(), { expiresIn: TOKEN_EXPIRY });
    res.status(200).json({ token, expiresIn: TOKEN_EXPIRY, user });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me → the logged-in user, from the id inside the verified token
export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User no longer exists' });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
