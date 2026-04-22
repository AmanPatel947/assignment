const { Router } = require('express');
const {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} = require('../controllers/task.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody, validateParams } = require('../middleware/validate');
const {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} = require('../validation/task.schema');

const router = Router();

router.use(requireAuth);

router.get('/', listTasks);
router.post('/', validateBody(createTaskSchema), createTask);
router.get('/:id', validateParams(taskIdSchema), getTask);
router.patch(
  '/:id',
  validateParams(taskIdSchema),
  validateBody(updateTaskSchema),
  updateTask,
);
router.delete('/:id', validateParams(taskIdSchema), deleteTask);

module.exports = router;
