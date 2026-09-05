# 🏢 PropFlow - Property & Cleaning Operations Management System


> 🚀 **Live Production Demo (Administrator View)**: [https://propflow-orpin.vercel.app](https://propflow-orpin.vercel.app)

PropFlow is an end-to-end apartment turnover, cleaning operations, and property management platform tailored for short-term rental managers, field staff, and property owners.

---

## 🌟 Implemented Features & Modules

### 1. 🏢 Apartment & Property-Owner Management
- **Apartments**: Full inventory tracking (`test 1`, `test 2`), key lockbox codes, smart lock PINs, Wi-Fi credentials, bedroom/bathroom configurations, and assigned owners.
- **Owners**: Owner directory, contact information, commission calculation (15-20%), and automated financial statement generators.
- **Zones / Areas**: Multi-area clustering (`test area 1`, `test area 2`) with live distribution indicators.

### 2. 🧹 Cleaning Operations & "Cleaning Tomorrow"
- **"Cleaning Tomorrow" Dedicated Page**: Dedicated view for upcoming checkout turnovers.
- **Cleaner Assignment**: One-click staff assignment with auto-notification dispatch.
- **Interactive Checklists**: Room-by-room inspection for Bedroom, Bathroom, Kitchen, Living Room, and Balcony.
- **Automated Linen Deduction**: Marking a cleaning as completed automatically deducts clean sets and logs dirty linen to the laundry tally.

### 3. 🛠️ Maintenance Task Tracking
- **Work Orders**: Categorized by Plumbing, Electrical, HVAC, Appliances, Key/Lock, and General.
- **Priority Management**: Low, Medium, High, and Urgent (which fires instant alerts).
- **Budgeting**: Estimated budget vs actual cost tracking.
- **Photo Attachments**: Before-and-after maintenance proof records.

### 4. 🤖 Telegram Bot Integration & Live Simulator
- **Telegram PIN Management**: 6-digit pairing PINs (`/link <PIN>`) for cleaners and technicians.
- **Live In-App Bot Simulator**: An embedded mobile chat simulator allowing you to test bot commands (`/start`, `/link 482910`, `/tasks`, `/accept_cln-1`, `/complete_cln-1`, `/report_lost`) directly in the browser with real-time feedback!
- **Instant Alerts**: Automated broadcasts for urgent maintenance, lost items, and turnover assignments.

### 5. 📸 Photo Documentation & Gallery
- Dedicated photo upload engine for before/after cleaning inspection, maintenance damage evidence, and lost-and-found items.
- Timestamped photos with room categorisation.

### 6. 📦 Lost-Item Reporting with Admin Alerts
- Registered lost & found item catalog with storage locker assignment (`Operations Safe Box #04`).
- Guest contact tracking (Reported, Guest Contacted, Claimed/Returned).
- Feeds into the **Priority Queue ("Needs attention")** widget on the home dashboard.

### 7. 🧺 Linen & Warehouse Stock Management
- **Linen Stock**: Real-time tracking of Bath towels, Hand towels, Bed sheets, Pillowcases, Duvet covers.
- **Direct UI Match**: Recreates alerts (*"Bath towels - 0 pieces remaining"*, *"Hand towels - 0 pieces remaining"*, etc.).
- **Warehouse Supplies**: Amenities, toiletries, cleaning cloths, and smart lock batteries with reorder threshold alerts.

### 8. 📅 Booking Calendar & Operational Reports
- **Multi-Channel Timeline**: Gantt chart with Airbnb (Red), Booking.com (Blue), Guesty (Green), Direct (Pink), Lodgify (Orange), and Other (Grey).
- **Calendar Views**: Timeline (Gantt), Monthly grid, and List view.
- **Live Sync**: "Sync now" button with "Last sync 5 minutes ago" counter that simulates OTA iCal updates.

### 9. 📊 PDF, Excel, and CSV Exports
- Comprehensive export engine for operational records:
  - **Apartments**: One-click CSV, Excel (`.xlsx`), and PDF generation.
  - **Bookings**: One-click CSV, Excel (`.xlsx`), and PDF generation.
  - **Maintenance**: One-click CSV, Excel (`.xlsx`), and PDF generation.

### 10. 👥 Role-Based Staff Access (RBAC)
- Fast Role Simulator Switcher in the top bar:
  - **Administrator** (Full control — Active on Live Vercel Demo)
  - **Operations Manager** (Turnovers & inventory)
  - **Cleaner** (Mobile checklist & turnovers)
  - **Technician** (Work orders & repair photos)
  - **Owner** (Investor portal & earnings)

---

## 🧪 Verification & Test Results

| Test Suite | Target | Result |
| :--- | :--- | :--- |
| **Backend API Health** | `GET /api/health` | ✅ 200 OK |
| **Dashboard Aggregation** | `GET /api/dashboard` | ✅ 200 OK (Loaded stats & priority queue) |
| **Cleaning Tomorrow** | `GET /api/cleanings/tomorrow` | ✅ 200 OK |
| **Telegram Pairing** | `POST /api/telegram/simulate (/link 482910)` | ✅ 200 OK (Linked Elena Volkova) |
| **PDF Export Engine** | `GET /api/exports/apartments/pdf` | ✅ 200 OK (`application/pdf`) |
| **Excel Export Engine** | `GET /api/exports/bookings/excel` | ✅ 200 OK (`application/vnd.openxmlformats...`) |
| **Live OTA Sync** | `POST /api/bookings/sync` | ✅ 200 OK (Updated sync timestamp & log) |
| **Client Bundle** | `npm --prefix client run build` | ✅ Clean build (0 errors) |
| **Server TypeScript** | `npm --prefix server run build` | ✅ Clean build (0 errors) |

---

## 🚀 How to Run the Application Locally

### Prerequisites
- Node.js (v18 or higher)
- npm


### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/UminduST/PropFlow.git](https://github.com/UminduST/PropFlow.git)
   cd PropFlow

2. **Install dependencies**:
   - npm install
   - npm --prefix client install
   - npm --prefix server install
     
3. **Start local development servers**:
   - npm run dev
  
4. **Access the endpoints**:
   - Client Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
  
### License

   - This project is open-source and available under the MIT License.
