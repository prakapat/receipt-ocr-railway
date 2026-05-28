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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "receipt-ocr-railway",
    time: new Date().toISOString()
  });
});

/**
 * STEP 1:
 * Upload file → OCR Preview
 * ยังไม่บันทึกลง Google Sheet
 */
app.post("/ocr-preview", upload.single("file"), async (req, res) => {
  try {
    if (!process.env.N8N_OCR_PREVIEW_URL) {
      return res.status(500).json({
        success: false,
        message: "Missing N8N_OCR_PREVIEW_URL"
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
    form.append("expense_category", req.body.expense_category || "ทั่วไป");
    form.append("status", req.body.status || "pending_review");
    form.append("description", req.body.description || "");

    const n8nResponse = await fetch(process.env.N8N_OCR_PREVIEW_URL, {
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

    return res.status(n8nResponse.status).json({
      success: n8nResponse.ok,
      data
    });
  } catch (error) {
    console.error("OCR Preview error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * STEP 2:
 * User ตรวจ/แก้แล้ว → Confirm Save
 * ค่อยบันทึกลง Google Sheet
 */
app.post("/confirm-save", async (req, res) => {
  try {
    if (!process.env.N8N_CONFIRM_SAVE_URL) {
      return res.status(500).json({
        success: false,
        message: "Missing N8N_CONFIRM_SAVE_URL"
      });
    }

    const n8nResponse = await fetch(process.env.N8N_CONFIRM_SAVE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const text = await n8nResponse.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(n8nResponse.status).json({
      success: n8nResponse.ok,
      data
    });
  } catch (error) {
    console.error("Confirm Save error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Dashboard API
 */
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

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Transactions error:", error);

    return res.status(500).json({
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

  return res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error"
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Receipt OCR app running on port ${port}`);
});
