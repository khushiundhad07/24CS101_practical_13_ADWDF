import type { RequestHandler } from 'express';
import { PRIORITIES } from '../models/Task';

interface Rule {
  type: 'string' | 'boolean';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  oneOf?: readonly string[];
  /** Strings are trimmed unless this is false (passwords keep their spaces). */
  trim?: boolean;
  label?: string;
}

type Rules = Record<string, Rule>;

/**
 * Validates and sanitises req.body before it reaches a controller:
 * - only the listed fields are kept (anything else is dropped),
 * - each value must have the right primitive type — objects such as { "$gt": "" } are rejected,
 *   which blocks NoSQL operator injection into Mongo queries,
 * - strings are trimmed and length/format checked.
 * Failures return 400 with a message per field.
 */
export const validate =
  (rules: Rules, { atLeastOne = false } = {}): RequestHandler =>
  (req, res, next) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const errors: Record<string, string> = {};
    const clean: Record<string, unknown> = {};

    for (const [field, rule] of Object.entries(rules)) {
      const name = rule.label ?? field;
      let value = body[field];

      const isBlank = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
      if (isBlank) {
        if (rule.required) errors[field] = `${name} is required`;
        continue;
      }
      if (typeof value !== rule.type) {
        errors[field] = `${name} must be a ${rule.type}`;
        continue;
      }
      if (typeof value === 'string') {
        if (rule.trim !== false) value = value.trim();
        const s = value as string;
        if (rule.min !== undefined && s.length < rule.min) errors[field] = `${name} must be at least ${rule.min} characters`;
        else if (rule.max !== undefined && s.length > rule.max) errors[field] = `${name} must be at most ${rule.max} characters`;
        else if (rule.pattern && !rule.pattern.test(s)) errors[field] = `${name} is not valid`;
        else if (rule.oneOf && !rule.oneOf.includes(s)) errors[field] = `${name} must be one of ${rule.oneOf.join(', ')}`;
      }
      if (!errors[field]) clean[field] = value;
    }

    if (atLeastOne && Object.keys(clean).length === 0 && Object.keys(errors).length === 0) {
      errors.body = `Send at least one of: ${Object.keys(rules).join(', ')}`;
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    req.body = clean;
    next();
  };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerRules = validate({
  email: { type: 'string', required: true, max: 254, pattern: EMAIL },
  // bcrypt only uses the first 72 bytes of a password.
  password: { type: 'string', required: true, min: 8, max: 72, trim: false },
});

export const loginRules = validate({
  email: { type: 'string', required: true, max: 254 },
  password: { type: 'string', required: true, max: 72, trim: false },
});

const taskFields = {
  title: { type: 'string', max: 120 },
  description: { type: 'string', max: 1000 },
  completed: { type: 'boolean' },
  priority: { type: 'string', oneOf: PRIORITIES },
} satisfies Rules;

export const createTaskRules = validate({ ...taskFields, title: { ...taskFields.title, required: true } });
export const updateTaskRules = validate(taskFields, { atLeastOne: true });
