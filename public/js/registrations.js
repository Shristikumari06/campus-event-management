/**
 * CampusConnect — My Registrations & Digital Pass Management (registrations.js)
 * Manages viewing student registered events, digital passes with QR codes,
 * and seat cancellation with instant status feedback.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuthSession();
  if (!user) {
    showToast('Please log in to view your registered event passes.', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=my-registrations.html';
    }, 1000);
    return;
  }

  loadMyRegistrations();
  setupTicketModalListeners();
});

// ============================================================================
// 1. FETCH & RENDER STUDENT REGISTRATIONS
// ============================================================================
async function loadMyRegistrations() {
  const container = document.getElementById('my-registrations-list');
  const countBadge = document.getElementById('my-reg-total-count');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: #94a3b8;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #ff0080; margin-bottom: 0.8rem;"></i>
      <p>Loading your registered passes...</p>
    </div>
  `;

  try {
    const res = await fetch('/api/registrations/my', { credentials: 'include' });
    const data = await res.json();

    if (data.success) {
      const items = data.registrations || [];
      if (countBadge) countBadge.textContent = items.length;

      if (items.length === 0) {
        container.innerHTML = `
          <div class="empty-dash-box">
            <div class="empty-dash-icon"><i class="fa-solid fa-ticket-simple"></i></div>
            <h4>No Active Event Registrations</h4>
            <p>You haven't reserved your seat for any upcoming campus events yet.</p>
            <a href="events.html" class="btn btn-primary btn-glow" style="margin-top: 1.25rem;">
              <i class="fa-solid fa-compass"></i> Explore Campus Events
            </a>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="table-responsive">
          <table class="dash-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Ticket ID</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((reg) => `
                <tr id="reg-row-${reg.registration_id}">
                  <td>
                    <strong style="color: #ffffff; font-size: 0.95rem;">${escapeHtml(reg.title)}</strong>
                  </td>
                  <td>
                    <span class="event-category-chip" style="position: static; font-size: 0.72rem;">${reg.category}</span>
                  </td>
                  <td>
                    <span style="color: #cbd5e1; font-size: 0.86rem;">
                      <i class="fa-regular fa-calendar-days text-pink"></i> ${formatEventDate(reg.start_datetime)}
                    </span>
                  </td>
                  <td>
                    <span style="color: #cbd5e1; font-size: 0.86rem;">
                      <i class="fa-solid fa-location-dot text-cyan"></i> ${escapeHtml(reg.venue)}
                    </span>
                  </td>
                  <td>
                    <code style="background: rgba(121,40,202,0.25); color: #c084fc; padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">
                      ${reg.ticket_code}
                    </code>
                  </td>
                  <td>
                    <span class="status-pill confirmed">
                      <i class="fa-solid fa-circle-check"></i> Confirmed
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end;">
                      <button class="btn btn-secondary" onclick="viewRegistrationTicketPass(${JSON.stringify(reg).replace(/"/g, '&quot;')})" title="View Digital Pass" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-qrcode"></i> Pass
                      </button>
                      <button class="btn btn-secondary" onclick="downloadPassFromRow(${JSON.stringify(reg).replace(/"/g, '&quot;')})" title="Download Official Entry PDF Pass" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; background: rgba(6,182,212,0.15); border-color: rgba(6,182,212,0.35); color: #38bdf8;">
                        <i class="fa-solid fa-file-pdf"></i> PDF
                      </button>
                      <button class="btn btn-secondary" onclick="openCertificateModal(${JSON.stringify(reg).replace(/"/g, '&quot;')})" title="Generate Official University Certificate" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; background: rgba(212, 175, 55, 0.15); border-color: rgba(212, 175, 55, 0.35); color: #d4af37;">
                        <i class="fa-solid fa-award"></i> Certificate
                      </button>
                      <button class="btn btn-subtle" onclick="confirmCancelRegistration(${reg.registration_id}, '${escapeHtml(reg.title)}')" title="Cancel Registration & Release Seat" style="color: #f87171; padding: 0.35rem 0.65rem;">
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  } catch (err) {
    console.warn('Backend registrations offline, reading from persistent local storage fallback');
    const localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
    const user = window.CampusConnect.currentUser;
    const items = user ? localRegs.filter(r => r.user_id === user.id || r.student_id === user.student_id) : localRegs;
    if (countBadge) countBadge.textContent = items.length;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-dash-box">
          <div class="empty-dash-icon"><i class="fa-solid fa-ticket-simple"></i></div>
          <h4>No Active Event Registrations</h4>
          <p>You haven't reserved your seat for any upcoming campus events yet.</p>
          <a href="events.html" class="btn btn-primary btn-glow" style="margin-top: 1.25rem;">
            <i class="fa-solid fa-compass"></i> Explore Campus Events
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="dash-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Date & Time</th>
              <th>Venue</th>
              <th>Ticket ID</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((reg) => `
              <tr id="reg-row-${reg.registration_id}">
                <td>
                  <strong style="color: #ffffff; font-size: 0.95rem;">${escapeHtml(reg.title)}</strong>
                </td>
                <td>
                  <span class="event-category-chip" style="position: static; font-size: 0.72rem;">${reg.category}</span>
                </td>
                <td>
                  <i class="fa-regular fa-calendar-days text-pink"></i> ${formatEventDate(reg.start_datetime)}
                </td>
                <td>
                  <i class="fa-solid fa-location-dot text-cyan"></i> ${escapeHtml(reg.venue)}
                </td>
                <td>
                  <code style="background: rgba(255,255,255,0.08); padding: 0.25rem 0.55rem; border-radius: 6px; color: #38bdf8; font-weight: 700;">${reg.ticket_code}</code>
                </td>
                <td>
                  <span class="status-pill confirmed"><i class="fa-solid fa-check"></i> Confirmed</span>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-action" onclick='viewRegistrationTicketPass(${JSON.stringify(reg)})' title="View entry ticket pass" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                      <i class="fa-solid fa-qrcode"></i> Pass
                    </button>
                    <button class="btn btn-secondary btn-action" onclick='downloadPassFromRow(${JSON.stringify(reg)})' title="Download Official Entry PDF Pass" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; background: rgba(6,182,212,0.15); border-color: rgba(6,182,212,0.35); color: #38bdf8;">
                      <i class="fa-solid fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-secondary btn-action" onclick='openCertificateModal(${JSON.stringify(reg)})' title="Generate Official University Certificate" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; background: rgba(212, 175, 55, 0.15); border-color: rgba(212, 175, 55, 0.35); color: #d4af37;">
                      <i class="fa-solid fa-award"></i> Certificate
                    </button>
                    <button class="btn btn-danger btn-action" onclick="confirmCancelRegistration(${reg.registration_id}, '${escapeHtml(reg.title)}')" title="Cancel registration" style="padding: 0.35rem 0.65rem;">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

let currentRegForPass = null;

// ============================================================================
// 2. VIEW DIGITAL PASS MODAL
// ============================================================================
function viewRegistrationTicketPass(reg) {
  currentRegForPass = reg;
  const modal = document.getElementById('ticket-pass-modal');
  if (!modal) return;

  const eventName = document.getElementById('ticket-event-name');
  const studentName = document.getElementById('ticket-student-name');
  const studentId = document.getElementById('ticket-student-id');
  const ticketVenue = document.getElementById('ticket-venue');
  const ticketDate = document.getElementById('ticket-date');
  const ticketBarcode = document.getElementById('ticket-barcode-text');
  const categoryBadge = document.getElementById('ticket-category-badge');

  if (eventName) eventName.textContent = reg.title;
  if (studentName) studentName.textContent = reg.student_name;
  if (studentId) studentId.textContent = reg.student_id;
  if (ticketVenue) ticketVenue.textContent = reg.venue;
  if (ticketDate) ticketDate.textContent = formatEventDate(reg.start_datetime);
  if (ticketBarcode) ticketBarcode.textContent = reg.ticket_code;
  if (categoryBadge) categoryBadge.textContent = `${reg.category} Event`;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

// ============================================================================
// 3. OFFICIAL UNIVERSITY CERTIFICATE MODAL
// ============================================================================
function openCertificateModal(reg) {
  const modal = document.getElementById('certificate-modal');
  if (!modal) return;

  const user = window.CampusConnect.currentUser || {};
  const studentName = reg.student_name || user.full_name || 'Alex Morgan';
  const studentId = reg.student_id || user.student_id || 'CS2026101';
  const department = reg.department || user.department || 'Computer Science & Engineering';

  const nameEl = document.getElementById('cert-student-name');
  const idEl = document.getElementById('cert-student-id');
  const deptEl = document.getElementById('cert-department');
  const eventEl = document.getElementById('cert-event-title');
  const codeEl = document.getElementById('cert-code');

  if (nameEl) nameEl.textContent = studentName;
  if (idEl) idEl.textContent = studentId;
  if (deptEl) deptEl.textContent = department;
  if (eventEl) eventEl.textContent = reg.title;
  if (codeEl) codeEl.textContent = `CC-CERT-${reg.ticket_code ? reg.ticket_code.replace(/[^0-9]/g, '').slice(-4) : '9481'}`;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function copyCertVerificationLink() {
  const codeEl = document.getElementById('cert-code');
  const certId = codeEl ? codeEl.textContent : 'CC-CERT-2026-9481';
  const url = `${window.location.origin || 'https://campusconnect.edu'}/verify?cert=${certId}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Certificate verification link copied to clipboard!', 'success');
    }).catch(() => {
      showToast(`Verification ID: ${certId}`, 'info');
    });
  } else {
    showToast(`Verification ID: ${certId}`, 'info');
  }
}

function addCurrentPassToCalendar() {
  if (!currentRegForPass) return;
  const reg = currentRegForPass;
  const title = reg.title || 'CampusConnect University Event';
  const venue = reg.venue || 'University Auditorium';
  const desc = `CampusConnect Event Pass for ${reg.student_name || 'Student'}. Ticket ID: ${reg.ticket_code || 'CC-PASS'}. Venue: ${venue}`;

  let start = new Date(reg.start_datetime);
  if (isNaN(start.getTime())) start = new Date();
  let end = new Date(start.getTime() + 3 * 3600 * 1000);

  const formatGCal = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const dates = `${formatGCal(start)}/${formatGCal(end)}`;

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(venue)}`;
  window.open(url, '_blank');
}

function setupTicketModalListeners() {
  const closeBtn = document.getElementById('close-ticket-modal');
  const modal = document.getElementById('ticket-pass-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Print Ticket Action -> Triggers high-resolution vector PDF generation & download
  const printBtn = document.getElementById('btn-print-ticket');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      downloadCurrentPassSlip();
    });
  }

  // Add to Google Calendar Action
  const gcalBtn = document.getElementById('btn-ticket-gcal');
  if (gcalBtn) {
    gcalBtn.addEventListener('click', addCurrentPassToCalendar);
  }

  // Share Certificate Action
  const certShareBtn = document.getElementById('btn-cert-share');
  if (certShareBtn) {
    certShareBtn.addEventListener('click', copyCertVerificationLink);
  }
}

// ============================================================================
// OFFICIAL STANDALONE CONFIRMATION PASS & SLIP GENERATOR (.PDF FORMAT)
// ============================================================================
function downloadPassConfirmationSlip(passData) {
  if (!passData) return;
  const user = window.CampusConnect && window.CampusConnect.currentUser ? window.CampusConnect.currentUser : {};
  const payload = {
    title: passData.event_title || passData.title || 'CampusConnect Campus Event',
    student_name: passData.student_name || passData.full_name || user.full_name || 'Alex Morgan',
    student_id: passData.student_id || user.student_id || 'CS2026101',
    department: passData.department || user.department || 'Computer Science & Engineering',
    venue: passData.venue || 'University Main Auditorium',
    date_str: passData.start_datetime ? formatEventDate(passData.start_datetime) : 'Nov 12, 2026 - 09:30 AM',
    ticket_code: passData.ticket_code || `CC-2026-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
    category: passData.category || 'Flagship Event',
    eligibility: passData.eligibility || 'Open to All Enrolled Students'
  };

  if (typeof window.downloadPassPDF === 'function') {
    window.downloadPassPDF(payload);
  } else {
    console.error('PDF generator not loaded.');
  }
}
window.downloadPassConfirmationSlip = downloadPassConfirmationSlip;

function downloadCurrentPassSlip() {
  if (currentRegForPass) {
    downloadPassConfirmationSlip(currentRegForPass);
  } else {
    const eventName = document.getElementById('ticket-event-name');
    const studentName = document.getElementById('ticket-student-name');
    const studentId = document.getElementById('ticket-student-id');
    const ticketVenue = document.getElementById('ticket-venue');
    const ticketDate = document.getElementById('ticket-date');
    const ticketBarcode = document.getElementById('ticket-barcode-text');
    const categoryBadge = document.getElementById('ticket-category-badge');

    downloadPassConfirmationSlip({
      title: eventName ? eventName.textContent : 'Campus Event',
      student_name: studentName ? studentName.textContent : 'Student',
      student_id: studentId ? studentId.textContent : 'CS2026101',
      venue: ticketVenue ? ticketVenue.textContent : 'Auditorium',
      start_datetime: ticketDate ? ticketDate.textContent : 'Nov 12, 2026',
      ticket_code: ticketBarcode ? ticketBarcode.textContent : 'CC-PASS-0042',
      category: categoryBadge ? categoryBadge.textContent.replace(' Event', '') : 'Technology'
    });
  }
}
window.downloadCurrentPassSlip = downloadCurrentPassSlip;

function downloadPassFromRow(reg) {
  downloadPassConfirmationSlip(reg);
}
window.downloadPassFromRow = downloadPassFromRow;

// Standalone Certificate Downloader (.PDF format)
function downloadCertificateSlip() {
  const nameEl = document.getElementById('cert-student-name');
  const idEl = document.getElementById('cert-student-id');
  const deptEl = document.getElementById('cert-department');
  const eventEl = document.getElementById('cert-event-title');
  const codeEl = document.getElementById('cert-code');

  const certData = {
    student_name: nameEl ? nameEl.textContent : 'Alex Morgan',
    student_id: idEl ? idEl.textContent : 'CS2026101',
    department: deptEl ? deptEl.textContent : 'Computer Science & Engineering',
    event_title: eventEl ? eventEl.textContent : 'TechFest 2026: Quantum Leap',
    cert_code: codeEl ? codeEl.textContent : 'CC-CERT-9481'
  };

  if (typeof window.downloadCertificatePDF === 'function') {
    window.downloadCertificatePDF(certData);
  } else {
    console.error('PDF generator not loaded.');
  }
}
window.downloadCertificateSlip = downloadCertificateSlip;

// ============================================================================
// 3. CANCEL REGISTRATION & RELEASE SEAT
// ============================================================================
async function confirmCancelRegistration(regId, eventTitle) {
  const confirmed = confirm(`Are you sure you want to cancel your seat for "${eventTitle}"?\n\nThis will release your pass back to fellow students.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/registrations/${regId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || 'Registration cancelled and seat released.', 'info');
      const row = document.getElementById(`reg-row-${regId}`);
      if (row) {
        row.style.opacity = '0';
        row.style.transform = 'scale(0.95)';
        setTimeout(() => loadMyRegistrations(), 300);
      } else {
        loadMyRegistrations();
      }
    } else {
      showToast(data.message || 'Failed to cancel registration.', 'error');
    }
  } catch (err) {
    console.warn('Backend cancel offline, removing from local storage');
    let localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
    localRegs = localRegs.filter(r => r.registration_id != regId);
    localStorage.setItem('campusconnect_registrations', JSON.stringify(localRegs));
    showToast('Registration cancelled and seat released.', 'info');
    loadMyRegistrations();
    if (typeof fetchRegisteredBadgeCount === 'function') {
      fetchRegisteredBadgeCount();
    }
  }
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

