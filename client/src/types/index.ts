export type UserRole =
  | 'super_admin'
  | 'operations_manager'
  | 'property_manager'
  | 'cleaning_supervisor'
  | 'cleaner'
  | 'maintenance'
  | 'warehouse'
  | 'owner';

export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  telegramPin?: string;
  telegramChatId?: string;
  phone?: string;
  active: boolean;
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  apartmentCount?: number;
}

export interface Apartment {
  id: string;
  name: string;
  areaId: string;
  areaName: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  keyLockboxCode: string;
  smartLockPin?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  ownerId: string;
  ownerName: string;
  status: 'active' | 'maintenance' | 'turnover' | 'inactive';
  imageUrl?: string;
  notes?: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  apartmentIds: string[];
  commissionRate: number;
  monthlyEarnings?: number;
  apartmentsCount?: number;
  status: 'active' | 'inactive';
}

export type BookingSource = 'Airbnb' | 'Booking.com' | 'Guesty' | 'Direct' | 'Lodgify' | 'Other';

export interface Booking {
  id: string;
  apartmentId: string;
  apartmentName: string;
  areaName: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestCount: number;
  startDate: string;
  endDate: string;
  source: BookingSource;
  payout: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  notes?: string;
  cleaningJobId?: string;
}

export interface ChecklistItem {
  id: string;
  room: 'Bedroom' | 'Bathroom' | 'Kitchen' | 'Living Room' | 'Balcony' | 'General';
  task: string;
  completed: boolean;
}

export interface CleaningPhoto {
  id: string;
  type: 'before' | 'after' | 'damage';
  url: string;
  timestamp: string;
  room?: string;
  caption?: string;
}

export interface CleaningJob {
  id: string;
  apartmentId: string;
  apartmentName: string;
  areaName: string;
  bookingId?: string;
  guestName?: string;
  scheduledDate: string;
  timeWindow: string;
  type: 'turnover' | 'deep_clean' | 'mid_stay' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'inspected';
  cleanerId?: string;
  cleanerName?: string;
  cleanerPhone?: string;
  notes?: string;
  checklist: ChecklistItem[];
  photos: CleaningPhoto[];
  linenUsed: {
    bathTowels: number;
    handTowels: number;
    bedSheets: number;
    pillowcases: number;
    duvetCovers: number;
  };
  startedAt?: string;
  completedAt?: string;
  inspectedBy?: string;
}

export interface MaintenancePhoto {
  id: string;
  type: 'reported' | 'fixed';
  url: string;
  timestamp: string;
  caption?: string;
}

export interface MaintenanceTask {
  id: string;
  apartmentId: string;
  apartmentName: string;
  areaName: string;
  title: string;
  description: string;
  category: 'Plumbing' | 'Electrical' | 'HVAC' | 'Appliances' | 'Furniture' | 'Key/Lock' | 'General';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'reported' | 'in_progress' | 'waiting_parts' | 'resolved';
  assigneeId?: string;
  assigneeName?: string;
  estimatedBudget: number;
  actualCost: number;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  photos: MaintenancePhoto[];
  notes?: string;
}

export interface LinenItem {
  id: string;
  name: string;
  total: number;
  clean: number;
  dirty: number;
  inTransit: number;
  minThreshold: number;
  unit: string;
}

export interface WarehouseItem {
  id: string;
  name: string;
  category: 'Amenities' | 'Cleaning Supplies' | 'Maintenance' | 'Linens' | 'Beverages';
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  costPerUnit: number;
}

export interface LostItem {
  id: string;
  apartmentId: string;
  apartmentName: string;
  itemName: string;
  category: 'Electronics' | 'Jewelry' | 'Clothing' | 'Documents' | 'Accessories' | 'Other';
  description: string;
  foundDate: string;
  foundBy: string;
  guestName?: string;
  bookingId?: string;
  storageLocation: string;
  photoUrl?: string;
  status: 'reported' | 'guest_contacted' | 'claimed' | 'disposed';
  notes?: string;
}

export interface ExtraService {
  id: string;
  apartmentId: string;
  apartmentName: string;
  guestName: string;
  serviceName: string;
  price: number;
  date: string;
  status: 'requested' | 'confirmed' | 'completed' | 'billed';
}

export interface TelegramMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  type?: 'text' | 'task_assignment' | 'photo' | 'alert';
  mediaUrl?: string;
  buttons?: Array<{ text: string; callback_data: string }>;
}

export interface DashboardData {
  stats: {
    apartments: number;
    owners: number;
    activeApartments: number;
    areas: number;
  };
  operationalMetrics: {
    checkInsToday: number;
    checkInsLabel: string;
    checkOutsToday: number;
    checkOutsLabel: string;
    occupancyNow: number;
    occupancyLabel: string;
    bookingsThisMonth: number;
    bookingsThisMonthLabel: string;
  };
  weeklyTurnover: {
    totalScheduled: number;
    subtitle: string;
    days: Array<{ day: string; count: number; label: string }>;
  };
  priorityQueue: Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    severity: string;
    target: string;
  }>;
  summaryByArea: Array<{
    id: string;
    name: string;
    count: number;
    label: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    title: string;
    details: string;
    timestamp: string;
    entityType: string;
  }>;
  lastSyncTime: string;
}
