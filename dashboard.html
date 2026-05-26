const form = document.getElementById("uploadForm");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  result.innerHTML = `<div class="loading">กำลังอัพโหลดและอ่านข้อมูล...</div>`;

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const res = await response.json();
    const data = res.data || {};

    result.innerHTML = `
      <div class="result-card">
        <div class="success-icon">✓</div>
        <h3>บันทึกสำเร็จ</h3>
        <p class="muted">ระบบอ่านข้อมูลจากสลิปและบันทึกลง Google Sheet แล้ว</p>

        <div class="result-grid">
          <div>
            <span>วันที่</span>
            <strong>${data.transaction_date || "-"}</strong>
          </div>
          <div>
            <span>ยอดเงิน</span>
            <strong>${Number(data.amount || 0).toLocaleString("th-TH")} บาท</strong>
          </div>
          <div>
            <span>ผู้รับ</span>
            <strong>${data.payee_name || data.merchant || "-"}</strong>
          </div>
          <div>
            <span>ธนาคาร</span>
            <strong>${data.bank_name || "-"}</strong>
          </div>
          <div class="wide">
            <span>เลขอ้างอิง</span>
            <strong>${data.reference_no || "-"}</strong>
          </div>
          <div class="wide">
            <span>สถานะ</span>
            <strong>${data.status || "pending_review"}</strong>
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
