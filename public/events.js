/**
 * CampusConnect — Events Catalog & Registration Client Script (events.js)
 * Manages fetching events from REST API, search debouncing, category filtering,
 * sorting, modal detailed views, and instant registration interactions.
 */

const DEFAULT_CAMPUS_EVENTS = [
  {
    id: 1,
    title: "TechFest 2026: Quantum Leap",
    category: "College Fest",
    description: "Annual university technical symposium featuring AI robotics showcases, quantum computing workshops, hackathons, and guest keynotes from tech industry leaders.",
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    venue: "Dr. APJ Abdul Kalam Auditorium",
    start_datetime: "2026-11-12 09:30:00",
    end_datetime: "2026-11-14 18:00:00",
    capacity: 400,
    registered_count: 285,
    available_seats: 115,
    eligibility: "Open to All Enrolled University Students"
  },
  {
    id: 2,
    title: "Campus Music Night & Acoustic Jam",
    category: "Cultural",
    description: "An electrifying evening of indie rock bands, classical fusion performances, and open-mic acoustic sets organized by the University Music Society.",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    venue: "University Amphitheater",
    start_datetime: "2026-11-18 18:00:00",
    end_datetime: "2026-11-18 22:30:00",
    capacity: 600,
    registered_count: 540,
    available_seats: 60,
    eligibility: "Valid Student ID Card Required"
  },
  {
    id: 3,
    title: "Innovate Hackathon: AI for Sustainability",
    category: "Competition",
    description: "36-hour non-stop student hackathon building intelligent solutions for climate resilience, urban energy management, and sustainable smart cities.",
    image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    venue: "Central Computing Complex Lab 3",
    start_datetime: "2026-11-24 10:00:00",
    end_datetime: "2026-11-25 22:00:00",
    capacity: 200,
    registered_count: 188,
    available_seats: 12,
    eligibility: "Teams of 2-4 Students (UG/PG All Branches)"
  },
  {
    id: 4,
    title: "Hands-on Generative AI & LLM Systems Workshop",
    category: "Workshop",
    description: "Master fine-tuning foundational models, vector embeddings, and LangChain orchestration with hands-on coding notebooks and enterprise mentor guidance.",
    image_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    venue: "Advanced AI & Data Analytics Lab",
    start_datetime: "2026-11-28 10:00:00",
    end_datetime: "2026-11-28 16:30:00",
    capacity: 120,
    registered_count: 98,
    available_seats: 22,
    eligibility: "Basic Python Knowledge Recommended"
  },
  {
    id: 5,
    title: "National Leadership & Policy Seminar",
    category: "Seminar",
    description: "Keynote discourse by distinguished diplomatic ambassadors and public administrators analyzing economic resilience, sustainable infrastructure, and global governance in 2027.",
    image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    venue: "Senate Hall, Administration Tower",
    start_datetime: "2026-12-10 11:00:00",
    end_datetime: "2026-12-10 15:30:00",
    capacity: 220,
    registered_count: 175,
    available_seats: 45,
    eligibility: "Open to All Undergraduate & Postgraduate Scholars"
  },
  {
    id: 6,
    title: "Annual Inter-College Sports Meet 2026",
    category: "Sports",
    description: "Inter-collegiate athletics championship encompassing track & field, basketball championships, badminton showdowns, and football finals.",
    image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    venue: "University Sports Arena & Stadium",
    start_datetime: "2026-12-02 08:00:00",
    end_datetime: "2026-12-05 17:00:00",
    capacity: 800,
    registered_count: 610,
    available_seats: 190,
    eligibility: "Medical Fitness Certificate Required"
  }
];

let allEventsCache = [];
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'date-asc';

document.addEventListener('DOMContentLoaded', () => {
  setupEventControls();
  loadEventsFromAPI();
  setupDetailsModalListeners();
});

// ============================================================================
// 1. FETCH EVENTS FROM BACKEND API
// ============================================================================
async function loadEventsFromAPI() {
  const grid = document.getElementById('events-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: #94a3b8;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; color: #ff0080; margin-bottom: 1rem;"></i>
      <p style="font-size: 1.05rem;">Loading campus events...</p>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.append('category', activeCategory);
    if (searchQuery.trim() !== '') params.append('search', searchQuery.trim());
    params.append('sort', currentSort);

    const res = await fetch(`/api/events?${params.toString()}`, { credentials: 'include' });
    const data = await res.json();

    if (data.success) {
      allEventsCache = data.events || [];
      renderEventsGrid(allEventsCache);
      updateCategoryCounters();
    } else {
      grid.innerHTML = `<p style="color: #ef4444; text-align: center; grid-column: 1 / -1;">Failed to load events: ${data.message}</p>`;
    }
  } catch (err) {
    // Offline / file:// mode fallback: filter and display DEFAULT_CAMPUS_EVENTS
    console.warn('Backend events offline, rendering default catalog fallback');
    const localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
    const user = window.CampusConnect.currentUser;

    let filtered = [...DEFAULT_CAMPUS_EVENTS].map(ev => {
      const isReg = user ? localRegs.some(r => (r.user_id === user.id || r.student_id === user.student_id) && r.event_id == ev.id) : false;
      return { ...ev, user_is_registered: isReg };
    });

    if (activeCategory !== 'all') {
      filtered = filtered.filter(e => e.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    }

    allEventsCache = filtered;
    renderEventsGrid(allEventsCache);
  }
}

// ============================================================================
// 2. RENDER EVENTS GRID
// ============================================================================
function renderEventsGrid(events) {
  const grid = document.getElementById('events-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

  if (events.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('d-none');
    return;
  }

  if (emptyState) emptyState.classList.add('d-none');

  grid.innerHTML = events.map((ev) => {
    const registered = ev.registered_count || 0;
    const capacity = ev.capacity || 100;
    const seatsLeft = ev.available_seats !== undefined ? ev.available_seats : Math.max(0, capacity - registered);
    const percentFull = Math.min(100, Math.round((registered / capacity) * 100));

    let progressClass = '';
    if (percentFull > 85) progressClass = 'warning';
    if (seatsLeft === 0) progressClass = 'full';

    // Status Badge & Action Button
    let statusBadge = '';
    let actionButton = '';

    if (ev.user_is_registered) {
      statusBadge = `<span class="badge-status-chip enrolled"><i class="fa-solid fa-circle-check"></i> Registered</span>`;
      actionButton = `
        <button class="btn btn-secondary w-100 btn-view-ticket" onclick="openRegisteredPassModal(${ev.id})">
          <i class="fa-solid fa-ticket"></i> View Pass
        </button>
      `;
    } else if (ev.is_closed) {
      statusBadge = `<span class="badge-status-chip closed"><i class="fa-solid fa-clock"></i> Closed</span>`;
      actionButton = `
        <button class="btn btn-secondary w-100" disabled style="opacity: 0.6; cursor: not-allowed;">
          <i class="fa-solid fa-lock"></i> Registration Closed
        </button>
      `;
    } else if (ev.is_full || seatsLeft <= 0) {
      statusBadge = `<span class="badge-status-chip full"><i class="fa-solid fa-ban"></i> Full Capacity</span>`;
      actionButton = `
        <button class="btn btn-secondary w-100" disabled style="opacity: 0.6; cursor: not-allowed;">
          <i class="fa-solid fa-ban"></i> Event Full
        </button>
      `;
    } else {
      statusBadge = `<span class="badge-status-chip open"><i class="fa-solid fa-bolt"></i> ${seatsLeft} Seats Left</span>`;
      actionButton = `
        <button class="btn btn-primary btn-glow w-100" onclick="handleQuickRegister(${ev.id}, '${escapeHtml(ev.title)}')">
          <i class="fa-solid fa-user-plus"></i> Register Free
        </button>
      `;
    }

    const startDateStr = formatEventDate(ev.start_datetime);

    return `
      <div class="dash-event-card" id="event-card-${ev.id}">
        <div class="event-card-img-wrap">
          <img src="${ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" 
               alt="${escapeHtml(ev.title)}" class="event-card-img" loading="lazy">
          <span class="event-category-chip">${ev.category}</span>
          ${statusBadge}
        </div>

        <div class="event-card-content">
          <h3 class="event-card-title">${escapeHtml(ev.title)}</h3>
          
          <div class="event-card-meta">
            <div class="meta-row">
              <i class="fa-regular fa-calendar-days"></i>
              <span>${startDateStr}</span>
            </div>
            <div class="meta-row">
              <i class="fa-solid fa-location-dot"></i>
              <span>${escapeHtml(ev.venue)}</span>
            </div>
            <div class="meta-row" style="color: #c084fc; font-size: 0.82rem; font-weight: 600;">
              <i class="fa-solid fa-user-check"></i>
              <span>${escapeHtml(ev.eligibility || 'Open to All Students')}</span>
            </div>
          </div>

          <div class="capacity-progress-wrap">
            <div class="capacity-labels">
              <span><strong>${registered}</strong> filled</span>
              <span><strong>${seatsLeft}</strong> remaining of ${capacity}</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${progressClass}" style="width: ${percentFull}%"></div>
            </div>
          </div>

          <div class="event-card-actions">
            <button class="btn btn-secondary" onclick="viewEventDetails(${ev.id})" title="View complete details">
              <i class="fa-solid fa-circle-info"></i> Details
            </button>
            <div style="flex: 1;">
              ${actionButton}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// 3. SEARCH, FILTER & SORT CONTROLS
// ============================================================================
function setupEventControls() {
  const searchInput = document.getElementById('event-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  const sortSelect = document.getElementById('event-sort-select');
  const catPills = document.querySelectorAll('.cat-pill[data-filter]');
  const resetFiltersBtn = document.getElementById('btn-reset-filters');
  const emptyResetBtn = document.getElementById('btn-empty-reset');

  // Search Debouncing
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchQuery = e.target.value;
      if (clearBtn) {
        if (searchQuery.length > 0) clearBtn.classList.remove('d-none');
        else clearBtn.classList.add('d-none');
      }
      searchTimer = setTimeout(() => {
        loadEventsFromAPI();
      }, 300);
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.classList.add('d-none');
      loadEventsFromAPI();
    });
  }

  // Sort Selection
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadEventsFromAPI();
    });
  }

  // Category Filter Pills
  catPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      catPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-filter') || 'all';
      loadEventsFromAPI();
    });
  });

  // Reset Filters
  const resetAll = () => {
    activeCategory = 'all';
    searchQuery = '';
    currentSort = 'date-asc';
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.classList.add('d-none');
    if (sortSelect) sortSelect.value = 'date-asc';
    catPills.forEach((p) => {
      if (p.getAttribute('data-filter') === 'all') p.classList.add('active');
      else p.classList.remove('active');
    });
    loadEventsFromAPI();
  };

  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAll);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAll);
}

// Update category pill counts
async function updateCategoryCounters() {
  try {
    const res = await fetch('/api/events/categories/summary');
    const data = await res.json();
    if (data.success && data.categories) {
      let total = 0;
      data.categories.forEach((cat) => {
        total += cat.count;
        const el = document.getElementById(`pill-count-${cat.category}`) || document.getElementById(`count-cat-${cat.category}`);
        if (el) el.textContent = `${cat.count} Active Events`;
      });
      const allCountEl = document.getElementById('count-all');
      if (allCountEl) allCountEl.textContent = total;
    }
  } catch (e) {
    // ignore counter fetch error
  }
}

// ============================================================================
// 4. ONE-CLICK REGISTER & CELEBRATION
// ============================================================================
async function handleQuickRegister(eventId, eventTitle) {
  // Check if authenticated
  if (!window.CampusConnect || !window.CampusConnect.isAuthenticated) {
    showToast('Please sign in or create a student account to register for events.', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=events.html';
    }, 1200);
    return;
  }

  try {
    showToast(`Reserving seat for "${eventTitle}"...`, 'info', 2000);

    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ event_id: eventId })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message, 'success', 5000);
      triggerConfetti();

      // Reload events to reflect new seat counts
      await loadEventsFromAPI();
      if (typeof fetchRegisteredBadgeCount === 'function') {
        fetchRegisteredBadgeCount();
      }

      // Display Ticket Modal
      if (data.ticket) {
        showGeneratedTicketModal(data.ticket);
      }
    } else {
      showToast(data.message || 'Registration failed.', 'error', 4500);
    }
  } catch (err) {
    console.warn('Backend registration offline, saving pass locally');
    const user = window.CampusConnect.currentUser || { full_name: 'Student', student_id: 'CS2026042' };
    const ev = allEventsCache.find(e => e.id == eventId) || DEFAULT_CAMPUS_EVENTS.find(e => e.id == eventId) || {
      id: eventId,
      title: eventTitle,
      venue: 'Dr. APJ Abdul Kalam Auditorium',
      start_datetime: '2026-11-12 09:30:00',
      category: 'Technology'
    };

    const localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
    const isAlreadyRegistered = localRegs.some(
      r => (r.user_id === user.id || r.student_id === user.student_id) && r.event_id == eventId
    );

    if (isAlreadyRegistered) {
      showToast('You already have a verified entry pass for this event!', 'warning', 4000);
      return;
    }

    const ticketCode = `CC-2026-${String(eventId).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReg = {
      registration_id: Date.now(),
      event_id: eventId,
      user_id: user.id || 1,
      student_name: user.full_name,
      student_id: user.student_id,
      title: ev.title || eventTitle,
      category: ev.category || 'Technology',
      venue: ev.venue || 'Main Auditorium',
      start_datetime: ev.start_datetime || '2026-11-12 10:00:00',
      ticket_code: ticketCode,
      status: 'confirmed',
      registered_at: new Date().toISOString()
    };

    localRegs.push(newReg);
    localStorage.setItem('campusconnect_registrations', JSON.stringify(localRegs));

    showToast(`Seat successfully reserved for "${eventTitle}"!`, 'success', 5000);
    triggerConfetti();

    // Reload grid to show registered badge
    loadEventsFromAPI();
    if (typeof fetchRegisteredBadgeCount === 'function') {
      fetchRegisteredBadgeCount();
    }

    showGeneratedTicketModal({
      event_title: ev.title || eventTitle,
      student_name: user.full_name,
      student_id: user.student_id,
      venue: ev.venue,
      start_datetime: ev.start_datetime,
      ticket_code: ticketCode
    });
  }
}

// ============================================================================
// 5. VIEW EVENT DETAILS MODAL
// ============================================================================
async function viewEventDetails(eventId) {
  const modal = document.getElementById('event-details-modal');
  const body = document.getElementById('details-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #ff0080;"></i>
      <p style="margin-top: 1rem; color: #94a3b8;">Loading event details...</p>
    </div>
  `;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  let ev = null;
  try {
    const res = await fetch(`/api/events/${eventId}`, { credentials: 'include' });
    const data = await res.json();
    if (data.success && data.event) {
      ev = data.event;
    }
  } catch (err) {
    // Offline / fallback mode
  }

  // Graceful offline fallback from local events catalog
  if (!ev) {
    const found = allEventsCache.find(e => e.id == eventId) || DEFAULT_CAMPUS_EVENTS.find(e => e.id == eventId);
    if (found) {
      const localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
      const user = window.CampusConnect ? window.CampusConnect.currentUser : null;
      const isReg = user ? localRegs.some(r => (r.user_id === user.id || r.student_id === user.student_id) && r.event_id == found.id) : false;
      const registered = found.registered_count || 0;
      const capacity = found.capacity || 100;
      ev = {
        ...found,
        user_is_registered: isReg,
        available_seats: found.available_seats !== undefined ? found.available_seats : Math.max(0, capacity - registered),
        is_full: registered >= capacity,
        organizer_name: found.organizer || 'Student Affairs & Faculty Council'
      };
    }
  }

  if (ev) {
    const registered = ev.registered_count || 0;
    const capacity = ev.capacity || 100;
    const seatsLeft = ev.available_seats !== undefined ? ev.available_seats : Math.max(0, capacity - registered);

    let regButtonHtml = '';
    if (ev.user_is_registered) {
      regButtonHtml = `
        <button class="btn btn-secondary" onclick="openRegisteredPassModal(${ev.id})">
          <i class="fa-solid fa-ticket"></i> View My Registered Pass
        </button>
      `;
    } else if (ev.is_closed) {
      regButtonHtml = `<button class="btn btn-secondary" disabled>Registration Closed</button>`;
    } else if (ev.is_full || seatsLeft <= 0) {
      regButtonHtml = `<button class="btn btn-secondary" disabled>Full Capacity</button>`;
    } else {
      regButtonHtml = `
        <button class="btn btn-primary btn-glow" onclick="handleQuickRegister(${ev.id}, '${escapeHtml(ev.title)}'); closeModal('event-details-modal');">
          <i class="fa-solid fa-user-plus"></i> Confirm Seat Registration
        </button>
      `;
    }

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="position: relative; border-radius: 14px; overflow: hidden; height: 260px;">
          <img src="${ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(ev.title)}" style="width: 100%; height: 100%; object-fit: cover;">
          <span class="event-category-chip" style="position: absolute; top: 15px; left: 15px;">${ev.category}</span>
        </div>

        <div>
          <h2 style="font-size: 1.85rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem;">${escapeHtml(ev.title)}</h2>
          <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.65; margin-bottom: 1.5rem;">${escapeHtml(ev.description || '')}</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; background: rgba(255,255,255,0.04); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 1.5rem;">
            <div>
              <small style="color: #94a3b8; font-weight: 700; text-transform: uppercase;">DATE & TIME</small>
              <div style="color: #fff; font-weight: 600; margin-top: 3px;">
                <i class="fa-regular fa-calendar-days text-pink"></i> ${formatEventDate(ev.start_datetime)}
              </div>
            </div>
            <div>
              <small style="color: #94a3b8; font-weight: 700; text-transform: uppercase;">VENUE</small>
              <div style="color: #fff; font-weight: 600; margin-top: 3px;">
                <i class="fa-solid fa-location-dot text-cyan"></i> ${escapeHtml(ev.venue || 'Campus Auditorium')}
              </div>
            </div>
            <div>
              <small style="color: #94a3b8; font-weight: 700; text-transform: uppercase;">ELIGIBILITY CRITERIA</small>
              <div style="color: #c084fc; font-weight: 600; margin-top: 3px;">
                <i class="fa-solid fa-user-check text-purple"></i> ${escapeHtml(ev.eligibility || 'Open to All Enrolled Students')}
              </div>
            </div>
            <div>
              <small style="color: #94a3b8; font-weight: 700; text-transform: uppercase;">ORGANIZED BY</small>
              <div style="color: #fff; font-weight: 600; margin-top: 3px;">
                <i class="fa-solid fa-building-columns text-purple"></i> ${escapeHtml(ev.organizer_name || 'University Event Board')}
              </div>
            </div>
            <div>
              <small style="color: #94a3b8; font-weight: 700; text-transform: uppercase;">SEATS AVAILABLE</small>
              <div style="color: #34d399; font-weight: 700; margin-top: 3px;">
                <i class="fa-solid fa-users text-green"></i> ${seatsLeft} / ${capacity} seats remaining
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem;">
            <button class="btn btn-subtle" onclick="closeModal('event-details-modal')">Close</button>
            ${regButtonHtml}
          </div>
        </div>
      </div>
    `;
  } else {
    body.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 2rem;">Event details are currently unavailable.</p>`;
  }
}

function addCurrentPassToGoogleCalendar() {
  const eventNameEl = document.getElementById('ticket-event-name');
  const venueEl = document.getElementById('ticket-venue');
  const barcodeEl = document.getElementById('ticket-barcode-text');

  const title = eventNameEl ? eventNameEl.textContent : 'CampusConnect University Event';
  const venue = venueEl ? venueEl.textContent : 'Main Auditorium';
  const desc = `CampusConnect Verified Entry Pass. Ticket ID: ${barcodeEl ? barcodeEl.textContent : 'CC-PASS'}. Venue: ${venue}`;

  let start = new Date();
  let end = new Date(start.getTime() + 3 * 3600 * 1000);

  const formatGCal = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const dates = `${formatGCal(start)}/${formatGCal(end)}`;

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(venue)}`;
  window.open(url, '_blank');
}

// Modal closing setup
function setupDetailsModalListeners() {
  const closeDetails = document.getElementById('close-details-modal');
  if (closeDetails) {
    closeDetails.addEventListener('click', () => closeModal('event-details-modal'));
  }
  const modal = document.getElementById('event-details-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal('event-details-modal');
    });
  }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}
window.closeModal = closeModal;

// Open Verified Entry Ticket Pass for Enrolled Event
async function openRegisteredPassModal(eventId) {
  const user = (window.CampusConnect && window.CampusConnect.currentUser) || { full_name: 'Student', student_id: 'CS2026042' };
  let reg = null;

  try {
    const res = await fetch('/api/registrations/my', { credentials: 'include' });
    const data = await res.json();
    if (data.success && data.registrations) {
      reg = data.registrations.find(r => r.event_id == eventId);
    }
  } catch (e) {}

  if (!reg) {
    const localRegs = JSON.parse(localStorage.getItem('campusconnect_registrations') || '[]');
    reg = localRegs.find(r => (r.user_id === user.id || r.student_id === user.student_id) && r.event_id == eventId);
  }

  const ev = (allEventsCache && allEventsCache.find(e => e.id == eventId)) ||
             (typeof DEFAULT_CAMPUS_EVENTS !== 'undefined' ? DEFAULT_CAMPUS_EVENTS.find(e => e.id == eventId) : null) || {
    id: eventId,
    title: 'TechFest 2026: Quantum Leap',
    venue: 'Dr. APJ Abdul Kalam Auditorium',
    start_datetime: '2026-11-12 09:30:00',
    category: 'Technology'
  };

  const ticketData = {
    event_title: (reg && reg.title) || ev.title,
    student_name: (reg && (reg.student_name || reg.full_name)) || user.full_name,
    student_id: (reg && reg.student_id) || user.student_id,
    venue: (reg && reg.venue) || ev.venue,
    start_datetime: (reg && reg.start_datetime) || ev.start_datetime,
    ticket_code: (reg && reg.ticket_code) || `CC-2026-${String(eventId).padStart(2, '0')}-0042`
  };

  showGeneratedTicketModal(ticketData);
}
window.openRegisteredPassModal = openRegisteredPassModal;

let currentGeneratedTicket = null;

// ============================================================================
// 6. DIGITAL TICKET PASS MODAL DISPLAY
// ============================================================================
function showGeneratedTicketModal(ticket) {
  currentGeneratedTicket = ticket;
  const modal = document.getElementById('ticket-pass-modal');
  if (!modal) return;

  const eventName = document.getElementById('ticket-event-name');
  const studentName = document.getElementById('ticket-student-name');
  const studentId = document.getElementById('ticket-student-id');
  const ticketVenue = document.getElementById('ticket-venue');
  const ticketDate = document.getElementById('ticket-date');
  const ticketBarcode = document.getElementById('ticket-barcode-text');

  if (eventName) eventName.textContent = ticket.event_title || ticket.title;
  if (studentName) studentName.textContent = ticket.student_name;
  if (studentId) studentId.textContent = ticket.student_id;
  if (ticketVenue) ticketVenue.textContent = ticket.venue;
  if (ticketDate) ticketDate.textContent = formatEventDate(ticket.start_datetime);
  if (ticketBarcode) ticketBarcode.textContent = ticket.ticket_code;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  const closeBtn = document.getElementById('close-ticket-modal');
  if (closeBtn) {
    closeBtn.onclick = () => closeModal('ticket-pass-modal');
  }
}

// Download official entry pass in PDF format (.pdf)
function downloadCurrentPassSlip() {
  const ticket = currentGeneratedTicket || {};
  const eventName = document.getElementById('ticket-event-name');
  const studentName = document.getElementById('ticket-student-name');
  const studentId = document.getElementById('ticket-student-id');
  const ticketVenue = document.getElementById('ticket-venue');
  const ticketDate = document.getElementById('ticket-date');
  const ticketBarcode = document.getElementById('ticket-barcode-text');
  const user = window.CampusConnect && window.CampusConnect.currentUser ? window.CampusConnect.currentUser : {};

  const payload = {
    title: ticket.event_title || ticket.title || (eventName ? eventName.textContent : 'Campus Event'),
    student_name: ticket.student_name || (studentName ? studentName.textContent : user.full_name || 'Student'),
    student_id: ticket.student_id || (studentId ? studentId.textContent : user.student_id || 'CS2026101'),
    department: ticket.department || user.department || 'Computer Science & Engineering',
    venue: ticket.venue || (ticketVenue ? ticketVenue.textContent : 'Main Auditorium'),
    date_str: ticket.start_datetime ? formatEventDate(ticket.start_datetime) : (ticketDate ? ticketDate.textContent : 'Nov 12, 2026'),
    ticket_code: ticket.ticket_code || (ticketBarcode ? ticketBarcode.textContent : 'CC-PASS-0042'),
    category: ticket.category || 'University Event',
    eligibility: ticket.eligibility || 'Open to All Enrolled Students'
  };

  downloadPassConfirmationSlip(payload);
}
window.downloadCurrentPassSlip = downloadCurrentPassSlip;

function downloadPassConfirmationSlip(passData) {
  if (!passData) return;
  const user = window.CampusConnect && window.CampusConnect.currentUser ? window.CampusConnect.currentUser : {};
  const payload = {
    title: passData.event_title || passData.title || 'CampusConnect Campus Event',
    student_name: passData.student_name || passData.full_name || user.full_name || 'Alex Morgan',
    student_id: passData.student_id || user.student_id || 'CS2026101',
    department: passData.department || user.department || 'Computer Science & Engineering',
    venue: passData.venue || 'University Main Auditorium',
    date_str: passData.start_datetime ? (typeof formatEventDate === 'function' ? formatEventDate(passData.start_datetime) : passData.start_datetime) : (passData.date_str || 'Nov 12, 2026 - 09:30 AM'),
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

// Helper: Date Formatter
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

// Helper: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Confetti Canvas Animation
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#ff0080', '#7928ca', '#0070f3', '#00dfd8', '#ff4d4d', '#f5a623', '#50e3c2'];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 9 + 4,
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 5 + 3,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 8 - 4
    });
  }

  let frames = 0;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    frames++;
    if (frames < 120) {
      requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  updateConfetti();
}

