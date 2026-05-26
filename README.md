# receipt-ocr-railway

# 🚀 Receipt OCR Automation Platform

ระบบเว็บแอพสำหรับอัพโหลดสลิปโอนเงิน / ใบเสร็จ แล้วอ่านข้อมูลด้วย OCR อัตโนมัติ จากนั้นบันทึกข้อมูลลง Google Sheets และแสดงผลผ่าน Dashboard

รองรับการ deploy บน Railway พร้อมเชื่อมต่อ n8n automation workflow ได้ทันที

---

# ✨ Features

## 📤 Upload Slip / Receipt

ผู้ใช้สามารถอัพโหลด:

* สลิปโอนเงิน
* ใบเสร็จ
* ใบกำกับภาษี
* รูปภาพ JPG / PNG / WEBP
* PDF

ผ่าน Web App ได้ทันที

---

## 🤖 OCR Extraction with AksonOCR

ระบบใช้ AksonOCR เพื่ออ่านข้อความและแยกข้อมูลอัตโนมัติ เช่น:

| Field            | Description  |
| ---------------- | ------------ |
| transaction_date | วันที่รายการ |
| transaction_time | เวลารายการ   |
| payer_name       | ผู้จ่าย      |
| payee_name       | ผู้รับ       |
| amount           | จำนวนเงิน    |
| bank_name        | ธนาคาร       |
| reference_no     | เลขอ้างอิง   |

---

## 📊 Dashboard รายรับรายจ่าย

Dashboard แสดงข้อมูลจาก Google Sheets แบบ realtime ผ่าน n8n webhook

แสดง:

* รายรับรวม
* รายจ่ายรวม
* ยอดสุทธิ
* ตารางรายการทั้งหมด
* Search
* Filter รายรับ / รายจ่าย

---

## ☁️ Google Drive Storage

ไฟล์ที่อัพโหลดทั้งหมดจะ:

* Upload เข้า Google Drive
* เก็บ URL ไฟล์
* เปิดดูย้อนหลังได้
* เชื่อมกับข้อมูล OCR

---

# 🏗 System Architecture

```text
User Upload
↓
Railway Web App
↓
n8n Webhook
↓
Google Drive Upload
↓
AksonOCR
↓
Format Data
↓
Google Sheets
↓
Dashboard
```

---

# 📁 Project Structure

```text
receipt-ocr-railway/
│
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── style.css
│   └── app.js
│
├── server.js
├── package.json
├── railway.json
├── .env.example
├── .gitignore
├── README.md
├── n8n-upload-workflow.json
└── n8n-dashboard-workflow.json
```

---

# 📄 Google Sheet Columns

สร้าง Google Sheet แล้วใส่ header แถวแรกตามนี้:

```text
id
created_at
uploaded_by
document_type
transaction_type
category
transaction_date
transaction_time
payer_name
payee_name
amount
bank_name
reference_no
file_url
ocr_text
status
```

---

# ⚙️ Environment Variables

เพิ่ม Variables บน Railway:

```env
N8N_WEBHOOK_URL=https://YOUR-N8N-DOMAIN/webhook/receipt-upload
N8N_TRANSACTIONS_URL=https://YOUR-N8N-DOMAIN/webhook/transactions
MAX_FILE_SIZE_MB=10
NODE_ENV=production
```

---

# 🧩 n8n Workflows

## 1. Upload Workflow

Workflow สำหรับ:

* รับไฟล์จากเว็บ
* Upload เข้า Google Drive
* OCR ด้วย AksonOCR
* Format ข้อมูล
* บันทึกลง Google Sheets

Flow:

```text
Webhook
↓
Prepare Input
↓
Upload to Google Drive
↓
Akson OCR
↓
Format Data
↓
Google Sheets
↓
Respond to Webhook
```

Import ไฟล์:

```text
n8n-upload-workflow.json
```

---

## 2. Dashboard Workflow

Workflow สำหรับดึงข้อมูลจาก Google Sheets มาแสดงหน้า Dashboard

Flow:

```text
Webhook GET /transactions
↓
Google Sheets Get Rows
↓
Respond to Webhook
```

Import ไฟล์:

```text
n8n-dashboard-workflow.json
```

---

# 🔑 AksonOCR Setup

Endpoint:

```text
https://backend.aksonocr.com/api/v1/key-extract
```

Header:

```text
X-API-Key: YOUR_API_KEY
```

customFields:

```json
[
  {
    "key": "transaction_date",
    "description": "วันที่ทำรายการ วันที่โอนเงิน หรือวันที่ออกใบเสร็จ"
  },
  {
    "key": "transaction_time",
    "description": "เวลาทำรายการหรือเวลาโอนเงิน ถ้ามี"
  },
  {
    "key": "payer_name",
    "description": "ชื่อผู้จ่ายเงิน ผู้โอนเงิน หรือบัญชีต้นทาง"
  },
  {
    "key": "payee_name",
    "description": "ชื่อผู้รับเงิน ร้านค้า บริษัท หรือบัญชีปลายทาง"
  },
  {
    "key": "amount",
    "description": "ยอดเงินรวมสุทธิ ให้ตอบเป็นตัวเลขเท่านั้น"
  },
  {
    "key": "bank_name",
    "description": "ชื่อธนาคาร ถ้ามี"
  },
  {
    "key": "reference_no",
    "description": "เลขอ้างอิงธุรกรรม เลขสลิป หรือเลขที่ใบเสร็จ"
  }
]
```

---

# 💻 Local Development

## Install Dependencies

```bash
npm install
```

---

## Start Server

```bash
npm start
```

เปิด:

```text
http://localhost:3000
```

---

# 🚂 Deploy on Railway

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

---

## 2. Deploy Railway

1. Login Railway
2. New Project
3. Deploy from GitHub Repo
4. Select repository
5. Add Variables
6. Deploy

---

# 🌐 Web Pages

| URL             | Description  |
| --------------- | ------------ |
| /               | Upload Page  |
| /dashboard.html | Dashboard    |
| /health         | Health Check |

---

# 🔌 API Endpoints

## Upload File

```text
POST /upload
```

Form Data:

| Field            | Description              |
| ---------------- | ------------------------ |
| file             | ไฟล์สลิปหรือใบเสร็จ      |
| uploaded_by      | ผู้บันทึก                |
| document_type    | slip / receipt / invoice |
| transaction_type | income / expense         |
| category         | หมวดหมู่                 |
| description      | หมายเหตุ                 |

---

## Get Transactions

```text
GET /api/transactions
```

---

# 🎨 UI Design

UI ถูกออกแบบแนว modern SaaS dashboard:

* Glassmorphism
* Soft gradients
* Responsive layout
* Mobile-first
* Dashboard cards
* Animated transitions
* Upload preview
* OCR Result Card

---

# 📱 Responsive Design

รองรับ:

* Mobile
* Tablet
* Desktop

---

# 🔒 Security Recommendations

ก่อนใช้งาน production จริง แนะนำเพิ่ม:

* Authentication
* จำกัด file size
* Validate file type
* Private Google Drive Folder
* Hide Webhook URL
* Rate limiting
* Duplicate slip detection

---

# 🚀 Future Improvements

สามารถต่อยอดได้:

* Multi-user
* LINE Notify
* Telegram Bot
* Email Reports
* PDF Export
* AI Categorization
* Expense Analytics
* Monthly Charts
* Accounting Integration
* AI Accounting Assistant

---

# 🛠 Tech Stack

| Technology    | Usage        |
| ------------- | ------------ |
| Node.js       | Backend      |
| Express       | API Server   |
| n8n           | Automation   |
| Railway       | Hosting      |
| Google Sheets | Database     |
| Google Drive  | File Storage |
| AksonOCR      | OCR          |
| HTML/CSS/JS   | Frontend     |

---

# 📌 Example Workflow

```text
User Upload Slip
↓
Express API Receive File
↓
Send to n8n
↓
Upload Google Drive
↓
OCR Extract
↓
Save Google Sheets
↓
Dashboard Update
```

---

# ❤️ Credits

Built with:

* n8n
* AksonOCR
* Railway
* Google Sheets
* Google Drive
* Node.js

---

# 📬 Support

หากต้องการต่อยอด:

* Authentication
* AI Categorization
* LINE Bot
* Telegram
* PDF Reports
* Accounting Integration
* Mobile App

สามารถพัฒนาต่อจากระบบนี้ได้ทันที 🚀
