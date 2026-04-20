# SmartSeason: Field Monitoring System 🌾

### **Software Engineer Intern — Technical Assessment Submission**
**Candidate:** Gacanga Alex Mwangi  
**Role:** Software Engineer Intern  
**Office:** Mitsumi Business Park, Westlands, Nairobi.  

---

## 🔗 Project Links
* **Live Deployment:** https://smart-season-field-monitoring-syste-eight.vercel.app/
* **Backend API (Render):** https://smartseason-field-monitoring-system-1.onrender.com
* **GitHub Repository:** https://github.com/Alexgacanga/SmartSeason-Field-Monitoring-System.git

---

## 🚀 Overview
SmartSeason is a full-stack field monitoring system built for **Shamba Records**. It enables agricultural administrators to register fields and assign them to field agents, who then provide real-time updates on crop health and growth stages. 

This solution prioritizes **clean separation of concerns**, **secure role-based access**, and **scalable data modeling**.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** + **Tailwind CSS** | Chosen for rapid UI development and high-performance rendering. |
| **Backend** | **Django REST Framework (DRF)** | Provides a robust, secure, and "batteries-included" framework for building scalable APIs. |
| **Database** | **PostgreSQL (Neon.tech)** | A reliable relational database to handle complex relationships between users, fields, and updates. |
| **Auth** | **SimpleJWT** | Implements stateless authentication, allowing for secure cross-origin communication between Vercel and Render. |

---

## 🧠 Design Decisions & Assumptions

### 1. Data Modeling (Relational Integrity)
I designed a relational schema where a `UserProfile` extends the base Django `User`. 
* **Decisions:** Used a `TextChoices` field for Roles (`ADMIN` vs `AGENT`). This ensures data integrity at the database level.
* **Assumption:** I assumed a 1-to-Many relationship between Agents and Fields (one agent can manage multiple fields, but a field is assigned to one primary agent at a time).

### 2. Role-Based Access Control (RBAC)
* **Decisions:** Implemented a "Traffic Cop" logic on the frontend via a `DashboardRouter`. It decodes the JWT to determine the user's role and prevents unauthorized navigation.
* **Security:** Backend views use `IsAuthenticated` permissions, ensuring that even if the frontend is bypassed, the API remains protected.

### 3. Deployment Strategy (Simulating Production)
* **Decisions:** Decoupled the architecture. The frontend is served via **Vercel's Edge Network** for speed, while the backend runs on **Render** connected to a **Neon PostgreSQL** instance. 
* **Trade-offs:** I prioritized **simplicity and clarity** over over-engineering, using **Whitenoise** for static file handling and **CORS-headers** for cross-origin security.

---

## 🔑 Demo Credentials
To test the full-stack functionality without creating new accounts, use the following:

**Admin Account (Full Management Access):**
* **Username:** `live_admin`
* **Password:** `adminpassword123`
<img width="1919" height="992" alt="Screenshot 2026-04-20 121226" src="https://github.com/user-attachments/assets/26821eab-6816-41f5-9066-0e43eabdfb7f" />
<img width="1919" height="988" alt="Screenshot 2026-04-20 121209" src="https://github.com/user-attachments/assets/8a6f88b6-5aab-4859-83bc-85eb499e9c14" />

**Field Agent Account (Assigned Fields Access):**
* **Username:** `Julius`
* **Password:** `Password123`
<img width="1919" height="991" alt="Screenshot 2026-04-20 121256" src="https://github.com/user-attachments/assets/85902559-5ae5-44d2-85cd-5993cb034e13" />
<img width="1919" height="988" alt="Screenshot 2026-04-20 121123" src="https://github.com/user-attachments/assets/85650c10-5a77-4688-8288-df55cc1c9585" />
---

## 💻 Local Setup Instructions

### 1. Backend Setup
Navigate to the project root and ensure you have Python 3.10+ installed.

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\activate on Windows

# Install required Python packages
pip install -r requirements.txt

# Apply migrations and start server
python manage.py migrate
python manage.py runserver
