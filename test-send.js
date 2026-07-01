import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
socket.on('connect', () => {
  socket.emit('send_message', { sessionId: 'test-session-123', sender: 'buyer', content: 'test msg' });
  setTimeout(() => {
    socket.disconnect();
    console.log("Sent");
  }, 1000);
});
