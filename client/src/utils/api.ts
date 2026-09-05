const API_BASE = '/api';

export const api = {
  // Dashboard
  async getDashboard() {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  // Sync
  async syncNow() {
    const res = await fetch(`${API_BASE}/bookings/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to synchronize');
    return res.json();
  },

  // Apartments
  async getApartments(params?: { areaId?: string; status?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/apartments?${query}`);
    return res.json();
  },
  async getZones() {
    const res = await fetch(`${API_BASE}/apartments/zones/all`);
    return res.json();
  },
  async createApartment(data: any) {
    const res = await fetch(`${API_BASE}/apartments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateApartment(id: string, data: any) {
    const res = await fetch(`${API_BASE}/apartments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Owners
  async getOwners(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${API_BASE}/owners${query}`);
    return res.json();
  },
  async createOwner(data: any) {
    const res = await fetch(`${API_BASE}/owners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getOwnerStatement(id: string) {
    const res = await fetch(`${API_BASE}/owners/${id}/statement`);
    return res.json();
  },

  // Bookings
  async getBookings(params?: { apartmentId?: string; source?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/bookings?${query}`);
    return res.json();
  },
  async createBooking(data: any) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Cleanings
  async getCleanings(params?: { date?: string; status?: string; cleanerId?: string; tomorrow?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/cleanings?${query}`);
    return res.json();
  },
  async getTomorrowCleanings() {
    const res = await fetch(`${API_BASE}/cleanings/tomorrow`);
    return res.json();
  },
  async assignCleaner(id: string, cleanerId: string) {
    const res = await fetch(`${API_BASE}/cleanings/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cleanerId })
    });
    return res.json();
  },
  async toggleChecklist(cleaningId: string, itemId: string, completed?: boolean) {
    const res = await fetch(`${API_BASE}/cleanings/${cleaningId}/checklist/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    return res.json();
  },
  async updateCleaningStatus(id: string, status: string, inspectedBy?: string) {
    const res = await fetch(`${API_BASE}/cleanings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, inspectedBy })
    });
    return res.json();
  },
  async addCleaningPhoto(id: string, photoData: { url: string; type: string; room?: string; caption?: string }) {
    const res = await fetch(`${API_BASE}/cleanings/${id}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoData)
    });
    return res.json();
  },

  // Maintenance
  async getMaintenance(params?: { apartmentId?: string; status?: string; priority?: string; category?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/maintenance?${query}`);
    return res.json();
  },
  async createMaintenance(data: any) {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateMaintenance(id: string, data: any) {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async addMaintenancePhoto(id: string, photoData: { url: string; type: string; caption?: string }) {
    const res = await fetch(`${API_BASE}/maintenance/${id}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoData)
    });
    return res.json();
  },

  // Inventory
  async getLinen() {
    const res = await fetch(`${API_BASE}/inventory/linen`);
    return res.json();
  },
  async adjustLinen(id: string, action: string, quantity: number) {
    const res = await fetch(`${API_BASE}/inventory/linen/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, quantity })
    });
    return res.json();
  },
  async getWarehouse(category?: string, search?: string) {
    const query = new URLSearchParams({ ...(category && { category }), ...(search && { search }) }).toString();
    const res = await fetch(`${API_BASE}/inventory/warehouse?${query}`);
    return res.json();
  },
  async adjustWarehouse(id: string, delta: number, reason?: string) {
    const res = await fetch(`${API_BASE}/inventory/warehouse/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta, reason })
    });
    return res.json();
  },

  // Lost Items
  async getLostItems(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/lost-items?${query}`);
    return res.json();
  },
  async createLostItem(data: any) {
    const res = await fetch(`${API_BASE}/lost-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateLostItem(id: string, data: any) {
    const res = await fetch(`${API_BASE}/lost-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Telegram
  async getTelegramPins() {
    const res = await fetch(`${API_BASE}/telegram/pins`);
    return res.json();
  },
  async generateTelegramPin(userId: string) {
    const res = await fetch(`${API_BASE}/telegram/pins/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },
  async getTelegramMessages() {
    const res = await fetch(`${API_BASE}/telegram/messages`);
    return res.json();
  },
  async simulateTelegramMessage(text: string, mediaUrl?: string) {
    const res = await fetch(`${API_BASE}/telegram/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mediaUrl })
    });
    return res.json();
  },

  // Users
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },
  async createUser(data: any) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateUser(id: string, data: any) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // File Upload
  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  }
};
