class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(examId, studentId) {
    const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
    this.socket = new WebSocket(`${WS_URL}/monitor/${examId}/${studentId}`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.emit('connected', { examId, studentId });
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    };
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  sendFrame(frameData) {
    this.send({ type: 'frame', frame: frameData });
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService();