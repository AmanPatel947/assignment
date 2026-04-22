import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api'
import './App.css'

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

const INITIAL_TASK = {
  title: '',
  description: '',
  status: 'todo',
}

const INITIAL_AUTH = {
  email: '',
  password: '',
  name: '',
  role: 'user',
  adminSecret: '',
}

function App() {
  const [mode, setMode] = useState('login')
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [tasks, setTasks] = useState([])
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [authForm, setAuthForm] = useState(INITIAL_AUTH)
  const [taskForm, setTaskForm] = useState(INITIAL_TASK)
  const [editingId, setEditingId] = useState(null)

  const isAuthenticated = Boolean(token)
  const greeting = useMemo(() => {
    if (!user) return 'Guest'
    return user.name || user.email
  }, [user])

  useEffect(() => {
    if (token) {
      loadTasks()
    } else {
      setTasks([])
    }
  }, [token])

  async function loadTasks() {
    setLoading(true)
    try {
      const data = await apiRequest('/tasks', { token })
      setTasks(data.tasks || [])
    } catch (error) {
      setAlert({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  function persistSession(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('token', nextToken)
    localStorage.setItem('user', JSON.stringify(nextUser))
  }

  function clearSession() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAlert(null)
    setLoading(true)

    const isRegister = mode === 'register'
    const payload = isRegister
      ? {
          email: authForm.email,
          password: authForm.password,
          name: authForm.name,
          role: authForm.role,
          adminSecret: authForm.role === 'admin' ? authForm.adminSecret : '',
        }
      : {
          email: authForm.email,
          password: authForm.password,
        }

    try {
      const data = await apiRequest(
        `/auth/${isRegister ? 'register' : 'login'}`,
        {
          method: 'POST',
          body: payload,
        },
      )
      persistSession(data.token, data.user)
      setAuthForm(INITIAL_AUTH)
      setAlert({
        type: 'success',
        message: isRegister ? 'Account created.' : 'Welcome back.',
      })
    } catch (error) {
      setAlert({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    clearSession()
    setTaskForm(INITIAL_TASK)
    setEditingId(null)
  }

  function handleAuthChange(event) {
    const { name, value } = event.target
    setAuthForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleTaskChange(event) {
    const { name, value } = event.target
    setTaskForm((prev) => ({ ...prev, [name]: value }))
  }

  function resetTaskForm() {
    setTaskForm(INITIAL_TASK)
    setEditingId(null)
  }

  async function handleTaskSubmit(event) {
    event.preventDefault()
    setAlert(null)
    setLoading(true)

    const isEditing = Boolean(editingId)
    const path = isEditing ? `/tasks/${editingId}` : '/tasks'
    const method = isEditing ? 'PATCH' : 'POST'

    try {
      const data = await apiRequest(path, {
        method,
        token,
        body: taskForm,
      })

      if (isEditing) {
        setTasks((prev) =>
          prev.map((task) => (task.id === data.task.id ? data.task : task)),
        )
      } else {
        setTasks((prev) => [data.task, ...prev])
      }

      resetTaskForm()
      setAlert({
        type: 'success',
        message: isEditing ? 'Task updated.' : 'Task created.',
      })
    } catch (error) {
      setAlert({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  function startEdit(task) {
    setEditingId(task.id)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
    })
  }

  async function handleDelete(taskId) {
    setLoading(true)
    setAlert(null)
    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE', token })
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      setAlert({ type: 'success', message: 'Task removed.' })
    } catch (error) {
      setAlert({ type: 'error', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true"></span>
          <div>
            <p className="brand__eyebrow">Backend Intern</p>
            <h1 className="brand__title">API Control Room</h1>
          </div>
        </div>
        <div className="brand__meta">
          <span className="pill">JWT Auth</span>
          <span className="pill">Role Aware</span>
          <span className="pill">Tasks CRUD</span>
        </div>
      </header>

      <main className="app__main">
        <section className="card intro">
          <h2>Live API operator</h2>
          <p className="muted">
            Spin up secure sessions, test protected routes, and track tasks as a
            signed in user or admin.
          </p>
          <div className="metrics">
            <div>
              <p className="metric__label">Access</p>
              <p className="metric__value">JWT + RBAC</p>
            </div>
            <div>
              <p className="metric__label">Schema</p>
              <p className="metric__value">Postgres + Prisma</p>
            </div>
            <div>
              <p className="metric__label">Docs</p>
              <p className="metric__value">Swagger UI</p>
            </div>
          </div>
          <div className="note">
            <p>
              <strong>Scalability note:</strong> stateless services, horizontal
              scaling, database indexing, and optional caching layers.
            </p>
          </div>
        </section>

        <section className="card workspace">
          <div className="workspace__header">
            <div>
              <p className="eyebrow">Session</p>
              <h2>{isAuthenticated ? greeting : 'Authenticate'}</h2>
              <p className="muted">
                {isAuthenticated
                  ? 'Create and manage tasks with protected endpoints.'
                  : 'Register a new user or log in to access tasks.'}
              </p>
            </div>
            {isAuthenticated ? (
              <button
                className="button button--ghost"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            ) : (
              <div className="toggle">
                <button
                  className={mode === 'login' ? 'active' : ''}
                  type="button"
                  onClick={() => setMode('login')}
                >
                  Login
                </button>
                <button
                  className={mode === 'register' ? 'active' : ''}
                  type="button"
                  onClick={() => setMode('register')}
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {alert ? (
            <div className={`alert alert--${alert.type}`}>
              <span>{alert.message}</span>
              <button
                type="button"
                className="alert__close"
                onClick={() => setAlert(null)}
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {!isAuthenticated ? (
            <form className="form" onSubmit={handleAuthSubmit}>
              {mode === 'register' ? (
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={authForm.name}
                    onChange={handleAuthChange}
                    placeholder="Samira Lee"
                  />
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  placeholder="At least 8 characters"
                  required
                />
              </div>
              {mode === 'register' ? (
                <div className="field row">
                  <div>
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      name="role"
                      value={authForm.role}
                      onChange={handleAuthChange}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="adminSecret">Admin key</label>
                    <input
                      id="adminSecret"
                      name="adminSecret"
                      type="password"
                      value={authForm.adminSecret}
                      onChange={handleAuthChange}
                      placeholder="Optional"
                      disabled={authForm.role !== 'admin'}
                    />
                  </div>
                </div>
              ) : null}
              <button className="button" type="submit" disabled={loading}>
                {loading
                  ? 'Working...'
                  : mode === 'register'
                    ? 'Create account'
                    : 'Sign in'}
              </button>
            </form>
          ) : (
            <div className="dashboard">
              <form className="form" onSubmit={handleTaskSubmit}>
                <div className="field">
                  <label htmlFor="title">Task title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={taskForm.title}
                    onChange={handleTaskChange}
                    placeholder="Ship the RBAC layer"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={taskForm.description}
                    onChange={handleTaskChange}
                    placeholder="Optional context or notes"
                  ></textarea>
                </div>
                <div className="field row">
                  <div>
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={taskForm.status}
                      onChange={handleTaskChange}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="actions">
                    <button className="button" type="submit" disabled={loading}>
                      {editingId ? 'Save changes' : 'Add task'}
                    </button>
                    {editingId ? (
                      <button
                        className="button button--ghost"
                        type="button"
                        onClick={resetTaskForm}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </form>

              <div className="task-list">
                <div className="task-list__header">
                  <h3>Tasks</h3>
                  <button
                    className="button button--ghost"
                    type="button"
                    onClick={loadTasks}
                    disabled={loading}
                  >
                    Refresh
                  </button>
                </div>
                {tasks.length === 0 ? (
                  <p className="muted">No tasks yet. Create one above.</p>
                ) : (
                  <div className="task-list__items">
                    {tasks.map((task, index) => (
                      <div
                        className="task-row"
                        style={{ '--delay': `${index * 60}ms` }}
                        key={task.id}
                      >
                        <div>
                          <p className="task-row__title">{task.title}</p>
                          <p className="task-row__meta">
                            {task.description || 'No description'}
                          </p>
                        </div>
                        <div className="task-row__actions">
                          <span className={`status status--${task.status}`}>
                            {
                              STATUS_OPTIONS.find(
                                (option) => option.value === task.status,
                              )?.label
                            }
                          </span>
                          <button
                            className="button button--ghost"
                            type="button"
                            onClick={() => startEdit(task)}
                          >
                            Edit
                          </button>
                          <button
                            className="button button--danger"
                            type="button"
                            onClick={() => handleDelete(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
