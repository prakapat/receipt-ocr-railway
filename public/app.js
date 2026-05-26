const form = document.getElementById("uploadForm");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  result.className = "";
  result.innerHTML = `<div class="loading">กำลังอัพโหลดและอ่านข้อมูล...</div>`;

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const res = await response.json();

    if (!res.success) {
      throw new Error(res.message || "Upload failed");
    }

    const data = res.data || {};

    result.innerHTML = `
      <div class="result-card">
        <div class="success-icon">✓</div>
        <h3>บันทึกสำเร็จ</h3>
        <p class="muted">ระบบอ่านข้อมูลจากใบเสร็จ/ใบกำกับภาษี และบันทึกลง Google Sheet แล้ว</p>

        <div class="result-grid">
          <div>
            <span>ผู้ออกเอกสาร</span>
            <strong>${data.issuer_name || "-"}</strong>
          </div>

          <div>
            <span>เลขผู้เสียภาษีผู้ออก</span>
            <strong>${data.issuer_tax_id || "-"}</strong>
          </div>

          <div>
            <span>เลขที่เอกสาร</span>
            <strong>${data.receipt_no || "-"}</strong>
          </div>

          <div>
            <span>วันที่ออกเอกสาร</span>
            <strong>${data.issue_date || "-"}</strong>
          </div>

          <div>
            <span>ลูกค้า</span>
            <strong>${data.customer_name || "-"}</strong>
          </div>

          <div>
            <span>ยอดรวมทั้งสิ้น</span>
            <strong>${Number(data.total_amount || 0).toLocaleString("th-TH")} บาท</strong>
          </div>

          <div>
            <span>VAT</span>
            <strong>${Number(data.vat_amount || 0).toLocaleString("th-TH")} บาท</strong>
          </div>

          <div>
            <span>วิธีชำระเงิน</span>
            <strong>${data.payment_method || "-"}</strong>
          </div>

          <div class="wide">
            <span>สถานะ</span>
            <span class="status-badge">${data.status || "pending_review"}</span>
          </div>
        </div>

        <div class="result-actions">
          <a href="${data.file_url || "#"}" target="_blank">เปิดไฟล์ใน Google Drive</a>
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
});
