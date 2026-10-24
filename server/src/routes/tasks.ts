import { Router } from 'express';
import { createTask, deleteTask, getAllTasks, getTask, updateTask } from '../controllers/taskController';
import { auth } from '../middleware/auth';
import { requireJson } from '../middleware/requireJson';
import { validateId } from '../middleware/validateId';
import { createTaskRules, updateTaskRules } from '../middleware/validate';

const router = Router();

// Every task route: Client → auth (verify JWT, set req.user) → validation → controller.
router.use(auth);

router.get('/', getAllTasks);
router.get('/:id', validateId, getTask);
router.post('/', requireJson, createTaskRules, createTask);
router.put('/:id', validateId, requireJson, updateTaskRules, updateTask);
router.delete('/:id', validateId, deleteTask);

export default router;
