import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { truckDetails, messages, inquiries } from './src/db/schema.ts';
import { eq, desc, and, sql } from 'drizzle-orm';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

// API Routes
app.use(express.json());

// Initialize default truck details if not exists
async function initTruckDetails() {
  try {
    const existing = await db.select().from(truckDetails).where(eq(truckDetails.id, 1));
    if (existing.length === 0) {
      await db.insert(truckDetails).values({ id: 1, mileage: '78,000', price: '23,900' });
    }
  } catch (error) {
    console.error("Error initializing truck details:", error);
  }
}
initTruckDetails();

app.get('/api/truck-details', async (req, res) => {
  try {
    const details = await db.select().from(truckDetails).where(eq(truckDetails.id, 1));
    res.json(details[0] || { mileage: '78,000', price: '23,900' });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch truck details" });
  }
});

app.post('/api/truck-details', async (req, res) => {
  try {
    const { mileage, price } = req.body;
    await db.update(truckDetails)
      .set({ mileage, price })
      .where(eq(truckDetails.id, 1));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update truck details" });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    await db.insert(inquiries).values({ name, phone, email, message });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

app.get('/api/admin/inquiries', async (req, res) => {
  try {
    const allInquiries = await db.select().from(inquiries).orderBy(desc(inquiries.timestamp));
    res.json(allInquiries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

app.get('/api/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionMsgs = await db.select().from(messages).where(eq(messages.sessionId, sessionId)).orderBy(messages.timestamp);
    res.json(sessionMsgs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Admin routes
app.get('/api/admin/conversations', async (req, res) => {
  try {
    // Basic implementation: get all unique sessions and calculate unread count
    // A more complex query could do this in one go, but this is simpler for SQLite -> Postgres translation
    const allMsgs = await db.select().from(messages).orderBy(desc(messages.timestamp));
    
    const sessionsMap = new Map();
    for (const msg of allMsgs) {
      if (!sessionsMap.has(msg.sessionId)) {
        sessionsMap.set(msg.sessionId, { ...msg, unreadCount: 0 });
      }
      if (msg.sender === 'buyer' && msg.isRead === 0) {
        sessionsMap.get(msg.sessionId).unreadCount++;
      }
    }
    
    const conversations = Array.from(sessionsMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

app.post('/api/admin/read/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await db.update(messages)
      .set({ isRead: 1 })
      .where(and(eq(messages.sessionId, sessionId), eq(messages.sender, 'buyer')));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
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

  socket.on('send_message', async (data) => {
    const { sessionId, sender, content } = data;
    
    try {
      // Save to database
      const result = await db.insert(messages).values({
        sessionId,
        sender,
        content
      }).returning();
      
      const savedMsg = result[0];
      
      const newMsg = {
        id: savedMsg.id,
        sessionId: savedMsg.sessionId,
        sender: savedMsg.sender,
        content: savedMsg.content,
        timestamp: savedMsg.timestamp,
        isRead: savedMsg.isRead
      };
      
      // Broadcast to room (both sender and receiver will get this, sender can ignore or use it as confirmation)
      io.to(sessionId).emit('new_message', newMsg);
      
      // If sender is buyer, notify admin room
      if (sender === 'buyer') {
        io.to('admin_room').emit('admin_new_message', newMsg);
      }
    } catch (error) {
      console.error("Failed to save message", error);
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
