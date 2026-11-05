/**
 * CampusConnect — Student Dashboard Client Script (dashboard.js)
 * Manages student metrics, personalized greetings, onboarding guidance,
 * upcoming events carousel, and registration previews.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuthSession();
  if (!user) {
    showToast('Please log in to access your student dashboard.', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=dashboard.html';
    }, 800);
    return;
  }

  // Populate user data
  populateUserData(user);
  loadDashboardMetrics();
  loadRecommendedEvents();
  loadRecentRegistrationsPreview();
  setupDashboardSearch();
});

// ============================================================================
// 1. POPULATE USER DATA
// ============================================================================
function populateUserData(user) {
  const welcomeName = document.getElementById('dash-welcome-name');
  const userDept = document.getElementById('dash-user-dept');
  const userRoll = document.getElementById('dash-user-roll');
  const navAvatar = document.getElementById('nav-user-avatar');
  const navName = document.getElementById('nav-user-name');

  if (welcomeName) welcomeName.textContent = user.full_name;
  if (userDept) userDept.textContent = user.department;
  if (userRoll) userRoll.textContent = user.student_id;
  if (navName) navName.textContent = user.full_name ? user.full_name.split(' ')[0] : 'Student';
  if (navAvatar) navAvatar.textContent = user.full_name ? user.full_name.charAt(0).toUpperCase() : 'S';
}

// ============================================================================
// 2. DASHBOARD METRICS
// ============================================================================
async function loadDashboardMetrics() {
  const regCountEl = document.getElementById('metric-my-regs');
  const upcomingCountEl = document.getElementById('metric-upcoming-total');

  try {
    // 1. My registrations count
    const regRes = await fetch('/api/registrations/my', { credentials: 'include' });
    const regData = await regRes.json();
    if (regData.success && regCountEl) {
      regCountEl.textContent = regData.count || 0;
    }

    // 2. Total upcoming events
    const evRes = await fetch('/api/events');
    const evData = await evRes.json();
    if (evData.success && upcomingCountEl) {
      upcomingCountEl.textContent = evData.count || 0;
    }
  } catch (err) {
    console.warn('Backend metrics offline, calculating from local registry fallback');
    const localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
    const user = window.CampusConnect.currentUser;
    const userRegs = user ? localRegs.filter(r => r.user_id === user.id || r.student_id === user.student_id) : [];
    if (regCountEl) regCountEl.textContent = userRegs.length;
    if (upcomingCountEl) upcomingCountEl.textContent = '6';
  }
}

// ============================================================================
// 3. RECOMMENDED & UPCOMING EVENTS
// ============================================================================
async function loadRecommendedEvents() {
  const container = document.getElementById('dash-recommended-events');
  if (!container) return;

  try {
    const res = await fetch('/api/events?sort=popular', { credentials: 'include' });
    const data = await res.json();

    if (data.success && data.events) {
      const topEvents = data.events.slice(0, 3);
      if (topEvents.length === 0) {
        container.innerHTML = `<p style="color: #94a3b8;">No events available at this moment.</p>`;
        return;
      }

      container.innerHTML = topEvents.map((ev) => `
        <div class="dash-event-card">
          <div class="event-card-img-wrap">
            <img src="${ev.image_url}" alt="${escapeHtml(ev.title)}" class="event-card-img">
            <span class="event-category-chip">${ev.category}</span>
          </div>
          <div class="event-card-content">
            <h4 class="event-card-title">${escapeHtml(ev.title)}</h4>
            <div class="event-card-meta">
              <div class="meta-row">
                <i class="fa-regular fa-calendar-days"></i>
                <span>${formatDate(ev.start_datetime)}</span>
              </div>
              <div class="meta-row">
                <i class="fa-solid fa-location-dot"></i>
                <span>${escapeHtml(ev.venue)}</span>
              </div>
            </div>
            <div class="event-card-actions" style="margin-top: auto;">
              <a href="events.html" class="btn btn-primary w-100 btn-glow">
                <span>View in Events</span> <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.warn('Backend events offline, rendering default recommendations');
    const fallbackEvents = [
      {
        title: "TechFest 2026: Quantum Leap",
        category: "Technology",
        image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
        start_datetime: "2026-11-12 09:30:00",
        venue: "Dr. APJ Abdul Kalam Auditorium"
      },
      {
        title: "Campus Music Night & Acoustic Jam",
        category: "Cultural",
        image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
        start_datetime: "2026-11-18 18:00:00",
        venue: "University Amphitheater"
      },
      {
        title: "Innovate Hackathon: AI for Sustainability",
        category: "Coding",
        image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
        start_datetime: "2026-11-24 10:00:00",
        venue: "Central Computing Complex Lab 3"
      }
    ];

    container.innerHTML = fallbackEvents.map((ev) => `
      <div class="dash-event-card">
        <div class="event-card-img-wrap">
          <img src="${ev.image_url}" alt="${escapeHtml(ev.title)}" class="event-card-img">
          <span class="event-category-chip">${ev.category}</span>
        </div>
        <div class="event-card-content">
          <h4 class="event-card-title">${escapeHtml(ev.title)}</h4>
          <div class="event-card-meta">
            <div class="meta-row">
              <i class="fa-regular fa-calendar-days"></i>
              <span>${formatDate(ev.start_datetime)}</span>
            </div>
            <div class="meta-row">
              <i class="fa-solid fa-location-dot"></i>
              <span>${escapeHtml(ev.venue)}</span>
            </div>
          </div>
          <div class="event-card-actions" style="margin-top: auto;">
            <a href="events.html" class="btn btn-primary w-100 btn-glow">
              <span>View in Events</span> <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// ============================================================================
// 4. RECENT REGISTRATIONS PREVIEW
// ============================================================================
async function loadRecentRegistrationsPreview() {
  const container = document.getElementById('dash-recent-registrations');
  if (!container) return;

  try {
    const res = await fetch('/api/registrations/my', { credentials: 'include' });
    const data = await res.json();

    if (data.success) {
      const items = (data.registrations || []).slice(0, 3);
      if (items.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #94a3b8;">
            <p>You haven't registered for any events yet.</p>
            <a href="events.html" class="btn btn-subtle" style="margin-top: 0.75rem;">Browse Campus Events</a>
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
                <th>Date</th>
                <th>Ticket ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((r) => `
                <tr>
                  <td><strong>${escapeHtml(r.title)}</strong></td>
                  <td>${formatDate(r.start_datetime)}</td>
                  <td><code>${r.ticket_code}</code></td>
                  <td><span class="status-pill confirmed"><i class="fa-solid fa-check"></i> Confirmed</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  } catch (err) {
    console.warn('Backend registrations offline, reading from local storage preview');
    const localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
    const user = window.CampusConnect.currentUser;
    const userRegs = user ? localRegs.filter(r => r.user_id === user.id || r.student_id === user.student_id) : [];

    if (userRegs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #94a3b8;">
          <p>You haven't registered for any events yet.</p>
          <a href="events.html" class="btn btn-subtle" style="margin-top: 0.75rem;">Browse Campus Events</a>
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
              <th>Date</th>
              <th>Ticket ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${userRegs.slice(0, 3).map((r) => `
              <tr>
                <td><strong>${escapeHtml(r.title)}</strong></td>
                <td>${formatDate(r.start_datetime)}</td>
                <td><code>${r.ticket_code}</code></td>
                <td><span class="status-pill confirmed"><i class="fa-solid fa-check"></i> Confirmed</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Search Redirect
function setupDashboardSearch() {
  const input = document.getElementById('dash-search-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim() !== '') {
        window.location.href = `events.html?search=${encodeURIComponent(input.value.trim())}`;
      }
    });
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

