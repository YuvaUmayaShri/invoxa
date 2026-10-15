const fs = require('fs');
const path = require('path');
const sharp = require(path.join(__dirname, 'node_modules', 'sharp'));

const ASSETS_DIR = path.join(__dirname, 'Presentation_Assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// 1. ARCHITECTURE DIAGRAM SVG
const archSvg = `
<svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="700" fill="#FFFFFF" rx="10"/>
  <rect x="20" y="20" width="1160" height="660" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" rx="8"/>
  
  <text x="600" y="55" font-family="'Segoe UI', Roboto, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="#0F172A" text-anchor="middle">INVOXA THREE-TIER MERN SYSTEM ARCHITECTURE</text>
  <text x="600" y="80" font-family="'Segoe UI', Roboto, Helvetica, sans-serif" font-size="13" fill="#64748B" text-anchor="middle">Decoupled Single-Page Client, Modular Express.js REST API Gateway, and Scalable Mongoose Data Tier</text>

  <!-- TIER 1: CLIENT PRESENTATION TIER -->
  <g transform="translate(50, 105)">
    <rect width="1100" height="150" rx="8" fill="#F0FDFA" stroke="#00A896" stroke-width="2"/>
    <rect width="250" height="30" rx="6" fill="#00A896"/>
    <text x="125" y="20" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CLIENT PRESENTATION TIER</text>
    
    <!-- Boxes -->
    <rect x="30" y="45" width="230" height="90" rx="6" fill="#FFFFFF" stroke="#99F6E4" stroke-width="1.5"/>
    <text x="145" y="72" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">React 18 + Vite SPA</text>
    <text x="145" y="92" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• 11 Dedicated Pages</text>
    <text x="145" y="108" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• React Router v6 DOM</text>
    <text x="145" y="124" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• Protected Route Guards</text>

    <rect x="295" y="45" width="230" height="90" rx="6" fill="#FFFFFF" stroke="#99F6E4" stroke-width="1.5"/>
    <text x="410" y="72" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">State &amp; Context Layer</text>
    <text x="410" y="92" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• AuthContext (JWT/User)</text>
    <text x="410" y="108" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• ThemeContext (Warm Dark)</text>
    <text x="410" y="124" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• Toast &amp; Notification Context</text>

    <rect x="560" y="45" width="230" height="90" rx="6" fill="#FFFFFF" stroke="#99F6E4" stroke-width="1.5"/>
    <text x="675" y="72" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Styling &amp; Data Viz</text>
    <text x="675" y="92" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• Tailwind CSS Utility Tokens</text>
    <text x="675" y="108" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• Recharts (Cashflow &amp; Funnels)</text>
    <text x="675" y="124" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• Lucide Icons &amp; Confetti</text>

    <rect x="825" y="45" width="245" height="90" rx="6" fill="#FFFFFF" stroke="#99F6E4" stroke-width="1.5"/>
    <text x="947" y="72" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">API Client Wrapper (api.js)</text>
    <text x="947" y="92" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• Native Fetch HTTP client</text>
    <text x="947" y="108" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• Auto Bearer JWT Injection</text>
    <text x="947" y="124" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">• 401 Session Interceptor</text>
  </g>

  <!-- ARROWS -->
  <line x1="600" y1="260" x2="600" y2="285" stroke="#00A896" stroke-width="3"/>
  <polygon points="600,290 595,280 605,280" fill="#00A896"/>
  <text x="660" y="278" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#00A896">RESTful API / JSON Payloads</text>

  <!-- TIER 2: APPLICATION & SERVER TIER -->
  <g transform="translate(50, 295)">
    <rect width="1100" height="235" rx="8" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
    <rect width="250" height="30" rx="6" fill="#1E293B"/>
    <text x="125" y="20" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">APPLICATION / BACKEND TIER</text>

    <!-- Middleware strip -->
    <rect x="30" y="40" width="1040" height="32" rx="4" fill="#E2E8F0"/>
    <text x="550" y="61" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="bold" fill="#1E293B" text-anchor="middle">
      Middlewares: CORS Filter • Morgan Logger • Express JSON/URL Body Parsers • authMiddleware (JWT) • roleMiddleware (RBAC) • Multer (Storage) • errorHandler
    </text>

    <!-- Sub-containers -->
    <rect x="30" y="80" width="505" height="140" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="282" y="105" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">REST API Controllers &amp; Endpoints</text>
    <text x="45" y="128" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• authController: /api/auth/login, /register, /me (JWT Auth)</text>
    <text x="45" y="148" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• invoiceController: CRUD /api/invoices, /upload, /verify</text>
    <text x="45" y="168" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• approvalController: /api/approvals (Approve / Reject / Review)</text>
    <text x="45" y="188" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• paymentController: /api/payments, /api/payments/:id/process-payment</text>
    <text x="45" y="208" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• reportController, vendorController, activityController, userController</text>

    <rect x="565" y="80" width="505" height="140" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="817" y="105" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Core Specialized Business Logic Engines</text>
    <text x="580" y="128" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#0284C7">• 7-Point Verification Engine (verificationService.js)</text>
    <text x="590" y="145" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#64748B">Vendor registry check, date logic, line math, 18% GST audit (0-100 score)</text>
    <text x="580" y="165" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#DC2626">• Multi-Signal Duplicate Engine (duplicateService.js)</text>
    <text x="590" y="182" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#64748B">Normalized Levenshtein edit distance + amount/vendor/date token matching</text>
    <text x="580" y="202" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#059669">• Payment Settlement &amp; Reminder Engine (30-min sweeps, UTR generator)</text>
  </g>

  <!-- ARROWS -->
  <line x1="600" y1="535" x2="600" y2="550" stroke="#00A896" stroke-width="3"/>
  <polygon points="600,555 595,545 605,545" fill="#00A896"/>

  <!-- TIER 3: DATA TIER -->
  <g transform="translate(50, 560)">
    <rect width="1100" height="105" rx="8" fill="#F0FDFA" stroke="#00A896" stroke-width="2"/>
    <rect width="250" height="26" rx="6" fill="#00A896"/>
    <text x="125" y="18" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">DATA &amp; PERSISTENCE TIER</text>

    <rect x="30" y="38" width="505" height="55" rx="6" fill="#FFFFFF" stroke="#99F6E4" stroke-width="1.5"/>
    <text x="282" y="58" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#0F172A" text-anchor="middle">MongoDB Mongoose Document Collections</text>
    <text x="282" y="78" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">Users • Vendors • Invoices • Payments • Transactions • Reminders • ActivityLogs • Notifications</text>

    <rect x="565" y="38" width="505" height="55" rx="6" fill="#FFFFFF" stroke="#99F6E4" stroke-width="1.5"/>
    <text x="817" y="58" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#0F172A" text-anchor="middle">Hybrid Database Execution Architecture</text>
    <text x="817" y="78" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569" text-anchor="middle">External MongoDB (Port 27017) with auto-fallback to embedded MongoMemoryServer</text>
  </g>
</svg>
`;

// 2. USE CASE DIAGRAM SVG
const usecaseSvg = `
<svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="700" fill="#FFFFFF" rx="10"/>
  <rect x="20" y="20" width="1160" height="660" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" rx="8"/>

  <text x="600" y="55" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold" fill="#0F172A" text-anchor="middle">INVOXA PLATFORM USE CASE DIAGRAM</text>
  <text x="600" y="80" font-family="'Segoe UI', sans-serif" font-size="13" fill="#64748B" text-anchor="middle">Role-Based Actor Interactions across System Operational Boundaries</text>

  <!-- SYSTEM BOUNDARY -->
  <rect x="280" y="105" width="640" height="550" rx="12" fill="#FFFFFF" stroke="#00A896" stroke-width="2.5" stroke-dasharray="6,4"/>
  <text x="600" y="132" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="bold" fill="#00A896" text-anchor="middle">«System Boundary» INVOXA Platform</text>

  <!-- ACTORS (LEFT: VENDOR & ACCOUNTS TEAM, RIGHT: ADMIN) -->
  <!-- ACTOR 1: VENDOR -->
  <g transform="translate(100, 190)">
    <circle cx="40" cy="30" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="48" x2="40" y2="90" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="15" y1="65" x2="65" y2="65" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="90" x2="20" y2="130" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="90" x2="60" y2="130" stroke="#0F172A" stroke-width="2.5"/>
    <text x="40" y="155" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Vendor</text>
    <text x="40" y="172" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#64748B" text-anchor="middle">(External Supplier)</text>
  </g>

  <!-- ACTOR 2: ACCOUNTS TEAM -->
  <g transform="translate(100, 430)">
    <circle cx="40" cy="30" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="48" x2="40" y2="90" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="15" y1="65" x2="65" y2="65" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="90" x2="20" y2="130" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="90" x2="60" y2="130" stroke="#0F172A" stroke-width="2.5"/>
    <text x="40" y="155" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Accounts Officer</text>
    <text x="40" y="172" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#64748B" text-anchor="middle">(AP Department)</text>
  </g>

  <!-- ACTOR 3: ADMINISTRATOR -->
  <g transform="translate(1020, 310)">
    <circle cx="40" cy="30" r="18" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="48" x2="40" y2="90" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="15" y1="65" x2="65" y2="65" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="90" x2="20" y2="130" stroke="#0F172A" stroke-width="2.5"/>
    <line x1="40" y1="90" x2="60" y2="130" stroke="#0F172A" stroke-width="2.5"/>
    <text x="40" y="155" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#0F172A" text-anchor="middle">Administrator</text>
    <text x="40" y="172" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#64748B" text-anchor="middle">(Finance Head / Lead)</text>
  </g>

  <!-- USE CASES (ELLIPSES) -->
  <!-- UC1 -->
  <g transform="translate(320, 160)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Authenticate &amp; Manage Profile</text>
  </g>

  <!-- UC2 -->
  <g transform="translate(620, 160)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Upload Invoice &amp; Documents</text>
  </g>

  <!-- UC3 -->
  <g transform="translate(320, 240)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Run 7-Point Integrity Audit</text>
  </g>

  <!-- UC4 -->
  <g transform="translate(620, 240)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Detect Multi-Signal Duplicates</text>
  </g>

  <!-- UC5 -->
  <g transform="translate(320, 320)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Approve / Reject Invoices</text>
  </g>

  <!-- UC6 -->
  <g transform="translate(620, 320)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Process Payout &amp; Generate UTR</text>
  </g>

  <!-- UC7 -->
  <g transform="translate(320, 400)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Track Own Invoices &amp; Ledger</text>
  </g>

  <!-- UC8 -->
  <g transform="translate(620, 400)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Manage Vendor Directory</text>
  </g>

  <!-- UC9 -->
  <g transform="translate(320, 480)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">View Reports &amp; Cashflow Trends</text>
  </g>

  <!-- UC10 -->
  <g transform="translate(620, 480)">
    <ellipse cx="120" cy="24" rx="110" ry="22" fill="#F0FDFA" stroke="#00A896" stroke-width="1.8"/>
    <text x="120" y="28" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="600" fill="#0F172A" text-anchor="middle">Audit Immutable Activity Logs</text>
  </g>

  <!-- CONNECTING LINES -->
  <!-- Vendor Lines -->
  <line x1="165" y1="240" x2="330" y2="185" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="165" y1="240" x2="630" y2="185" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="165" y1="240" x2="330" y2="420" stroke="#94A3B8" stroke-width="1.5"/>

  <!-- Accounts Officer Lines -->
  <line x1="165" y1="480" x2="330" y2="185" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="165" y1="480" x2="330" y2="260" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="165" y1="480" x2="630" y2="260" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="165" y1="480" x2="330" y2="340" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="165" y1="480" x2="630" y2="340" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="165" y1="480" x2="330" y2="500" stroke="#94A3B8" stroke-width="1.5"/>

  <!-- Admin Lines -->
  <line x1="1020" y1="360" x2="850" y2="185" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="1020" y1="360" x2="550" y2="340" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="1020" y1="360" x2="850" y2="420" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="1020" y1="360" x2="850" y2="500" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="1020" y1="360" x2="550" y2="500" stroke="#94A3B8" stroke-width="1.5"/>
</svg>
`;

// 3. ER DIAGRAM SVG
const erSvg = `
<svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="700" fill="#FFFFFF" rx="10"/>
  <rect x="20" y="20" width="1160" height="660" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" rx="8"/>

  <text x="600" y="55" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold" fill="#0F172A" text-anchor="middle">INVOXA DATABASE ENTITY-RELATIONSHIP (ER) DIAGRAM</text>
  <text x="600" y="80" font-family="'Segoe UI', sans-serif" font-size="13" fill="#64748B" text-anchor="middle">Mongoose Document Collections, Foreign Key References, and Embedded Schemas</text>

  <!-- ENTITY: USER -->
  <g transform="translate(50, 105)">
    <rect width="240" height="235" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
    <rect width="240" height="28" rx="6" fill="#00A896"/>
    <text x="120" y="19" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">User</text>
    <text x="15" y="46" font-family="'Courier New', monospace" font-size="10.5" font-weight="bold" fill="#0F172A">PK _id: ObjectId</text>
    <text x="15" y="66" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• name: String</text>
    <text x="15" y="86" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• email: String (Unique)</text>
    <text x="15" y="106" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• password: Hash (Bcrypt)</text>
    <text x="15" y="126" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• role: Enum [ADMIN, ...]</text>
    <text x="15" y="146" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• department: String</text>
    <text x="15" y="166" font-family="'Courier New', monospace" font-size="10.5" fill="#0284C7">FK vendor: ObjectId (Vendor)</text>
    <text x="15" y="186" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• isActive: Boolean</text>
    <text x="15" y="206" font-family="'Courier New', monospace" font-size="10.5" fill="#64748B">• timestamps (created/upd)</text>
  </g>

  <!-- ENTITY: VENDOR -->
  <g transform="translate(330, 105)">
    <rect width="250" height="235" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
    <rect width="250" height="28" rx="6" fill="#1E293B"/>
    <text x="125" y="19" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Vendor</text>
    <text x="15" y="46" font-family="'Courier New', monospace" font-size="10.5" font-weight="bold" fill="#0F172A">PK _id: ObjectId</text>
    <text x="15" y="66" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• vendorId: String (Unique)</text>
    <text x="15" y="86" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• name, companyName: String</text>
    <text x="15" y="106" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• email, phone: String</text>
    <text x="15" y="126" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• gstin, panNumber: String</text>
    <text x="15" y="146" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• bankDetails: Subdoc</text>
    <text x="15" y="166" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• totalInvoices: Number</text>
    <text x="15" y="186" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• paidAmount, outstanding: Num</text>
    <text x="15" y="206" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• status: ACTIVE | INACTIVE</text>
  </g>

  <!-- ENTITY: INVOICE -->
  <g transform="translate(620, 105)">
    <rect width="260" height="285" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
    <rect width="260" height="28" rx="6" fill="#00A896"/>
    <text x="130" y="19" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Invoice</text>
    <text x="15" y="46" font-family="'Courier New', monospace" font-size="10.5" font-weight="bold" fill="#0F172A">PK _id: ObjectId</text>
    <text x="15" y="64" font-family="'Courier New', monospace" font-size="10" fill="#334155">• invoiceNumber: String</text>
    <text x="15" y="82" font-family="'Courier New', monospace" font-size="10" fill="#0284C7">FK vendor: ObjectId (Vendor)</text>
    <text x="15" y="100" font-family="'Courier New', monospace" font-size="10" fill="#334155">• invoiceDate, dueDate: Date</text>
    <text x="15" y="118" font-family="'Courier New', monospace" font-size="10" fill="#334155">• amount, subtotal, tax: Num</text>
    <text x="15" y="136" font-family="'Courier New', monospace" font-size="10" fill="#334155">• status: VERIFIED | PAID ...</text>
    <text x="15" y="154" font-family="'Courier New', monospace" font-size="10" fill="#334155">• verificationChecks: Subdoc</text>
    <text x="15" y="172" font-family="'Courier New', monospace" font-size="10" fill="#DC2626">• isDuplicate: Boolean</text>
    <text x="15" y="190" font-family="'Courier New', monospace" font-size="10" fill="#DC2626">FK duplicateOf: ObjectId (Invoice)</text>
    <text x="15" y="208" font-family="'Courier New', monospace" font-size="10" fill="#334155">• duplicateConfidence: Number</text>
    <text x="15" y="226" font-family="'Courier New', monospace" font-size="10" fill="#334155">• approvalStatus: PENDING ...</text>
    <text x="15" y="244" font-family="'Courier New', monospace" font-size="10" fill="#0284C7">FK paymentId: ObjectId (Payment)</text>
    <text x="15" y="262" font-family="'Courier New', monospace" font-size="10" fill="#334155">• priority: NORMAL | OVERDUE</text>
  </g>

  <!-- ENTITY: PAYMENT -->
  <g transform="translate(920, 105)">
    <rect width="230" height="235" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
    <rect width="230" height="28" rx="6" fill="#1E293B"/>
    <text x="115" y="19" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Payment</text>
    <text x="15" y="46" font-family="'Courier New', monospace" font-size="10.5" font-weight="bold" fill="#0F172A">PK _id: ObjectId</text>
    <text x="15" y="66" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• paymentId: String (Unique)</text>
    <text x="15" y="86" font-family="'Courier New', monospace" font-size="10.5" fill="#0284C7">FK invoice: ObjectId (Invoice)</text>
    <text x="15" y="106" font-family="'Courier New', monospace" font-size="10.5" fill="#0284C7">FK vendor: ObjectId (Vendor)</text>
    <text x="15" y="126" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• amount: Number</text>
    <text x="15" y="146" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• status: PENDING | COMPLETED</text>
    <text x="15" y="166" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• paymentMethod: NEFT | RTGS</text>
    <text x="15" y="186" font-family="'Courier New', monospace" font-size="10.5" fill="#0284C7">FK transaction: ObjectId (Txn)</text>
    <text x="15" y="206" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• processedAt: Date</text>
  </g>

  <!-- ENTITY: TRANSACTION -->
  <g transform="translate(920, 410)">
    <rect width="230" height="220" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
    <rect width="230" height="28" rx="6" fill="#00A896"/>
    <text x="115" y="19" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Transaction</text>
    <text x="15" y="46" font-family="'Courier New', monospace" font-size="10.5" font-weight="bold" fill="#0F172A">PK _id: ObjectId</text>
    <text x="15" y="66" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• transactionId: String</text>
    <text x="15" y="86" font-family="'Courier New', monospace" font-size="10.5" font-weight="bold" fill="#059669">• referenceNumber: Bank UTR</text>
    <text x="15" y="106" font-family="'Courier New', monospace" font-size="10.5" fill="#0284C7">FK payment: ObjectId (Payment)</text>
    <text x="15" y="126" font-family="'Courier New', monospace" font-size="10.5" fill="#0284C7">FK invoice: ObjectId (Invoice)</text>
    <text x="15" y="146" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• amount: Number</text>
    <text x="15" y="166" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• status: SUCCESS | FAILED</text>
    <text x="15" y="186" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• timestamp: Date</text>
  </g>

  <!-- ENTITY: ACTIVITY LOG -->
  <g transform="translate(50, 410)">
    <rect width="240" height="220" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
    <rect width="240" height="28" rx="6" fill="#1E293B"/>
    <text x="120" y="19" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">ActivityLog</text>
    <text x="15" y="46" font-family="'Courier New', monospace" font-size="10.5" font-weight="bold" fill="#0F172A">PK _id: ObjectId</text>
    <text x="15" y="66" font-family="'Courier New', monospace" font-size="10.5" fill="#0284C7">FK user: ObjectId (User)</text>
    <text x="15" y="86" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• userName, userRole: String</text>
    <text x="15" y="106" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• action: LOGIN | APPROVE ...</text>
    <text x="15" y="126" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• entity: INVOICE | PAYMENT</text>
    <text x="15" y="146" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• description: String</text>
    <text x="15" y="166" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• metadata: Mixed Object</text>
    <text x="15" y="186" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• ipAddress, timestamp</text>
  </g>

  <!-- ENTITY: NOTIFICATION & REMINDER -->
  <g transform="translate(330, 410)">
    <rect width="250" height="220" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
    <rect width="250" height="28" rx="6" fill="#00A896"/>
    <text x="125" y="19" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Notification / Reminder</text>
    <text x="15" y="46" font-family="'Courier New', monospace" font-size="10.5" font-weight="bold" fill="#0F172A">PK _id: ObjectId</text>
    <text x="15" y="66" font-family="'Courier New', monospace" font-size="10.5" fill="#0284C7">FK user: ObjectId (Target)</text>
    <text x="15" y="86" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• targetRole: ALL | ADMIN</text>
    <text x="15" y="106" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• type: OVERDUE | DUPLICATE</text>
    <text x="15" y="126" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• title, message: String</text>
    <text x="15" y="146" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• priority: HIGH | MEDIUM</text>
    <text x="15" y="166" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• isRead: Boolean</text>
    <text x="15" y="186" font-family="'Courier New', monospace" font-size="10.5" fill="#334155">• relatedEntity: Subdoc</text>
  </g>

  <!-- RELATIONSHIP LINES -->
  <!-- Vendor to Invoice (1:N) -->
  <line x1="580" y1="200" x2="620" y2="200" stroke="#00A896" stroke-width="2.5"/>
  <text x="585" y="192" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#00A896">1</text>
  <text x="608" y="192" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#00A896">N</text>

  <!-- Invoice to Payment (1:1) -->
  <line x1="880" y1="200" x2="920" y2="200" stroke="#00A896" stroke-width="2.5"/>
  <text x="885" y="192" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#00A896">1</text>
  <text x="908" y="192" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#00A896">1</text>

  <!-- Payment to Transaction (1:1) -->
  <line x1="1035" y1="340" x2="1035" y2="410" stroke="#00A896" stroke-width="2.5"/>
  <text x="1042" y="360" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#00A896">1</text>
  <text x="1042" y="395" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#00A896">1</text>
</svg>
`;

// 4. UI DESIGN / WIREFRAME SLIDE SVG
const uiDesignSvg = `
<svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="700" fill="#FFFFFF" rx="10"/>
  <rect x="20" y="20" width="1160" height="660" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" rx="8"/>

  <text x="600" y="55" font-family="'Segoe UI', sans-serif" font-size="22" font-weight="bold" fill="#0F172A" text-anchor="middle">INVOXA USER INTERFACE DESIGN SYSTEM &amp; KEY SCREENS</text>
  <text x="600" y="80" font-family="'Segoe UI', sans-serif" font-size="13" fill="#64748B" text-anchor="middle">Modern Warm Charcoal &amp; Peach Tokens, Responsive Cards, and Minimalist Financial Operations</text>

  <!-- LEFT: DESIGN SYSTEM SPECIFICATION -->
  <g transform="translate(50, 105)">
    <rect width="340" height="540" rx="8" fill="#FFFFFF" stroke="#00A896" stroke-width="2"/>
    <rect width="340" height="32" rx="8" fill="#00A896"/>
    <text x="170" y="22" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Design Tokens &amp; Visual Language</text>

    <text x="20" y="60" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#0F172A">Color Palette (Tailwind Design System):</text>
    
    <rect x="20" y="75" width="45" height="24" rx="4" fill="#FFF8F1" stroke="#E8DED5"/>
    <text x="75" y="91" font-family="'Segoe UI', sans-serif" font-size="11" fill="#334155">#FFF8F1 (Canvas Cream Base)</text>

    <rect x="20" y="105" width="45" height="24" rx="4" fill="#E9A992"/>
    <text x="75" y="121" font-family="'Segoe UI', sans-serif" font-size="11" fill="#334155">#E9A992 (Brand Peach Accent)</text>

    <rect x="20" y="135" width="45" height="24" rx="4" fill="#1F1916"/>
    <text x="75" y="151" font-family="'Segoe UI', sans-serif" font-size="11" fill="#334155">#1F1916 (Warm Charcoal Dark)</text>

    <rect x="20" y="165" width="45" height="24" rx="4" fill="#6FA77A"/>
    <text x="75" y="181" font-family="'Segoe UI', sans-serif" font-size="11" fill="#334155">#6FA77A (Success / Settled Payout)</text>

    <rect x="20" y="195" width="45" height="24" rx="4" fill="#C96B62"/>
    <text x="75" y="211" font-family="'Segoe UI', sans-serif" font-size="11" fill="#334155">#C96B62 (Urgent Overdue Alert)</text>

    <line x1="20" y1="235" x2="320" y2="235" stroke="#E2E8F0" stroke-width="1.5"/>

    <text x="20" y="260" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#0F172A">Typography Hierarchy:</text>
    <text x="20" y="280" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• Headings: Plus Jakarta Sans (Bold 600/700)</text>
    <text x="20" y="300" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• Body &amp; Data: Inter (Regular / Medium 400/500)</text>
    <text x="20" y="320" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• Code &amp; UTRs: Consolas / Courier Monospace</text>

    <line x1="20" y1="340" x2="320" y2="340" stroke="#E2E8F0" stroke-width="1.5"/>

    <text x="20" y="365" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#0F172A">UI Architecture Highlights:</text>
    <text x="20" y="385" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• Clean Action Center: 1 urgent banner + 4 KPIs</text>
    <text x="20" y="405" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• 4-Stage Stepper Modal for banking transfers</text>
    <text x="20" y="425" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• Responsive breakpoints: Desktop, Tablet, Mobile</text>
    <text x="20" y="445" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• Interactive letter-by-letter Intro screen</text>
    <text x="20" y="465" font-family="'Segoe UI', sans-serif" font-size="11" fill="#475569">• Glassmorphism overlays &amp; subtle micro-animations</text>
  </g>

  <!-- RIGHT: 2 PREVIEW MOCKUPS -->
  <!-- MOCKUP 1: DASHBOARD ACTION CENTER -->
  <g transform="translate(420, 105)">
    <rect width="730" height="255" rx="8" fill="#1F1916" stroke="#54423A" stroke-width="1.8"/>
    <rect width="730" height="28" rx="8" fill="#29211E"/>
    <text x="20" y="19" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#F3B6A2">Screen Preview 1: Executive Dashboard (Warm Charcoal Dark Theme)</text>

    <!-- Overdue Banner Mock -->
    <rect x="20" y="40" width="690" height="45" rx="6" fill="#3D201E" stroke="#D6736A" stroke-width="1.2"/>
    <text x="40" y="67" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="bold" fill="#F9EFEA">ACTION REQUIRED: Invoice #INV-2026-001 is 14 Days OVERDUE (₹1,77,000)</text>
    <rect x="615" y="48" width="80" height="28" rx="4" fill="#D6736A"/>
    <text x="655" y="66" font-family="'Segoe UI', sans-serif" font-size="10.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Settle Now →</text>

    <!-- 4 KPI Cards Mock -->
    <rect x="20" y="95" width="160" height="65" rx="6" fill="#29211E" stroke="#54423A"/>
    <text x="32" y="115" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#A89489">TOTAL INVOICES</text>
    <text x="32" y="142" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold" fill="#F9EFEA">28</text>

    <rect x="195" y="95" width="160" height="65" rx="6" fill="#29211E" stroke="#54423A"/>
    <text x="207" y="115" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#A89489">PENDING VERIFY</text>
    <text x="207" y="142" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold" fill="#E2A848">5</text>

    <rect x="370" y="95" width="160" height="65" rx="6" fill="#29211E" stroke="#54423A"/>
    <text x="382" y="115" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#A89489">PENDING APPROVAL</text>
    <text x="382" y="142" font-family="'Segoe UI', sans-serif" font-size="18" font-weight="bold" fill="#F3B6A2">4</text>

    <rect x="545" y="95" width="165" height="65" rx="6" fill="#29211E" stroke="#54423A"/>
    <text x="557" y="115" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#A89489">OVERDUE AMOUNT</text>
    <text x="557" y="142" font-family="'Segoe UI', sans-serif" font-size="16" font-weight="bold" fill="#D6736A">₹3,45,200</text>

    <!-- Table preview mock -->
    <rect x="20" y="170" width="690" height="70" rx="6" fill="#29211E" stroke="#54423A"/>
    <text x="32" y="195" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#F9EFEA">Recent Invoices &amp; Real-Time Dynamic Priority Pipeline</text>
    <text x="32" y="215" font-family="'Segoe UI', sans-serif" font-size="10" fill="#A89489">INV-2026-001 • ABC Technologies • ₹1,77,000 • Status: OVERDUE • Priority: HIGH</text>
    <text x="32" y="230" font-family="'Segoe UI', sans-serif" font-size="10" fill="#A89489">INV-2026-004 • CloudScale Infra • ₹88,500 • Status: APPROVED • Priority: DUE SOON</text>
  </g>

  <!-- MOCKUP 2: VERIFICATION & DUPLICATE DIAGNOSTICS -->
  <g transform="translate(420, 385)">
    <rect width="730" height="260" rx="8" fill="#FFF8F1" stroke="#E8DED5" stroke-width="1.8"/>
    <rect width="730" height="28" rx="8" fill="#FFFCF8"/>
    <text x="20" y="19" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#26332B">Screen Preview 2: 7-Point Audit &amp; Levenshtein Duplicate Diagnostics Modal</text>

    <rect x="20" y="42" width="335" height="200" rx="6" fill="#FFFFFF" stroke="#E8DED5"/>
    <text x="32" y="65" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="bold" fill="#00A896">7-Point Rule Engine Diagnostics</text>
    <text x="32" y="90" font-family="'Segoe UI', sans-serif" font-size="10" fill="#059669">✓ 1. Vendor Active &amp; Registered (20 pts)</text>
    <text x="32" y="112" font-family="'Segoe UI', sans-serif" font-size="10" fill="#059669">✓ 2. Invoice Number Format Valid (15 pts)</text>
    <text x="32" y="134" font-family="'Segoe UI', sans-serif" font-size="10" fill="#059669">✓ 3. Due Date Follows Invoice Date (20 pts)</text>
    <text x="32" y="156" font-family="'Segoe UI', sans-serif" font-size="10" fill="#059669">✓ 4. Positive Amount Verified (15 pts)</text>
    <text x="32" y="178" font-family="'Segoe UI', sans-serif" font-size="10" fill="#059669">✓ 5. Line Items Math Consistent (15 pts)</text>
    <text x="32" y="200" font-family="'Segoe UI', sans-serif" font-size="10" fill="#059669">✓ 6. 18% GST Calculation Correct (15 pts)</text>
    <text x="32" y="222" font-family="'Segoe UI', sans-serif" font-size="10" fill="#DC2626">⚠ 7. Duplicate Check: Match Flagged (Score: 65)</text>

    <rect x="375" y="42" width="335" height="200" rx="6" fill="#FFFFFF" stroke="#E8DED5"/>
    <text x="387" y="65" font-family="'Segoe UI', sans-serif" font-size="11.5" font-weight="bold" fill="#DC2626">Multi-Signal Duplicate Analysis</text>
    <text x="387" y="90" font-family="'Segoe UI', sans-serif" font-size="10.5" font-weight="bold" fill="#DC2626">Confidence: 85% — CONFIRMED DUPLICATE</text>
    <text x="387" y="110" font-family="'Segoe UI', sans-serif" font-size="10" fill="#64748B">Matched Original: #INV-2026-001 (ABC Technologies)</text>
    <text x="387" y="135" font-family="'Segoe UI', sans-serif" font-size="10" fill="#334155">• Levenshtein Edit Distance: 35/40 pts</text>
    <text x="387" y="155" font-family="'Segoe UI', sans-serif" font-size="10" fill="#334155">• Normalized Vendor Match: 20/20 pts (Exact)</text>
    <text x="387" y="175" font-family="'Segoe UI', sans-serif" font-size="10" fill="#334155">• Amount Similarity: 15/15 pts (₹1,77,000)</text>
    <text x="387" y="195" font-family="'Segoe UI', sans-serif" font-size="10" fill="#334155">• Date Proximity: 10/10 pts (Within 24 hours)</text>
    <text x="387" y="220" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="bold" fill="#0284C7">Status: Routing to Manager Approval Queue</text>
  </g>
</svg>
`;

// SCREENSHOT 1: LOGIN
const loginSvg = `
<svg width="600" height="380" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="380" fill="#1F1916" rx="8"/>
  <rect x="120" y="30" width="360" height="320" rx="10" fill="#29211E" stroke="#54423A" stroke-width="1.5"/>
  <text x="300" y="70" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="bold" fill="#F3B6A2" text-anchor="middle">INVOXA</text>
  <text x="300" y="90" font-family="'Segoe UI', sans-serif" font-size="11" fill="#A89489" text-anchor="middle">Intelligent Invoice Operations Platform</text>
  
  <text x="150" y="125" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#F9EFEA">Email Address</text>
  <rect x="150" y="135" width="300" height="32" rx="4" fill="#352924" stroke="#54423A"/>
  <text x="160" y="156" font-family="'Segoe UI', sans-serif" font-size="11" fill="#D6C2B6">admin@example.com</text>

  <text x="150" y="190" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#F9EFEA">Password</text>
  <rect x="150" y="200" width="300" height="32" rx="4" fill="#352924" stroke="#54423A"/>
  <text x="160" y="221" font-family="'Segoe UI', sans-serif" font-size="11" fill="#D6C2B6">••••••••••••</text>

  <rect x="150" y="250" width="300" height="36" rx="6" fill="#E9A992"/>
  <text x="300" y="273" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#1F1916" text-anchor="middle">Sign In to Dashboard →</text>
  
  <text x="300" y="315" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#A89489" text-anchor="middle">Demo Credentials: Admin • Accounts Team • Vendor</text>
</svg>
`;

// SCREENSHOT 2: DASHBOARD
const dashboardSvg = `
<svg width="600" height="380" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="380" fill="#1F1916" rx="8"/>
  <rect x="15" y="15" width="570" height="40" rx="6" fill="#3D201E" stroke="#D6736A" stroke-width="1.5"/>
  <text x="30" y="39" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#F9EFEA">URGENT: Invoice #INV-2026-001 (ABC Tech) is OVERDUE (₹1,77,000)</text>
  <rect x="495" y="22" width="75" height="25" rx="4" fill="#D6736A"/>
  <text x="532" y="38" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Settle Now</text>

  <!-- 4 KPIs -->
  <rect x="15" y="65" width="130" height="65" rx="6" fill="#29211E" stroke="#54423A"/>
  <text x="25" y="85" font-family="'Segoe UI', sans-serif" font-size="9" fill="#A89489">TOTAL INVOICES</text>
  <text x="25" y="112" font-family="'Segoe UI', sans-serif" font-size="17" font-weight="bold" fill="#F9EFEA">28</text>

  <rect x="160" y="65" width="130" height="65" rx="6" fill="#29211E" stroke="#54423A"/>
  <text x="170" y="85" font-family="'Segoe UI', sans-serif" font-size="9" fill="#A89489">PENDING VERIFY</text>
  <text x="170" y="112" font-family="'Segoe UI', sans-serif" font-size="17" font-weight="bold" fill="#E2A848">5</text>

  <rect x="305" y="65" width="130" height="65" rx="6" fill="#29211E" stroke="#54423A"/>
  <text x="315" y="85" font-family="'Segoe UI', sans-serif" font-size="9" fill="#A89489">PENDING APPROVAL</text>
  <text x="315" y="112" font-family="'Segoe UI', sans-serif" font-size="17" font-weight="bold" fill="#F3B6A2">4</text>

  <rect x="450" y="65" width="135" height="65" rx="6" fill="#29211E" stroke="#54423A"/>
  <text x="460" y="85" font-family="'Segoe UI', sans-serif" font-size="9" fill="#A89489">OVERDUE DEBT</text>
  <text x="460" y="112" font-family="'Segoe UI', sans-serif" font-size="15" font-weight="bold" fill="#D6736A">₹3,45,200</text>

  <!-- Content box -->
  <rect x="15" y="145" width="570" height="215" rx="6" fill="#29211E" stroke="#54423A"/>
  <text x="30" y="172" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#F9EFEA">⚡ Needs Attention Queue (Real-Time Priority Engine)</text>
  
  <rect x="30" y="185" width="540" height="38" rx="4" fill="#352924"/>
  <text x="42" y="208" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#F9EFEA">#INV-2026-001 • ABC Technologies • ₹1,77,000</text>
  <rect x="480" y="193" width="75" height="22" rx="4" fill="#D6736A"/>
  <text x="517" y="208" font-family="'Segoe UI', sans-serif" font-size="9" fill="#FFFFFF" text-anchor="middle">OVERDUE</text>

  <rect x="30" y="230" width="540" height="38" rx="4" fill="#352924"/>
  <text x="42" y="253" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#F9EFEA">#INV-2026-004 • CloudScale Infra • ₹88,500</text>
  <rect x="480" y="238" width="75" height="22" rx="4" fill="#E2A848"/>
  <text x="517" y="253" font-family="'Segoe UI', sans-serif" font-size="9" fill="#FFFFFF" text-anchor="middle">DUE SOON</text>

  <rect x="30" y="275" width="540" height="38" rx="4" fill="#352924"/>
  <text x="42" y="298" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#F9EFEA">#INV-2026-007 • SecureNet Systems • ₹1,20,000</text>
  <rect x="475" y="283" width="85" height="22" rx="4" fill="#E9A992"/>
  <text x="517" y="298" font-family="'Segoe UI', sans-serif" font-size="9" fill="#FFFFFF" text-anchor="middle">DUPLICATE?</text>

  <text x="30" y="342" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#A89489">Recent Activity: Payment UTR-HDFC884 settled • Logged by Yuva (ADMIN)</text>
</svg>
`;

// SCREENSHOT 3: VERIFICATION MODAL
const verifModalSvg = `
<svg width="600" height="380" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="380" fill="#FFF8F1" rx="8"/>
  <rect x="20" y="15" width="560" height="350" rx="8" fill="#FFFFFF" stroke="#E8DED5" stroke-width="1.8"/>
  <text x="40" y="42" font-family="'Segoe UI', sans-serif" font-size="13" font-weight="bold" fill="#26332B">Automated Invoice Verification &amp; Duplicate Audit Report</text>
  <text x="420" y="42" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#C96B62">Score: 65/100 (NEEDS REVIEW)</text>

  <rect x="35" y="60" width="250" height="280" rx="6" fill="#FFF8F1" stroke="#E8DED5"/>
  <text x="45" y="82" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#26332B">7-Point Rule Engine</text>
  <text x="45" y="108" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#059669">✓ 1. Vendor Active &amp; Valid (20 pts)</text>
  <text x="45" y="132" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#059669">✓ 2. Format: INV-2026-002 (15 pts)</text>
  <text x="45" y="156" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#059669">✓ 3. Dates Consistent (20 pts)</text>
  <text x="45" y="180" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#059669">✓ 4. Amount Positive: ₹1,77,000</text>
  <text x="45" y="204" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#059669">✓ 5. Line Math: Qty x UnitPrice</text>
  <text x="45" y="228" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#059669">✓ 6. 18% GST Verified (₹27,000)</text>
  <text x="45" y="252" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#DC2626">⚠ 7. Duplicate Check: Match Flagged</text>
  <text x="45" y="285" font-family="'Segoe UI', sans-serif" font-size="9" fill="#64748B">Recommendation: Requires manual</text>
  <text x="45" y="300" font-family="'Segoe UI', sans-serif" font-size="9" fill="#64748B">manager clearance before payment.</text>

  <rect x="300" y="60" width="265" height="280" rx="6" fill="#FFFDFB" stroke="#E8DED5"/>
  <text x="312" y="82" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#DC2626">Multi-Signal Duplicate Analysis</text>
  <rect x="312" y="95" width="240" height="42" rx="4" fill="#FBF0EC" stroke="#C96B62"/>
  <text x="320" y="112" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#C96B62">Confidence: 85% — CONFIRMED DUPLICATE</text>
  <text x="320" y="128" font-family="'Segoe UI', sans-serif" font-size="8.5" fill="#64748B">Duplicate Of: #INV-2026-001 (ABC Technologies)</text>

  <text x="312" y="160" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#334155">Levenshtein Edit Distance: 35/40 pts</text>
  <rect x="312" y="168" width="240" height="6" rx="3" fill="#E8DED5"/>
  <rect x="312" y="168" width="210" height="6" rx="3" fill="#C96B62"/>

  <text x="312" y="195" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#334155">Vendor Match: 20/20 pts (Exact)</text>
  <rect x="312" y="203" width="240" height="6" rx="3" fill="#E8DED5"/>
  <rect x="312" y="203" width="240" height="6" rx="3" fill="#059669"/>

  <text x="312" y="230" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#334155">Amount Parity: 15/15 pts (₹1,77,000)</text>
  <rect x="312" y="238" width="240" height="6" rx="3" fill="#E8DED5"/>
  <rect x="312" y="238" width="240" height="6" rx="3" fill="#059669"/>

  <rect x="312" y="265" width="115" height="30" rx="4" fill="#26332B"/>
  <text x="369" y="284" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">Flag Duplicate</text>

  <rect x="435" y="265" width="115" height="30" rx="4" fill="#FFFFFF" stroke="#E8DED5"/>
  <text x="492" y="284" font-family="'Segoe UI', sans-serif" font-size="9.5" fill="#64748B" text-anchor="middle">Override / Pay</text>
</svg>
`;

// SCREENSHOT 4: PAYMENT STEPPER MODAL
const paymentModalSvg = `
<svg width="600" height="380" viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="380" fill="#FCFAF8" rx="8"/>
  <rect x="40" y="20" width="520" height="340" rx="10" fill="#FFFFFF" stroke="#E8DED5" stroke-width="2"/>
  
  <text x="300" y="52" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="bold" fill="#0F172A" text-anchor="middle">4-Stage Enterprise Payment Settlement</text>

  <!-- Stepper -->
  <line x1="110" y1="85" x2="490" y2="85" stroke="#059669" stroke-width="3"/>
  <circle cx="110" cy="85" r="14" fill="#059669"/>
  <text x="110" y="89" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
  <text x="110" y="112" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#0F172A" text-anchor="middle">Initiated</text>

  <circle cx="236" cy="85" r="14" fill="#059669"/>
  <text x="236" y="89" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
  <text x="236" y="112" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#0F172A" text-anchor="middle">Verifying</text>

  <circle cx="363" cy="85" r="14" fill="#059669"/>
  <text x="363" y="89" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
  <text x="363" y="112" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#0F172A" text-anchor="middle">Processing</text>

  <circle cx="490" cy="85" r="14" fill="#059669"/>
  <text x="490" y="89" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
  <text x="490" y="112" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="bold" fill="#0F172A" text-anchor="middle">Completed</text>

  <!-- Success Card -->
  <rect x="75" y="130" width="450" height="175" rx="8" fill="#F0FDF4" stroke="#BBF7D0"/>
  <circle cx="300" cy="165" r="22" fill="#DCFCE7"/>
  <text x="300" y="173" font-family="'Segoe UI', sans-serif" font-size="18" fill="#16A34A" text-anchor="middle">✓</text>
  
  <text x="300" y="205" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#15803D" text-anchor="middle">Payment Completed &amp; Settled Successfully</text>
  
  <text x="100" y="235" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#374151">Amount Settled:</text>
  <text x="500" y="235" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="bold" fill="#111827" text-anchor="end">₹1,18,000.00 (INR)</text>

  <text x="100" y="258" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#374151">Bank Reference (UTR):</text>
  <text x="500" y="258" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#059669" text-anchor="end">UTR-HDFC2026884920</text>

  <text x="100" y="281" font-family="'Segoe UI', sans-serif" font-size="10.5" fill="#374151">Beneficiary Vendor:</text>
  <text x="500" y="281" font-family="'Segoe UI', sans-serif" font-size="10.5" font-weight="bold" fill="#111827" text-anchor="end">CloudScale Infrastructure Ltd</text>

  <rect x="180" y="318" width="240" height="30" rx="4" fill="#0F172A"/>
  <text x="300" y="337" font-family="'Segoe UI', sans-serif" font-size="10.5" font-weight="bold" fill="#FFFFFF" text-anchor="middle">View Digital Transaction Receipt</text>
</svg>
`;

async function generateAllPptAssets() {
  console.log('[PPT Assets] Generating High-Resolution PNGs for presentation slides...');

  await sharp(Buffer.from(archSvg)).png({ density: 300 }).toFile(path.join(ASSETS_DIR, 'architecture_slide.png'));
  console.log(' -> Created architecture_slide.png');

  await sharp(Buffer.from(usecaseSvg)).png({ density: 300 }).toFile(path.join(ASSETS_DIR, 'usecase_slide.png'));
  console.log(' -> Created usecase_slide.png');

  await sharp(Buffer.from(erSvg)).png({ density: 300 }).toFile(path.join(ASSETS_DIR, 'er_diagram_slide.png'));
  console.log(' -> Created er_diagram_slide.png');

  await sharp(Buffer.from(uiDesignSvg)).png({ density: 300 }).toFile(path.join(ASSETS_DIR, 'ui_design_slide.png'));
  console.log(' -> Created ui_design_slide.png');

  await sharp(Buffer.from(loginSvg)).png({ density: 300 }).toFile(path.join(ASSETS_DIR, 'login_screen.png'));
  console.log(' -> Created login_screen.png');

  await sharp(Buffer.from(dashboardSvg)).png({ density: 300 }).toFile(path.join(ASSETS_DIR, 'dashboard_screen.png'));
  console.log(' -> Created dashboard_screen.png');

  await sharp(Buffer.from(verifModalSvg)).png({ density: 300 }).toFile(path.join(ASSETS_DIR, 'verification_screen.png'));
  console.log(' -> Created verification_screen.png');

  await sharp(Buffer.from(paymentModalSvg)).png({ density: 300 }).toFile(path.join(ASSETS_DIR, 'payment_screen.png'));
  console.log(' -> Created payment_screen.png');

  console.log('[PPT Assets] All 8 presentation graphic assets successfully generated!');
}

generateAllPptAssets().catch(err => {
  console.error('[PPT Assets] Error:', err);
  process.exit(1);
});
