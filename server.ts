import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const JWT_SECRET = process.env.JWT_SECRET || 'axion-super-secret-key';
const db = new Database('axion.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password_hash TEXT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    frequency TEXT DEFAULT 'daily',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS habit_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER,
    date TEXT,
    FOREIGN KEY(habit_id) REFERENCES habits(id)
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    duration_minutes INTEGER,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Rename 'completed' to 'status' if it exists
try {
  const tableInfo = db.prepare("PRAGMA table_info(tasks)").all() as any[];
  const hasCompleted = tableInfo.some(col => col.name === 'completed');
  const hasStatus = tableInfo.some(col => col.name === 'status');

  if (hasCompleted && !hasStatus) {
    console.log("Migrating 'tasks' table: renaming 'completed' to 'status'...");
    db.exec("ALTER TABLE tasks RENAME COLUMN completed TO status");
    // Also ensure it has the right default and type if possible, 
    // but RENAME COLUMN is a good start. 
    // SQLite RENAME COLUMN keeps the type and constraints.
  } else if (!hasStatus) {
    console.log("Migrating 'tasks' table: adding 'status' column...");
    db.exec("ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'pending'");
  }
} catch (error) {
  console.error("Migration failed:", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
      const result = stmt.run(email, hashedPassword, name);
      const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, email, name } });
    } catch (error: any) {
      res.status(400).json({ error: error.message.includes('UNIQUE') ? 'Email already exists' : 'Registration failed' });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });

  // Tasks
  app.get('/api/tasks', authenticateToken, (req: any, res) => {
    const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(tasks);
  });

  app.post('/api/tasks', authenticateToken, (req: any, res) => {
    const { title, description, priority, due_date } = req.body;
    const stmt = db.prepare('INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(req.user.id, title, description, priority, due_date);
    res.json({ id: result.lastInsertRowid, title, description, priority, due_date, status: 'pending' });
  });

  app.patch('/api/tasks/:id', authenticateToken, (req: any, res) => {
    const { status } = req.body;
    db.prepare('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?').run(status, req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.delete('/api/tasks/:id', authenticateToken, (req: any, res) => {
    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // Habits
  app.get('/api/habits', authenticateToken, (req: any, res) => {
    const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.user.id);
    const habitsWithCompletions = habits.map((habit: any) => {
      const completions = db.prepare('SELECT date FROM habit_completions WHERE habit_id = ?').all(habit.id);
      return { ...habit, completions: completions.map((c: any) => c.date) };
    });
    res.json(habitsWithCompletions);
  });

  app.post('/api/habits', authenticateToken, (req: any, res) => {
    const { name, frequency } = req.body;
    const stmt = db.prepare('INSERT INTO habits (user_id, name, frequency) VALUES (?, ?, ?)');
    const result = stmt.run(req.user.id, name, frequency);
    res.json({ id: result.lastInsertRowid, name, frequency, completions: [] });
  });

  app.post('/api/habits/:id/complete', authenticateToken, (req: any, res) => {
    const { date } = req.body; // YYYY-MM-DD
    const habit: any = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!habit) return res.status(404).json({ error: 'Habit not found' });

    const existing = db.prepare('SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?').get(req.params.id, date);
    if (existing) {
      db.prepare('DELETE FROM habit_completions WHERE habit_id = ? AND date = ?').run(req.params.id, date);
      res.json({ completed: false });
    } else {
      db.prepare('INSERT INTO habit_completions (habit_id, date) VALUES (?, ?)').run(req.params.id, date);
      res.json({ completed: true });
    }
  });

  // Focus Sessions
  app.get('/api/focus-sessions', authenticateToken, (req: any, res) => {
    const sessions = db.prepare('SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY started_at DESC').all(req.user.id);
    res.json(sessions);
  });

  app.post('/api/focus-sessions', authenticateToken, (req: any, res) => {
    const { duration_minutes } = req.body;
    const stmt = db.prepare('INSERT INTO focus_sessions (user_id, duration_minutes) VALUES (?, ?)');
    const result = stmt.run(req.user.id, duration_minutes);
    res.json({ id: result.lastInsertRowid, duration_minutes, started_at: new Date().toISOString() });
  });

  // Stats
  app.get('/api/stats', authenticateToken, (req: any, res) => {
    const tasksDone = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'completed'").get(req.user.id) as any;
    const totalFocus = db.prepare('SELECT SUM(duration_minutes) as total FROM focus_sessions WHERE user_id = ?').get(req.user.id) as any;
    const habitsCount = db.prepare('SELECT COUNT(*) as count FROM habits WHERE user_id = ?').get(req.user.id) as any;

    // Get last 7 days of activity
    const activity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const tasksCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'completed' AND date(created_at) = ?").get(req.user.id, dateStr) as any;
      const focusMinutes = db.prepare("SELECT SUM(duration_minutes) as total FROM focus_sessions WHERE user_id = ? AND date(started_at) = ?").get(req.user.id, dateStr) as any;

      activity.push({
        name: dayName,
        tasks: tasksCount.count || 0,
        focus: focusMinutes.total || 0,
        date: dateStr
      });
    }

    res.json({
      tasksCompleted: tasksDone.count,
      focusTimeMinutes: totalFocus.total || 0,
      habitsTracked: habitsCount.count,
      activity
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
