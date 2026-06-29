import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new Database('chat.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    isRead INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS truck_details (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    mileage TEXT NOT NULL,
    price TEXT NOT NULL
  );
`);

// Insert default truck details if not exists
db.exec(`
  INSERT OR IGNORE INTO truck_details (id, mileage, price) 
  VALUES (1, '78,000', '23,900');
`);

// API Routes
app.use(express.json());

app.get('/api/truck-details', (req, res) => {
  const details = db.prepare('SELECT * FROM truck_details WHERE id = 1').get();
  res.json(details || { mileage: '78,000', price: '23,900' });
});

app.post('/api/truck-details', (req, res) => {
  const { mileage, price } = req.body;
  const stmt = db.prepare('UPDATE truck_details SET mileage = ?, price = ? WHERE id = 1');
  stmt.run(mileage, price);
  res.json({ success: true });
});

app.post('/api/inquiries', (req, res) => {
  const { name, phone, email, message } = req.body;
  const stmt = db.prepare('INSERT INTO inquiries (name, phone, email, message) VALUES (?, ?, ?, ?)');
  stmt.run(name, phone, email, message);
  res.json({ success: true });
});

app.get('/api/admin/inquiries', (req, res) => {
  const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY timestamp DESC').all();
  res.json(inquiries);
});

app.get('/api/messages/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const stmt = db.prepare('SELECT * FROM messages WHERE sessionId = ? ORDER BY timestamp ASC');
  const messages = stmt.all(sessionId);
  res.json(messages);
});

// Admin routes
app.get('/api/admin/conversations', (req, res) => {
  // Get latest message for each session
  const stmt = db.prepare(`
    SELECT m1.*, 
      (SELECT COUNT(*) FROM messages m3 WHERE m3.sessionId = m1.sessionId AND m3.sender = 'buyer' AND m3.isRead = 0) as unreadCount
    FROM messages m1
    LEFT JOIN messages m2 ON m1.sessionId = m2.sessionId AND m1.timestamp < m2.timestamp
    WHERE m2.id IS NULL
    ORDER BY m1.timestamp DESC
  `);
  const conversations = stmt.all();
  res.json(conversations);
});

app.post('/api/admin/read/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const stmt = db.prepare('UPDATE messages SET isRead = 1 WHERE sessionId = ? AND sender = ?');
  stmt.run(sessionId, 'buyer');
  res.json({ success: true });
});

// Socket.io for Real-time messaging
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log(`Socket ${socket.id} joined admin room`);
  });

  socket.on('send_message', (data) => {
    const { sessionId, sender, content } = data;
    
    // Save to database
    const stmt = db.prepare('INSERT INTO messages (sessionId, sender, content) VALUES (?, ?, ?)');
    const result = stmt.run(sessionId, sender, content);
    
    const newMsg = {
      id: result.lastInsertRowid,
      sessionId,
      sender,
      content,
      timestamp: new Date().toISOString(),
      isRead: 0
    };
    
    // Broadcast to room (both sender and receiver will get this, sender can ignore or use it as confirmation)
    io.to(sessionId).emit('new_message', newMsg);
    
    // If sender is buyer, notify admin room
    if (sender === 'buyer') {
      io.to('admin_room').emit('admin_new_message', newMsg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function startServer() {
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

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
