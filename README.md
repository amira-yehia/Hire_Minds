# HireMinds — Frontend Documentation

> AI-powered recruitment platform built with React + Vite  
> Graduation Project | Three portals: Candidate · HR Recruiter · Admin

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Getting Started](#4-getting-started)
5. [Routing & Navigation](#5-routing--navigation)
6. [Authentication System](#6-authentication-system)
7. [API Layer — `src/api.js`](#7-api-layer--srcapijs)
8. [Candidate Portal](#8-candidate-portal)
9. [HR Recruiter Portal](#9-hr-recruiter-portal)
10. [Admin Portal](#10-admin-portal)
11. [AI Interview System](#11-ai-interview-system)
12. [Face Recognition System](#12-face-recognition-system)
13. [Session Management](#13-session-management)
14. [localStorage Keys Reference](#14-localstorage-keys-reference)
15. [Known Issues & Workarounds](#15-known-issues--workarounds)
16. [Environment & Configuration](#16-environment--configuration)

---

## 1. Project Overview

HireMinds is an AI-powered recruitment platform with three distinct user portals:

| Portal | Role | Entry Route |
|--------|------|-------------|
| Candidate | Job seekers applying for positions | `/candidate` |
| HR Recruiter | Recruiters managing jobs and candidates | `/hr-dashboard` |
| Admin | Platform administrators | `/admin-dashboard` |

**Backend:** ASP.NET Core REST API at `http://recruitermentsystem.runasp.net`  
**AI Interviewer:** Hugging Face Spaces Python/FastAPI service at `https://doaa-helmy-interviewer2.hf.space`  
**Face Verification:** FastAPI microservice (originally at `localhost:8000`, now integrated into the main backend at `/Api/FaceRecognition`)

---

## 2. Tech Stack & Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM rendering |
| `react-router-dom` | ^6.23.1 | Client-side routing (HashRouter) |
| `react-icons` | ^5.5.0 | Icon sets (Fa, Md, Pi prefixes used) |
| `lucide-react` | ^0.383.0 | Additional icons |
| `framer-motion` | ^12.34.3 | Animations |
| `aos` | ^3.0.0-beta.6 | Scroll animations (Animate On Scroll) |
| `boxicons` | ^2.1.4 | Icon font (loaded via CDN in index.html) |
| `uuid` | ^14.0.1 | UUID generation for interview sessions |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^5.4.1 | Build tool & dev server |
| `@vitejs/plugin-react` | ^4.3.1 | React Fast Refresh |
| `@types/react` | ^18.3.1 | TypeScript types |
| `@types/react-dom` | ^18.3.1 | TypeScript types |

### External / CDN

- **Boxicons CSS** — loaded in `index.html` from `https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css`

---

## 3. Project Structure

```
HireMinds/
├── index.html                          # App shell, sets title & loads boxicons
├── vite.config.js                      # Vite config (React plugin only, no proxy)
├── package.json
├── public/
│   └── logo.png                        # App logo (also used as favicon)
└── src/
    ├── main.jsx                        # Entry point — HashRouter wraps <App>
    ├── api.js                          # Centralised API service layer (all fetch calls)
    ├── hooks/
    │   └── useInterviewSocket.js       # WebSocket hook for AI interview
    └── components/
        ├── index.css                   # Global styles & CSS variables (~105 KB)
        ├── App.jsx                     # Route definitions
        │
        ├── — Landing / Public —
        ├── Home.jsx                    # Landing page shell
        ├── Hero.jsx                    # Hero section
        ├── Features.jsx                # Features section
        ├── HowItWorks.jsx              # How It Works section
        ├── CompanyLogo.jsx             # Company logos / partners display
        ├── cardSlider.jsx              # Card slider component
        ├── Header.jsx                  # Public header/nav
        ├── Footer.jsx                  # Footer
        ├── Scoring.jsx                 # Score display component
        │
        ├── — Auth —
        ├── AuthPage.jsx                # Container for Login/Register toggle
        ├── Login.jsx                   # Login form (email/password + Google)
        ├── Register.jsx                # Registration form (Candidate or Recruiter)
        ├── VerifyEmail.jsx             # Email verification via link
        ├── ForgetPassword.jsx          # Send reset email
        ├── ResetPassword.jsx           # Reset password via token link
        ├── ChangePassword.jsx          # Change password (authenticated)
        ├── ProtectedRoute.jsx          # Auth guard HOC
        │
        ├── — Candidate Portal —
        ├── CandidateDashboard.jsx      # Candidate home with progress tracker
        ├── CandidateProfile.jsx        # Profile + CV upload + Face enrollment (3-step)
        ├── CandidateAssessment.jsx     # Skills assessment
        ├── CandidateInterview.jsx      # Interview flow controller
        ├── CandidateSidebar.jsx        # Sidebar nav for candidate portal
        ├── InterviewRoom.jsx           # Live AI interview UI (timer, mic, chat)
        ├── FaceVerify.jsx              # Face verification before interview
        │
        ├── — HR Recruiter Portal —
        └── hr-dashboard/
        │   ├── HRDashboard.jsx         # Recruiter home
        │   ├── HRProfile.jsx           # Recruiter profile with edit
        │   ├── HRJobs.jsx              # Job listings with filter + edit modal
        │   ├── CreateJob.jsx           # Create new job posting
        │   ├── HRCandidates.jsx        # View candidates per job
        │   ├── CandidateReportPage.jsx # Detailed candidate interview report
        │   ├── CandidatesPage.jsx      # Candidates list page
        │   ├── DashboardPage.jsx       # Dashboard statistics
        │   ├── HRSidebar.jsx           # Sidebar nav for HR portal
        │   ├── HrDashboardApp.jsx      # HR dashboard app shell
        │   ├── HRProfile.css           # HR profile styles
        │   ├── CreateJob.css           # Create job form styles
        │   ├── DashboardPage.css       # Dashboard styles
        │   ├── CandidatesPage.css      # Candidates page styles
        │   ├── CandidateReportPage.css # Report page styles
        │   ├── candidatesData.js       # Mock candidate data (fallback)
        │   └── Jobsapi patch.jsx       # Temporary API patch file
        │
        └── admin-dashboard/
            ├── AdminDashboardApp.jsx   # Admin portal (companies + jobs management)
            └── AdminDashboardApp.css   # Admin styles
```

---

## 4. Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd HireMinds

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Available Scripts

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

> **Note:** No `.env` file or Vite proxy is configured. The backend URL is hardcoded in `src/api.js`. CORS must be enabled on the backend for local development.

---

## 5. Routing & Navigation

The app uses **`HashRouter`** (not `BrowserRouter`). All URLs use `#/` prefix — e.g. `http://localhost:5173/#/candidate`.

> **Why HashRouter?** Avoids server-side 404s when deployed to static hosts that don't support SPA fallback routing.

### Route Map

| Path | Component | Auth Required | Allowed Roles |
|------|-----------|---------------|---------------|
| `/` | `Home` | No | All |
| `/auth` | `AuthPage` | No | All |
| `/login` | `AuthPage` (login mode) | No | All |
| `/register` | `AuthPage` (register mode) | No | All |
| `/forget-password` | `ForgetPassword` | No | All |
| `/reset-password?userId=&resetToken=` | `ResetPassword` | No | All |
| `/verify-email?userId=&token=` | `VerifyEmail` | No | All |
| `/change-password` | `ChangePassword` | No | All |
| `/candidate` | `CandidateDashboard` | ✅ Yes | `candidate` |
| `/candidate/profile` | `CandidateProfile` | ✅ Yes | `candidate` |
| `/candidate/assessment` | `CandidateAssessment` | ✅ Yes | `candidate` |
| `/candidate/interview` | `CandidateInterview` | ✅ Yes | `candidate` |
| `/hr-dashboard` | `HRDashboard` | ✅ Yes | `recruiter` |
| `/hr-profile` | `HRProfile` | ✅ Yes | `recruiter` |
| `/hr-jobs` | `HRJobs` | ✅ Yes | `recruiter` |
| `/hr-candidates` | `HRCandidates` | ✅ Yes | `recruiter` |
| `/hr-create-job` | `CreateJob` | ✅ Yes | `recruiter` |
| `/candidate-report` | `CandidateReportPage` | ✅ Yes | `recruiter` |
| `/admin-dashboard` | `AdminDashboardApp` | ✅ Yes | `admin` |
| `/face-verify` | `FaceVerify` | ✅ Yes | `candidate` |

### `ProtectedRoute` Component

```jsx
// src/components/ProtectedRoute.jsx
<ProtectedRoute allowedRoles={["candidate"]}>
  <CandidateDashboard />
</ProtectedRoute>
```

Checks `accessToken` and `role` from `localStorage`. Redirects to `/login` if unauthenticated or unauthorised. Role comparison is **case-insensitive**.

---

## 6. Authentication System

### Login Flow

1. User submits email + password to `POST /api/Auth/login?email=&password=`
2. Backend returns `{ accessToken, refreshToken, role?, userId? }`
3. `saveSession()` stores all values in localStorage (after parsing JWT if `role`/`userId` not in response body)
4. Role extracted from JWT claim: `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`
5. Navigation by role:
   - `admin` → `/admin-dashboard`
   - `recruiter` → `/hr-dashboard`
   - `candidate` (default) → `/candidate`

### Registration Flow

**Candidate:**
- `POST /api/Auth/candidate-register` with `{ fullName, email, password, address, city, country, phoneNumber }`
- Backend sends verification email
- User redirected to check email

**HR Recruiter:**
- `POST /api/Auth/recruiter-register` with same fields + `companyId`
- Companies fetched from `GET /Api/Comapny` and shown in a dropdown
- User redirected to `/hr-dashboard`

### Password Recovery

| Step | Route | API Call |
|------|-------|----------|
| Request reset | `/forget-password` | `POST /api/Auth/forget-password?email=` |
| Reset via link | `/reset-password?userId=&resetToken=` | `POST /api/Auth/reset-password?userId=&resetToken=&newPassword=` |
| Verify email | `/verify-email?userId=&token=` | `GET /api/Auth/verify-email?userId=&token=` |
| Change password | `/change-password` | `POST /api/Auth/change-password?email=&currPassword=&newPass=` |

---

## 7. API Layer — `src/api.js`

Single centralised file. All components import named exports from here. No Axios — uses native `fetch`.

### Base Configuration

```js
const BASE_URL = "http://recruitermentsystem.runasp.net";
```

### Core `request()` Helper

```js
request(method, path, body = null, isFormData = false)
```

- Attaches `Authorization: Bearer <token>` automatically
- Handles JSON body and FormData (for file uploads)
- Returns parsed JSON, raw text, or `null` (for empty responses)
- Throws `Error` with server message on non-2xx responses

### `toArray()` Utility

Normalises all ASP.NET response shapes into a plain array:

```js
toArray(res)  // handles: plain array, res.$values, res.items, res.data, res.result
```

### API Service Groups

| Export | Backend Prefix | Description |
|--------|---------------|-------------|
| `authAPI` | `/api/Auth` | Login, register, email verify, password reset, Google login |
| `candidateAPI` | `/api/Candidate` | Profile CRUD, CV upload, photo upload |
| `applicationsAPI` | `/api/Applications` | Apply to job, get by candidate, get by job |
| `jobsAPI` | `/api/jobs` | Create, filter (PUT with body), get by ID, update, delete, approve |
| `recruitersAPI` | `/api/recruiters` | Profile CRUD, photo upload |
| `companyAPI` | `/Api/Comapny` | CRUD (note: typo in backend URL is intentional — matches server) |
| `categoryAPI` | `/api/Category` | CRUD |
| `skillAPI` | `/controller/Skill` | CRUD |
| `faceAPI` | `/Api/FaceRecognition` | Enroll start/frame/retake, verify |
| `interviewAPI` | `/api/Interview` | Get by ID, get by application ID |
| `aiInterviewAPI` | `https://doaa-helmy-interviewer2.hf.space` | Prepare session, WebSocket URL builder, status check, health |
| `webhooksAPI` | `/api/Webhooks` | Receive interview result from AI service |

### Important: `jobsAPI.getAll()` Uses PUT

The job search/filter endpoint is a `PUT` (not `GET`) with a JSON body — this is a backend design decision:

```js
jobsAPI.getAll({ pageNumber: 1, search: "React", employmentType: "FullTime" })
// → PUT /api/jobs  { pageNumber, sortBy, sortOrder, search, ... }
```

---

## 8. Candidate Portal

### `CandidateDashboard.jsx`

- Fetches candidate profile via `candidateAPI.getProfile(userId)`
- Shows personalized greeting with first name
- Displays **3-step progress tracker** with localStorage-backed completion state:
  - `cv-done-${userId}` → CV uploaded
  - `assessment-${userId}` → Assessment completed
  - `interview-${userId}` → Interview completed
- Links to profile, assessment, and interview pages

### `CandidateProfile.jsx` — 3-Step Profile Setup

The most complex candidate component. Manages a 3-step onboarding flow:

**Step 1: Profile Info**
- Fetches and displays candidate data via `candidateAPI.getProfile(userId)`
- Shows: full name, job title, email, phone, location, bio, skills, experience, education, certifications
- Skills normalised via `normalizeSkills()` (handles `{ name }` objects or plain strings)
- Initials avatar generated from name if no photo

**Step 2: CV Upload**
- File input accepts PDF/DOC files
- `POST /api/Candidate/upload-cv` with FormData (`Cv` field)
- Completion stored in `localStorage` as `cv-done-${userId} = "true"`
- Shows re-upload option after first upload

**Step 3: Face Enrollment**
- Calls `faceAPI.enrollStart()` → gets `sessionId`
- Guides user through **5 face poses**:
  1. Look straight at camera
  2. Turn slightly left
  3. Turn slightly right
  4. Raise chin
  5. Lower chin
- Each pose: captures frame from webcam canvas → `faceAPI.enrollFrame(sessionId, imageFile)`
- Camera stream managed via `useRef` + `navigator.mediaDevices.getUserMedia`
- State machine: `idle → enrolling → done | error`

### `CandidateAssessment.jsx`

Skills assessment page — connected to backend assessment APIs.

### `CandidateInterview.jsx` — Interview Flow Controller

3-phase state machine:

```
verify → ready → started → completed
```

| Phase | UI | What Happens |
|-------|----|-------------|
| `verify` | Face camera + verify button | `FaceVerify` component runs identity check |
| `ready` | "Start Interview" button | Confirmation screen after verified |
| `started` | Full interview room | `InterviewRoom` mounts with hardcoded demo WebSocket URL |
| `completed` | Thank-you screen | Sets `interviewCompleted = "true"` in localStorage |

> **Current Status:** Uses a hardcoded demo WebSocket URL (`DEMO_WS_URL`) while Redis session persistence bug on the AI service is unresolved.

### `CandidateSidebar.jsx`

Navigation sidebar for candidate portal. Links: Dashboard, Profile, Assessment, Interview.

---

## 9. HR Recruiter Portal

### `HRDashboard.jsx`

- Fetches recruiter profile via `recruitersAPI.getProfile(userId)`
- Reads avatar from `localStorage` (`recruiter-photo-${userId}`) immediately, then merges with API response
- Shows welcome greeting + quick navigation cards to Jobs and Candidates

### `HRProfile.jsx`

- Displays and allows editing of recruiter info: full name, phone, address, city, country
- Avatar upload stored as base64 in `localStorage` key `recruiter-photo-${userId}`
- Edit mode toggle with inline form
- `PUT /api/recruiters` to save changes

### `HRJobs.jsx`

- Fetches all jobs via `jobsAPI.getAll()` (PUT with body)
- **Filter row** with pill buttons: Employment Type + Experience Level
- Jobs displayed in card grid
- **Edit modal** with inline form to update job details
- Delete job with `jobsAPI.delete(id)`
- Badge helpers: colored status/type indicators
- Link to `CreateJob` page

### `CreateJob.jsx`

- Loads companies (`companyAPI.getAll()`) and categories (`categoryAPI.getAll()`) on mount
- Form fields: title, description, company (dropdown), categories (multi-select), experience level, employment type, threshold (0–100), status
- `POST /api/jobs` to create
- Handles all ASP.NET response shapes via local `toArray()` helper

### `HRCandidates.jsx`

- Loads all jobs → for each job, fetches applications via `applicationsAPI.getByJob(jobId)`
- Flattens all applications into a candidates list
- Search filter by name/email
- Links to `CandidateReportPage` with application details

### `CandidateReportPage.jsx`

- Detailed view of a candidate's interview performance
- Shows scores, AI evaluation, and recommendation

### `HRSidebar.jsx`

Navigation sidebar: Dashboard, Profile, Jobs, Candidates.

---

## 10. Admin Portal

### `AdminDashboardApp.jsx`

Single-page admin UI with two sections toggled by sidebar:

**Companies Section:**
- Lists all companies from `companyAPI.getAll()`
- Search by company name
- Filter by status
- Click company to see its details

**Jobs Section:**
- Lists all jobs from `jobsAPI.getAll()`
- Job approval via `jobsAPI.approve()` — Admin must approve jobs before they appear in recruiter/candidate listings
- Status filter, search

Stats summary cards at the top (total companies, total jobs, pending approvals, etc.)

---

## 11. AI Interview System

### Architecture

```
CandidateInterview.jsx
    └── InterviewRoom.jsx
            └── useInterviewSocket.js (custom hook)
                    └── WebSocket → wss://doaa-helmy-interviewer2.hf.space/ws/interview/{sessionId}
```

### `useInterviewSocket.js` — Custom Hook

**State managed:**
- `connected` — WebSocket open
- `messages` — chat history `[{ role, text, state, questionIndex, time }]`
- `phase` — `intro | questioning | complete`
- `isAiSpeaking` — TTS in progress
- `wsError` — connection error

**Key implementation details:**

- `didConnectRef` guard prevents React double-connect (StrictMode was removed from `main.jsx` but guard remains for safety)
- `ws.binaryType = "arraybuffer"` — binary frames handled separately from text JSON frames
- **Browser TTS** via `SpeechSynthesisUtterance` — workaround because `DEEPGRAM_API_KEY` is not available on the AI service
  - Selects best English female voice from `speechSynthesis.getVoices()` if available
  - Falls back to any English voice, then any available voice
- Voices preloaded on hook mount via `voiceschanged` event listener

**Exposed functions:**
- `sendTextAnswer(text)` — sends `{ type: "answer", text }` as JSON
- `sendAudioAnswer(audioBlob)` — sends binary audio frame
- `endSession()` — sends `{ type: "end" }` and closes WebSocket

### `InterviewRoom.jsx` — Live Interview UI

**Timer:**
- `useTimer(1800)` — counts down from 30 minutes
- Auto-ends session when `timeLeft === 0`

**Speech Recognition (Browser API):**
- `window.SpeechRecognition || window.webkitSpeechRecognition`
- `continuous: true`, `interimResults: true`
- Transcribes candidate speech live into `transcript` state
- Final result sent via `sendTextAnswer()`

**Audio Recording:**
- `MediaRecorder` API for audio capture
- Chunks accumulated in `chunksRef`
- On stop: creates `audio/webm` Blob → `sendAudioAnswer(blob)`

**UI states:**
- Connecting / AI Speaking / Recording / Ready indicators
- Chat log auto-scrolls via `chatEndRef`
- Mic button toggles recording

### AI Interviewer Service (`aiInterviewAPI`)

Before connecting WebSocket, a session must be prepared:

```js
const session = await aiInterviewAPI.prepare({
  session_id: uuid(),          // generate with `uuid` package
  candidate_name: "Amira",
  job_role: "Frontend Developer",
  level: "Junior",             // Junior | Mid | Senior
  duration_limit: 1800,        // seconds
  questions: [
    { question: "...", golden_answer: "...", skill: "React" }
  ]
});
// session.websocket_url → use with aiInterviewAPI.wsUrl(session_id)
```

> **Current Demo:** `DEMO_WS_URL` in `CandidateInterview.jsx` hardcodes a pre-prepared session UUID, bypassing the prepare step while the Redis persistence bug persists.

---

## 12. Face Recognition System

### Enrollment (`CandidateProfile.jsx` — Step 3)

```
faceAPI.enrollStart()              → { sessionId }
  ↓ (for each of 5 poses)
faceAPI.enrollFrame(sessionId, imageFile)   → { success, message }
```

Each frame is captured from a `<video>` element via `<canvas>` → `canvas.toBlob()` → FormData.

### Verification (`FaceVerify.jsx` / `CandidateInterview.jsx`)

```
faceAPI.verify(imageFile)          → { verified: true/false, confidence }
```

- Camera opened via `navigator.mediaDevices.getUserMedia`
- Single frame captured at verify time
- On success: calls `onVerified()` callback prop → advances interview to next phase

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/Api/FaceRecognition/EnrollStart` | Start enrollment session |
| `POST` | `/Api/FaceRecognition/EnrollFrame/{sessionId}` | Submit one face frame |
| `POST` | `/Api/FaceRecognition/enroll/retake?sessionId=&pose=` | Retake a specific pose |
| `POST` | `/Api/FaceRecognition/Verify` | Verify identity (single frame) |

All frame endpoints use `multipart/form-data` with field name `frame`.

---

## 13. Session Management

Managed via `src/api.js` session helpers. All data stored in `localStorage`.

### `saveSession({ accessToken, refreshToken, role, userId })`

Safe setter — skips values that are `undefined`, `null`, `"undefined"`, or `"null"` strings (prevents storing garbage).

Falls back to JWT parsing if `role` or `userId` are not in the login response body.

### `getSession()` → `{ accessToken, refreshToken, role, userId }`

Used in every component that needs auth context.

### `clearSession()`

Removes all 4 auth keys. Called on logout.

### JWT Parsing Helpers

```js
getRoleFromToken(accessToken)
// Extracts from: 
// payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
// or payload["role"]

getUserIdFromToken(accessToken)
// Extracts from:
// payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
// or payload["sub"]
```

---

## 14. localStorage Keys Reference

| Key | Type | Set By | Purpose |
|-----|------|--------|---------|
| `accessToken` | string | `saveSession()` | JWT bearer token |
| `refreshToken` | string | `saveSession()` | Refresh token |
| `role` | string | `saveSession()` | User role (candidate/recruiter/admin) |
| `userId` | string | `saveSession()` | User ID from JWT |
| `cv-done-${userId}` | `"true"` | `CandidateProfile` | CV upload completion flag |
| `assessment-${userId}` | `"true"` | `CandidateAssessment` | Assessment completion flag |
| `interview-${userId}` | `"true"` | `CandidateInterview` | Interview completion flag |
| `recruiter-photo-${userId}` | base64 string | `HRProfile` | Recruiter avatar (base64 image) |

---

## 15. Known Issues & Workarounds

### 1. Hardcoded Demo WebSocket URL
**Issue:** The AI interviewer (Hugging Face Spaces) has a Redis session persistence bug — prepared sessions expire before the candidate connects.  
**Workaround:** `DEMO_WS_URL` in `CandidateInterview.jsx` uses a pre-prepared session UUID that stays alive.  
**Fix needed:** Call `aiInterviewAPI.prepare()` dynamically and use the returned `websocket_url`.

### 2. React StrictMode Removed
**Issue:** React StrictMode causes double-mount in dev, triggering the WebSocket to connect twice.  
**Workaround:** StrictMode commented out in `main.jsx`. `didConnectRef` guard added to `useInterviewSocket.js` as a second layer of protection.  
**Note:** Not harmful in production (StrictMode only runs twice in dev), but keep `didConnectRef` regardless.

### 3. Backend Company Endpoint Typo
**Issue:** The backend URL is `/Api/Comapny` (not `/Api/Company`).  
**Status:** Intentional in `api.js` — matches the actual server route.

### 4. `jobsAPI.getAll()` is a PUT, Not GET
**Issue:** Jobs search/filter uses `PUT /api/jobs` with a JSON body, not a standard GET with query params.  
**Reason:** Backend Swagger definition — `JobQueryParametersDto` is sent in the body.  
**Impact:** Cannot use browser cache or simple `<a href>` links for job URLs.

### 5. Recruiter Avatar Not Persisted to Backend
**Issue:** `PUT /api/recruiters/upload-photo` exists but avatar is stored in `localStorage` as base64.  
**Reason:** Photo upload was implemented locally to avoid dependency on backend availability during development.  
**Fix needed:** Wire `recruitersAPI.uploadPhoto()` and stop using localStorage for photos.

### 6. CV Completion State in localStorage Only
**Issue:** `cv-done-${userId}` is only in localStorage. Clearing browser data loses the completion flag even if CV is on server.  
**Partial fix:** Could check `user?.cvUrl` from API response as fallback (commented-out code exists in `CandidateDashboard.jsx`).

### 7. `EnrollStart` 500 Errors
**Issue:** `faceAPI.enrollStart()` returns 500 intermittently.  
**Status:** Backend team issue. Frontend catches and shows error state gracefully.

---

## 16. Environment & Configuration

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

No proxy configured. CORS must be open on the backend server.

### `index.html`

- Sets app title to `HireMinds`
- Loads Boxicons from CDN
- Uses `/logo.png` as favicon

### Backend URL

Hardcoded in `src/api.js`:
```js
const BASE_URL = "http://recruitermentsystem.runasp.net";
```

To change it, update this single line. Consider moving to `import.meta.env.VITE_API_URL` for environment-specific deployments:

```js
// vite.config.js or .env
VITE_API_URL=http://recruitermentsystem.runasp.net

// api.js
const BASE_URL = import.meta.env.VITE_API_URL;
```

### AI Interviewer URL

Also hardcoded in `src/api.js` and `src/hooks/useInterviewSocket.js`:
```js
const AI_BASE = "https://doaa-helmy-interviewer2.hf.space";
```

---

*Generated for HireMinds graduation project — Frontend React documentation*
