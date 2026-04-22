const prisma = require('../db/prisma');
const { ApiError } = require('../utils/errors');

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
};

function canAccess(task, user) {
  return user.role === 'admin' || task.ownerId === user.id;
}

async function listTasks(req, res, next) {
  try {
    const where =
      req.user.role === 'admin' ? {} : { ownerId: req.user.id };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: taskSelect,
    });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, status } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        status: status || 'todo',
        ownerId: req.user.id,
      },
      select: taskSelect,
    });

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      select: taskSelect,
    });

    if (!task) {
      throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    if (!canAccess(task, req.user)) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const existing = await prisma.task.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    if (!canAccess(existing, req.user)) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    const data = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
    };

    const task = await prisma.task.update({
      where: { id },
      data,
      select: taskSelect,
    });

    res.json({ task });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.task.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existing) {
      throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
    }

    if (!canAccess(existing, req.user)) {
      throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    await prisma.task.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
