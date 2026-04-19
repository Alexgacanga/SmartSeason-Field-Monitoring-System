# Shamba Records - Field Monitoring System 🌾

A full-stack web application designed to help agricultural administrators manage crop fields and allow field agents to log real-time progress updates.

## 🚀 Features

### Admin Dashboard (Superuser)
* **Overview Analytics:** View total fields, active fields, at-risk crops, and completed harvests.
* **Field Registration:** Create new field profiles (Name, Crop Type, Planting Date).
* **Agent Assignment:** Dynamically assign registered Field Agents to specific plots of land.

### Field Agent Dashboard
* **Targeted View:** Agents only see the specific fields assigned to them.
* **Progress Logging:** Update crop stages (Planted, Growing, Ready, Harvested).
* **Condition Flagging:** Add observation notes and flag crops as "At Risk" (Requires Attention).

### Security
* **Role-Based Access Control (RBAC):** Strict routing and API protection based on `ADMIN` or `AGENT` roles.
* **JWT Authentication:** Secure login using JSON Web Tokens (Access & Refresh tokens).

---

## 🛠️ Technology Stack

**Frontend:**
* React (Vite)
* Tailwind CSS (Styling)
* React Router DOM (Navigation)
* Axios (API Communication)

**Backend:**
* Python / Django
* Django REST Framework (API)
* SimpleJWT (Authentication)
* SQLite (Default Database for Development)

---

## 💻 Local Setup Instructions

Follow these steps to run the project on your local machine.

### Prerequisites
* Python 3.10+
* Node.js & npm

### 1. Backend Setup
Open a terminal and navigate to the root directory.

```bash
# Create and activate a virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install required Python packages
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
