import { Schema, type InferSchemaType } from 'mongoose';
import { db } from '../db';

export const PRIORITIES = ['low', 'medium', 'high'] as const;

const taskSchema = new Schema({
  // The user who created the task; every query filters on it.
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: [true, 'title is required'] },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: { values: PRIORITIES, message: 'priority must be low, medium or high' },
    default: 'medium',
  },
  createdAt: { type: Date, default: Date.now },
});

// Runs as part of save(), just before validation (a plain pre('save') hook runs after
// validation, which would let a title of "   " pass `required`).
taskSchema.pre('validate', function (next) {
  if (typeof this.title === 'string') this.title = this.title.trim();
  next();
});

// Save hooks don't run for findByIdAndUpdate, so trim there as well.
taskSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as { title?: unknown } | null;
  if (update && typeof update.title === 'string') update.title = update.title.trim();
  next();
});

export type TaskDoc = InferSchemaType<typeof taskSchema>;

export const Task = db.model('Task', taskSchema);
