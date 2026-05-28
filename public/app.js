const form = document.getElementById("uploadForm");
const result = document.getElementById("result");

let previewData = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  result.className = "";
  result.innerHTML = `<div class="loading">กำลังอัพโหลดและอ่านข้อมูล OCR...</div>`;

  try {
    const response = await fetch("/ocr-preview", {
      method: "POST",
      body: formData
    });

    const res = await response.json();

    if (!res.success) {
      throw new Error(res.message || "OCR Preview failed");
    }

    previewData = res.data || {};

    renderReviewForm(previewData);
  } catch (error) {
    result.innerHTML = `
      <div class="error-card">
        <h3>เกิดข้อผิดพลาด</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
});

function valueOf(data, key) {
  return data?.[key] || "";
}

function renderReviewForm(data) {
  result.innerHTML = `
    <div class="result-card">
      <div class="success-icon">✓</div>
      <h3>ตรวจสอบข้อมูลก่อนบันทึก</h3>
      <p class="muted">
        ระบบอ่านข้อมูลจาก OCR แล้ว กรุณาตรวจสอบและแก้ไขข้อมูลก่อนบันทึกลง Google Sheet
      </p>

      <form id="reviewForm" class="review-form">
        <div class="result-grid">
          <label>
            ผู้ออกเอกสาร
            <input name="issuer_name" value="${valueOf(data, "issuer_name")}" />
          </label>

          <label>
            เลขผู้เสียภาษีผู้ออก
            <input name="issuer_tax_id" value="${valueOf(data, "issuer_tax_id")}" />
          </label>

          <label>
            เลขที่ใบเสร็จ / ใบกำกับภาษี
            <input name="receipt_no" value="${valueOf(data, "receipt_no")}" />
          </label>

          <label>
            วันที่ออกเอกสาร
            <input name="issue_date" value="${valueOf(data, "issue_date")}" placeholder="dd/mm/yyyy" />
          </label>

          <label>
            เวลาออกเอกสาร
            <input name="issue_time" value="${valueOf(data, "issue_time")}" />
          </label>

          <label>
            ชื่อลูกค้า
            <input name="customer_name" value="${valueOf(data, "customer_name")}" />
          </label>

          <label>
            เลขผู้เสียภาษีลูกค้า
            <input name="customer_tax_id" value="${valueOf(data, "customer_tax_id")}" />
          </label>

          <label>
            ยอดก่อน VAT
            <input name="subtotal_amount" type="number" step="0.01" value="${valueOf(data, "subtotal_amount")}" />
          </label>

          <label>
            VAT
            <input name="vat_amount" type="number" step="0.01" value="${valueOf(data, "vat_amount")}" />
          </label>

          <label>
            ยอดรวม
            <input name="total_amount" type="number" step="0.01" value="${valueOf(data, "total_amount")}" />
          </label>

          <label>
            วิธีชำระเงิน
            <input name="payment_method" value="${valueOf(data, "payment_method")}" />
          </label>

          <label>
            สถานะ
            <select name="status">
              <option value="pending_review" ${data.status === "pending_review" ? "selected" : ""}>รอตรวจสอบ</option>
              <option value="approved" ${data.status === "approved" ? "selected" : ""}>ตรวจแล้ว</option>
            </select>
          </label>
        </div>

        <div class="result-actions">
          <a href="${data.file_url || "#"}" target="_blank">เปิดไฟล์ต้นฉบับ</a>
          <button type="submit" class="primary-btn">ยืนยันบันทึกลง Google Sheet</button>
        </div>
      </form>
    </div>
  `;

  const reviewForm = document.getElementById("reviewForm");

  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const confirmed = Object.fromEntries(new FormData(reviewForm).entries());

    const payload = {
      ...previewData,
      ...confirmed
    };

    await confirmSave(payload);
  });
}

async function confirmSave(payload) {
  result.innerHTML = `<div class="loading">กำลังบันทึกลง Google Sheet...</div>`;

  try {
    const response = await fetch("/confirm-save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const res = await response.json();

    if (!res.success) {
      throw new Error(res.message || "Confirm save failed");
    }

    const data = res.data || payload;

    result.innerHTML = `
      <div class="result-card">
        <div class="success-icon">✓</div>
        <h3>บันทึกสำเร็จ</h3>
        <p class="muted">ข้อมูลถูกบันทึกลง Google Sheet แล้ว</p>

        <div class="result-grid">
          <div>
            <span>ผู้ออกเอกสาร</span>
            <strong>${data.issuer_name || "-"}</strong>
          </div>

          <div>
            <span>เลขผู้เสียภาษี</span>
            <strong>${data.issuer_tax_id || "-"}</strong>
          </div>

          <div>
            <span>เลขที่เอกสาร</span>
            <strong>${data.receipt_no || "-"}</strong>
          </div>

          <div>
            <span>วันที่ออก</span>
            <strong>${data.issue_date || "-"}</strong>
          </div>

          <div>
            <span>ลูกค้า</span>
            <strong>${data.customer_name || "-"}</strong>
          </div>

          <div>
            <span>ยอดรวม</span>
            <strong>${Number(data.total_amount || 0).toLocaleString("th-TH")} บาท</strong>
          </div>

          <div class="wide">
            <span>สถานะ</span>
            <span class="status-badge">${data.status || "pending_review"}</span>
          </div>
        </div>

        <div class="result-actions">
          <a href="${data.file_url || "#"}" target="_blank">เปิดไฟล์ต้นฉบับ</a>
          <a href="dashboard.html">ไปหน้า Dashboard</a>
        </div>
      </div>
    `;
  } catch (error) {
    result.innerHTML = `
      <div class="error-card">
        <h3>เกิดข้อผิดพลาด</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}
