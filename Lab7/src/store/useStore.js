import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = 'http://localhost:3000';

const useStore = create(
  persist(
    (set, get) => ({
      destinations: [],
      theme: 'dark', // default theme
      token: null,
      
      // Theme actions
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      // Auth
      authenticate: async () => {
        try {
          // Getting an ADMIN token to allow all operations for demo purposes
          const res = await fetch(`${API_BASE}/token?role=ADMIN&permissions=READ,WRITE,DELETE`);
          const data = await res.json();
          if (data.token) {
            set({ token: data.token });
          }
        } catch (error) {
          console.error("Failed to authenticate", error);
        }
      },

      // Destination actions
      fetchDestinations: async (skip = 0, limit = 50) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/api/destinations?skip=${skip}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            set({ destinations: data.data || [] });
          } else if (res.status === 403 || res.status === 401) {
            // Token likely expired (1 minute limit), re-authenticate
            await get().authenticate();
            get().fetchDestinations(skip, limit);
          }
        } catch (error) {
          console.error("Failed to fetch destinations", error);
        }
      },

      addDestination: async (destination) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/api/destinations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(destination)
          });
          const newDest = await res.json();
          if (res.ok) {
            set((state) => ({ destinations: [newDest, ...state.destinations] }));
          }
        } catch (error) {
          console.error("Failed to add", error);
        }
      },
      
      removeDestination: async (id) => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/api/destinations/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            set((state) => ({
              destinations: state.destinations.filter(d => d.id !== id)
            }));
          }
        } catch (error) {
          console.error("Failed to delete", error);
        }
      },
      
      updateStatus: async (id, status) => {
        const { token, destinations } = get();
        if (!token) return;
        try {
          const dest = destinations.find(d => d.id === id);
          if (!dest) return;
          const res = await fetch(`${API_BASE}/api/destinations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...dest, status })
          });
          if (res.ok) {
            set((state) => ({
              destinations: state.destinations.map(d => d.id === id ? { ...d, status } : d)
            }));
          }
        } catch (error) {
          console.error("Failed to update status", error);
        }
      },

      updateDestination: async (id, updates) => {
        const { token, destinations } = get();
        if (!token) return;
        try {
          const dest = destinations.find(d => d.id === id);
          if (!dest) return;
          const res = await fetch(`${API_BASE}/api/destinations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...dest, ...updates })
          });
          if (res.ok) {
            set((state) => ({
              destinations: state.destinations.map(d => d.id === id ? { ...d, ...updates } : d)
            }));
          }
        } catch (error) {
          console.error("Failed to update destination", error);
        }
      },

      toggleLike: async (id) => {
        const { token, destinations } = get();
        if (!token) return;
        try {
          const dest = destinations.find(d => d.id === id);
          if (!dest) return;
          const updatedLiked = !dest.liked;
          const res = await fetch(`${API_BASE}/api/destinations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...dest, liked: updatedLiked })
          });
          if (res.ok) {
            set((state) => ({
              destinations: state.destinations.map(d => d.id === id ? { ...d, liked: updatedLiked } : d)
            }));
          }
        } catch (error) {
          console.error("Failed to toggle like", error);
        }
      }
    }),
    {
      name: 'destinations-storage',
      partialize: (state) => ({ theme: state.theme, token: state.token }), // don't persist destinations array locally anymore
    }
  )
);

export default useStore;