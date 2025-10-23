import { create } from 'zustand';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],

  connect: (userId) => {
    const { socket: existingSocket } = get();
    
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:5000', {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
      
      // Join user room for personalized updates
      socket.emit('join-room', userId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('news-update', (data) => {
      console.log('News update received:', data);
      toast.success('New articles available!');
    });

    socket.on('reading-update', (data) => {
      console.log('Reading update:', data);
    });

    socket.on('notification', (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications.slice(0, 49)] // Keep last 50
      }));
      
      if (notification.type === 'breaking') {
        toast.success(`Breaking: ${notification.title}`, {
          duration: 6000
        });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error. Some features may not work.');
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emit: (event, data) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  }
}));