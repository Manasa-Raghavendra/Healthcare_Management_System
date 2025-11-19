# 🏥 Healthcare Management System  
A full-stack hospital management application built with **FastAPI**, **React (Vite)**, **SQLite**, and **Backblaze B2 Cloud Storage**.  
It enables **Admins** and **Doctors** to manage patients, upload/view medical reports, and perform role-based secure operations.

---

## 🌟 Key Features

### 👨‍⚕️ Admin Features
- Add / view / delete doctors  
- Add / view patients  
- View all patient reports  
- Fully secure login & role-based access  
- Manage cloud storage buckets for reports  

### 🩺 Doctor Features
- Access their assigned patient list  
- Upload multiple reports per patient  
- View all reports uploaded previously  
- Secure authentication  
- Real-time UI updates  

---

## 🛠 Tech Stack

### **Frontend (React + Vite)**
- React 18  
- Vite  
- Axios  
- React Router  
- Tailwind CSS / Custom CSS  

### **Backend (FastAPI)**
- FastAPI  
- JWT Authentication  
- python-multipart  
- sqlite3 database  
- Backblaze B2 SDK integration  

### **Storage & Database**
- **SQLite** — lightweight, fast, serverless DB  
- **Backblaze B2 Cloud Storage** — stores patient medical reports securely  

---

# 📁 Project Structure

```
Healthcare_Management_System/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── patients.py
│   │   │   ├── reports.py
│   │   └── database.py
│   │
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── services/api.js
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

# ⚙️ Backend Installation (FastAPI)

### 1️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 2️⃣ Start FastAPI Server
```bash
uvicorn app.main:app --reload
```

Backend runs at:  
👉 http://127.0.0.1:8000

Swagger Docs:  
👉 http://127.0.0.1:8000/docs

---

# ⚛️ Frontend Installation (Vite + React)

### 1️⃣ Install Node Modules
```bash
npm install
```

### 2️⃣ Start React App
```bash
npm run dev
```

Frontend runs at:  
👉 http://localhost:5173/

---

# 🗂 Database — SQLite

### Tables:
- **users**  
  - id  
  - username  
  - password (hashed)  
  - role (admin/doctor)

- **patients**  
- **reports**  
  - file_name  
  - b2_url  
  - b2_file_id  

SQLite file auto-creates on backend start.

---

# ☁️ How Cloud Storage Works (Backblaze B2)

### Upload Flow:
1. React sends file → FastAPI  
2. FastAPI uploads file → B2 Bucket  
3. B2 returns:  
   - `file_id`  
   - `download_url`  
4. FastAPI stores metadata inside SQLite  
5. React retrieves report URLs → displays for user  

### Cloud Architecture (Text Diagram)

```
React → FastAPI → Backblaze B2
   ↑        ↓          ↓
User      SQLite   Secure File Storage
```

---

# 🔐 Authentication (JWT)

- User logs in → backend returns JWT token  
- Token includes:
  - user_id  
  - role (doctor/admin)  
- Protected routes require `Authorization: Bearer <token>`  
- Backend validates token before access  

---

# 📤 Uploading Multiple Reports (Doctor)

Our backend uses:

```python
files: list[UploadFile] = File(...)
```

Frontend uses:

```js
formData.append("files", file);
```

Meaning you can upload **many reports at once**.

---

# 🧾 API Endpoints (Summary)

### **Auth**
```
POST /auth/register
POST /auth/login
```

### **Patients**
```
POST /patients/
GET /patients/
DELETE /patients/{id}
```

### **Reports**
```
POST /reports/upload/{patient_id}
GET /reports/patient/{patient_id}
DELETE /reports/{id}
```

---

# 🖼 Screenshots

### 🏠 Dashboard  
![Dashboard](https://github.com/Manasa-Raghavendra/Healthcare_Management_System/blob/master/images/Screenshot%202025-11-19%20230010.png?raw=true)

### 👥 Patients Page  
![Patients](https://github.com/Manasa-Raghavendra/Healthcare_Management_System/blob/master/images/Screenshot%202025-11-19%20230022.png?raw=true)

### 📤 Upload Reports  
![Upload Reports](https://github.com/Manasa-Raghavendra/Healthcare_Management_System/blob/master/images/Screenshot%202025-11-19%20230056.png?raw=true)

### 📄 View Reports  
![View Reports](https://github.com/Manasa-Raghavendra/Healthcare_Management_System/blob/master/images/Screenshot%202025-11-19%20230123.png?raw=true)

---

# ☁️ Backblaze B2 Cloud Storage Screenshots

### Bucket Overview  
![B2 Bucket](https://github.com/Manasa-Raghavendra/Healthcare_Management_System/blob/master/images/Screenshot%202025-11-19%20230324.png?raw=true)

### Uploaded Files  
![B2 Files 1](https://github.com/Manasa-Raghavendra/Healthcare_Management_System/blob/master/images/Screenshot%202025-11-19%20230547.png?raw=true)

### File Details  
![B2 Files 2](https://github.com/Manasa-Raghavendra/Healthcare_Management_System/blob/master/images/Screenshot%202025-11-19%20230615.png?raw=true)

---

# 🚀 Future Enhancements

- Email/SMS notification for new reports  
- Doctor appointment scheduling  
- Patient login portal  
- Analytics dashboard for admins  
- Migration from SQLite → PostgreSQL  
- Hospital staff management  

---

# 📜 License
This project is open-source and free to use.

---

# 🙌 Author  
**Manasa Raghavendra**


---

