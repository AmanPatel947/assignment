const prisma = require('../db/prisma');
const { ApiError } = require('../utils/errors');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { config } = require('../config/env');

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
};

async function register(req, res, next) {
  try {
    const { email, password, name, role, adminSecret } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, 'Email already in use', 'EMAIL_EXISTS');
    }

    let resolvedRole = 'user';
    if (role === 'admin') {
      if (
        !config.adminRegistrationSecret ||
        adminSecret !== config.adminRegistrationSecret
      ) {
        throw new ApiError(
          403,
          'Admin registration not allowed',
          'ADMIN_REGISTRATION_FORBIDDEN',
        );
      }
      resolvedRole = 'admin';
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: resolvedRole,
        passwordHash,
      },
      select: userSelect,
    });

    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const userRecord = await prisma.user.findUnique({ where: { email } });
    if (!userRecord) {
      throw new ApiError(401, 'Invalid credentials', 'AUTH_INVALID');
    }

    const validPassword = await verifyPassword(
      password,
      userRecord.passwordHash,
    );
    if (!validPassword) {
      throw new ApiError(401, 'Invalid credentials', 'AUTH_INVALID');
    }

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      createdAt: userRecord.createdAt,
    };

    const token = signToken(user);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
