import { Schema } from 'mongoose';
import { db } from '../db';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Always a bcrypt hash — the plain password is never stored.
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// Never send the hash back in API responses.
userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = db.model('User', userSchema);
