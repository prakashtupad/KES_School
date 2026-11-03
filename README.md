# Khanatti Education Society’s Shri Siddharoodha English Medium School, Khanatti

Production-ready full-stack web portal for **Khanatti Education Society’s Shri Siddharoodha English Medium School, Khanatti** (Gokak Taluk, Belagavi District, Karnataka).

---

## Repository Structure

```text
KES_School/
├── client/                                # React 18 + Vite + Tailwind CSS Frontend
│   ├── public/
│   │   └── images/                        # Authentic school logo & campus photographs
│   ├── src/
│   │   ├── assets/                        # School emblem seal
│   │   ├── components/                    # Modular Stitch UI components
│   │   │   ├── AnnouncementBar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── HeroCarousel.jsx
│   │   │   ├── AboutSection.jsx
│   │   │   ├── AcademicsSection.jsx
│   │   │   ├── CampusLifeSection.jsx
│   │   │   ├── AdmissionsCallout.jsx
│   │   │   ├── NewsSection.jsx
│   │   │   ├── EnquiryForm.jsx
│   │   │   ├── ContactSection.jsx
│   │   │   └── Footer.jsx
│   │   ├── constants/
│   │   │   └── schoolData.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                                # Node.js + Express + Mongoose Backend
    ├── src/
    │   ├── config/
    │   │   ├── db.js
    │   │   └── mailer.js
    │   ├── controllers/
    │   │   ├── enquiryController.js
    │   │   └── noticeController.js
    │   ├── middleware/
    │   │   └── rateLimiter.js
    │   ├── models/
    │   │   ├── Enquiry.js
    │   │   └── Notice.js
    │   ├── routes/
    │   │   ├── enquiryRoutes.js
    │   │   └── noticeRoutes.js
    │   ├── services/
    │   │   └── mailService.js
    │   └── server.js
    ├── .env.example
    └── package.json
```

---

## Local Setup & Execution

### 1. Backend Server (`server/`)
```bash
cd server
npm install
npm run dev
```
Runs the Express API on `http://localhost:5000` with endpoints:
- `GET /api/v1/health`
- `GET /api/v1/notices`
- `POST /api/v1/enquiries` (Rate-limited: 10 submissions / 15 minutes per IP)

### 2. Frontend Client (`client/`)
```bash
cd client
npm install
npm run dev
```
Runs the Vite development server on `http://localhost:5173` with `/api` proxied to `http://localhost:5000`.
