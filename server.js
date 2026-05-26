require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");
const cors = require("cors");
const path = require("path");

const app = express();

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 10);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "receipt-ocr-railway",
    time: new Date().toISOString()
  });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!process.env.N8N_WEBHOOK_URL) {
      return res.status(500).json({
        success: false,
        message: "Missing N8N_WEBHOOK_URL"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const form = new FormData();

    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    form.append("uploaded_by", req.body.uploaded_by || "Unknown");
    form.append("document_type", req.body.document_type || "receipt");
    form.append("transaction_type", req.body.transaction_type || "expense");
    form.append("expense_category", req.body.expense_category || "ทั่วไป");
    form.append("description", req.body.description || "");

    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: form.getHeaders(),
      body: form
    });

    const text = await n8nResponse.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.status(n8nResponse.status).json({
      success: n8nResponse.ok,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    if (!process.env.N8N_TRANSACTIONS_URL) {
      return res.status(500).json({
        success: false,
        message: "Missing N8N_TRANSACTIONS_URL"
      });
    }

    const response = await fetch(process.env.N8N_TRANSACTIONS_URL);
    const data = await response.json();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Receipt OCR app running on port ${port}`);
});
