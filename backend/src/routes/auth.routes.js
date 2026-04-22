const { Router } = require('express');
const { login, register } = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validate');
const { loginSchema, registerSchema } = require('../validation/auth.schema');

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

module.exports = router;
