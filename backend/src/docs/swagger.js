const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Intern API',
    version: '1.0.0',
    description: 'REST API with auth and task management.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['user', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TaskCreate: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
      TaskUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['user', 'admin'] },
                  adminSecret: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/tasks': {
      get: {
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Task list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get task by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Task detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Task deleted' },
        },
      },
    },
  },
};

module.exports = { swaggerSpec };const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Intern API',
    version: '1.0.0',
    description: 'REST API with auth and task management.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['user', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TaskCreate: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
      TaskUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['user', 'admin'] },
                  adminSecret: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/tasks': {
      get: {
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Task list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get task by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Task detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Task deleted' },
        },
      },
    },
  },
};

module.exports = { swaggerSpec };
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Intern API',
    version: '1.0.0',
    description: 'REST API with auth and task management.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['user', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TaskCreate: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
      TaskUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['user', 'admin'] },
                  adminSecret: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/tasks': {
      get: {
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Task list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get task by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Task detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Task deleted' },
        },
      },
    },
  },
};

module.exports = { swaggerSpec };
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Intern API',
    version: '1.0.0',
    description: 'REST API with auth and task management.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
          adminSecret: { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['user', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TaskCreate: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
      TaskUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Email already in use',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/tasks': {
      get: {
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Task list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get task by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Task detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Task deleted' },
        },
      },
    },
  },
};

module.exports = { swaggerSpec };
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Assignment API',
    version: '1.0.0',
    description: 'Scalable REST API with JWT auth and role-based access.',
  },
  servers: [{ url: 'http://localhost:4000' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer', format: 'int64' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
          ownerId: { type: 'integer', format: 'int64' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Users list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Tasks list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { task: { $ref: '#/components/schemas/Task' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a task by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', format: 'int64' },
          },
        ],
        responses: {
          200: {
            description: 'Task details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { task: { $ref: '#/components/schemas/Task' } },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update a task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', format: 'int64' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { task: { $ref: '#/components/schemas/Task' } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', format: 'int64' },
          },
        ],
        responses: {
          200: {
            description: 'Task deleted',
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
