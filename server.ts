import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, updateDoc, where } from 'firebase/firestore';
import { db } from './src/firebase.ts';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

// API Routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize default truck details if not exists
async function initTruckDetails() {
  try {
    const docRef = doc(db, 'truckDetails', 'main');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, { mileage: '78,000', price: '23,900' });
    }
  } catch (error) {
    console.error("Error initializing truck details:", error);
  }
}
initTruckDetails();

app.get('/api/truck-details', async (req, res) => {
  try {
    const docRef = doc(db, 'truckDetails', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      res.json(docSnap.data());
    } else {
      res.json({ mileage: '78,000', price: '23,900' });
    }
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch truck details" });
  }
});

app.post('/api/truck-details', async (req, res) => {
  try {
    const docRef = doc(db, 'truckDetails', 'main');
    await setDoc(docRef, req.body, { merge: true });
    res.json({ success: true });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Failed to update truck details" });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    await addDoc(collection(db, 'inquiries'), { 
      name, phone, email, message, timestamp: Date.now() 
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

app.get('/api/admin/inquiries', async (req, res) => {
  try {
    const q = query(collection(db, 'inquiries'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const allInquiries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(allInquiries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

app.get('/api/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const q = query(collection(db, 'messages'), where('sessionId', '==', sessionId), orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    const sessionMsgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(sessionMsgs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Admin routes
app.get('/api/admin/conversations', async (req, res) => {
  try {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const allMsgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
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
    const q = query(collection(db, 'messages'), where('sessionId', '==', sessionId), where('sender', '==', 'buyer'));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(docSnapshot => 
      updateDoc(doc(db, 'messages', docSnapshot.id), { isRead: 1 })
    );
    await Promise.all(updatePromises);
    
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
      const msgData = {
        sessionId,
        sender,
        content,
        timestamp: Date.now(),
        isRead: 0
      };
      
      // Save to database
      const docRef = await addDoc(collection(db, 'messages'), msgData);
      
      const newMsg = {
        id: docRef.id,
        ...msgData
      };
      
      // Broadcast to room
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

