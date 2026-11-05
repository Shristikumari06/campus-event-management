/**
 * CAMPUSCONNECT — EVENT MANAGEMENT & REGISTRATION PORTAL
 * Upgraded Frontend JavaScript Logic
 * Modern, clean, presentation-ready modular implementation
 */

// ============================================================================
// 1. DATA STORE: CAMPUS EVENTS REPOSITORY
// ============================================================================
const campusEvents = [
  {
    id: 1,
    title: "TechFest 2026: Quantum Leap",
    category: "Technology",
    month: "NOV",
    day: "12",
    dateFull: "Thursday, November 12, 2026",
    isoDate: "2026-11-12",
    time: "09:30 AM – 05:30 PM",
    venue: "Dr. A.P.J. Abdul Kalam Auditorium",
    department: "Computer Science",
    organizer: "ACM Student Chapter & Robotics Club",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    description: "The flagship annual engineering symposium showcasing artificial intelligence demonstrations, robotics arena battles, ethical hacking workshops, and guest keynote from leading Silicon Valley researchers.",
    seatsTotal: 400,
    seatsRegistered: 342,
    featured: true,
    popular: true,
    perks: ["Free Swag Kit", "Certificate", "Lunch Provided"]
  },
  {
    id: 2,
    title: "Campus Music Night: Euphoria 2026",
    category: "Cultural",
    month: "NOV",
    day: "18",
    dateFull: "Wednesday, November 18, 2026",
    isoDate: "2026-11-18",
    time: "06:00 PM – 10:30 PM",
    venue: "University Open-Air Amphitheatre",
    department: "Cultural Society",
    organizer: "Campus Cultural Union & Fusion Band",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    description: "An electrifying night of live indie rock, campus battle-of-the-bands, Bollywood acoustic medleys, and neon light stages. Grab your glowsticks and sing along under the campus night stars!",
    seatsTotal: 800,
    seatsRegistered: 745,
    featured: true,
    popular: true,
    perks: ["Free Entry", "Glow Bands", "Food Stalls"]
  },
  {
    id: 3,
    title: "Innovate Hackathon: 36H CodeSprint",
    category: "Coding",
    month: "NOV",
    day: "22",
    dateFull: "Sunday, November 22, 2026",
    isoDate: "2026-11-22",
    time: "08:00 AM – Next Day 08:00 PM",
    venue: "Innovation & Incubation Hub, Block B",
    department: "Computer Science",
    organizer: "Developer Student Club (GDSC)",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    description: "Build cutting-edge full-stack, Web3, and machine learning solutions addressing real-world civic and healthcare challenges. Over $5,000 in prizes, free food, mentor workshops, and direct angel funding opportunities.",
    seatsTotal: 250,
    seatsRegistered: 215,
    featured: true,
    popular: true,
    perks: ["$5,000 Prize Pool", "24/7 Red Bull & Meals", "Internship Offers"]
  },
  {
    id: 4,
    title: "Annual Inter-College Athletics Meet",
    category: "Sports",
    month: "DEC",
    day: "04",
    dateFull: "Friday, December 04, 2026",
    isoDate: "2026-12-04",
    time: "07:30 AM – 04:00 PM",
    venue: "Main Campus Sports Complex & Track",
    department: "Sports Council",
    organizer: "University Physical Education Board",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    description: "Witness adrenaline-packed track and field sprints, inter-departmental football finals, relay championships, and cheer performances. Medals, certificates, and university sports honors awarded at closing ceremony.",
    seatsTotal: 600,
    seatsRegistered: 480,
    featured: false,
    popular: false,
    perks: ["Medals & Trophies", "Sports Kit", "Refreshments"]
  },
  {
    id: 5,
    title: "Frames & Focus: Photography Exhibition",
    category: "Creative",
    month: "DEC",
    day: "09",
    dateFull: "Wednesday, December 09, 2026",
    isoDate: "2026-12-09",
    time: "11:00 AM – 06:00 PM",
    venue: "Central Fine Arts Gallery, Wing 2",
    department: "Cultural Society",
    organizer: "Shutterbugs Photography Collective",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    description: "Curated student showcase featuring monochrome street portraits, wildlife captures, architectural symmetry, and visual storytelling. Includes live DSLR portrait lighting masterclasses with seasoned documentary photographers.",
    seatsTotal: 180,
    seatsRegistered: 120,
    featured: false,
    popular: false,
    perks: ["Live Studio Demo", "Gallery Print Feature", "Certificate"]
  },
  {
    id: 6,
    title: "Global Entrepreneurship & Venture Summit",
    category: "Business",
    month: "DEC",
    day: "15",
    dateFull: "Tuesday, December 15, 2026",
    isoDate: "2026-12-15",
    time: "10:00 AM – 05:00 PM",
    venue: "School of Management Executive Hall",
    department: "Business School",
    organizer: "Campus E-Cell & Venture Network",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    description: "Pitch your early startup prototype to angel investors, network with alumni founders, and attend keynote panels discussing venture capital funding, product-market fit, and scaling tech ventures in 2027.",
    seatsTotal: 300,
    seatsRegistered: 265,
    featured: false,
    popular: true,
    perks: ["Investor Pitch Slots", "Executive Lunch", "Startup Kit"]
  },
  {
    id: 7,
    title: "Autonomous Robotics & Drone Workshop",
    category: "Technology",
    month: "DEC",
    day: "19",
    dateFull: "Saturday, December 19, 2026",
    isoDate: "2026-12-19",
    time: "10:00 AM – 03:30 PM",
    venue: "Advanced Robotics Lab 301",
    department: "Engineering",
    organizer: "Mechatronics & Drone Club",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    description: "Hands-on assembly and programming of micro quadcopters using ESP32 and flight controller firmware. Hardware kits supplied for the workshop duration.",
    seatsTotal: 120,
    seatsRegistered: 98,
    featured: false,
    popular: false,
    perks: ["Hardware Kit Provided", "Take-Home Drone", "Certificate"]
  },
  {
    id: 8,
    title: "Rangmanch: Inter-Collegiate Theatre Fest",
    category: "Cultural",
    month: "DEC",
    day: "22",
    dateFull: "Tuesday, December 22, 2026",
    isoDate: "2026-12-22",
    time: "02:00 PM – 08:30 PM",
    venue: "Rabindranath Tagore Memorial Theatre",
    department: "Cultural Society",
    organizer: "Dramatics & Street Play Society",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    description: "Captivating one-act plays, street theatre (Nukkad Natak), and musical monologues performed by premier drama societies across 14 visiting state universities.",
    seatsTotal: 450,
    seatsRegistered: 390,
    featured: false,
    popular: false,
    perks: ["Best Actor Awards", "Free Admission", "Faculty Pass"]
  }
];

// ============================================================================
// 2. STATE MANAGEMENT & STORAGE UTILS
// ============================================================================
const STORAGE_KEYS = {
  REGISTRATIONS: "campusconnect_registrations_v2",
  BOOKMARKS: "campusconnect_bookmarks_v2",
  PROPOSALS: "campusconnect_proposals_v2"
};

let activeCategory = "all";
let searchQuery = "";
let sortMode = "date-asc";
let currentFeaturedSlide = 0;
let featuredEventsList = campusEvents.filter(e => e.featured);

// LocalStorage Helpers with Cross-Page Synchronization
function getSavedRegistrations() {
  try {
    const list1 = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) || [];
    const list2 = JSON.parse(localStorage.getItem("campusconnect_registrations")) || [];
    const combined = [...list1, ...list2];

    const seen = new Set();
    const normalized = [];

    for (const item of combined) {
      const regId = item.regId || item.ticket_code || `CC-2026-${item.eventId || item.event_id || 1}-001`;
      const key = `${item.eventId || item.event_id}-${item.studentId || item.student_id || regId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      normalized.push({
        regId: regId,
        eventId: parseInt(item.eventId || item.event_id || 1, 10),
        eventTitle: item.eventTitle || item.title || "Campus Event",
        eventCategory: item.eventCategory || item.category || "General",
        eventDate: item.eventDate || (item.start_datetime ? new Date(item.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Thursday, Nov 12, 2026"),
        eventTime: item.eventTime || "10:00 AM – 04:00 PM",
        eventVenue: item.eventVenue || item.venue || "Main University Auditorium",
        studentName: item.studentName || item.student_name || "Student",
        studentId: item.studentId || item.student_id || "CS2026042",
        department: item.department || "Computer Science & Engineering",
        email: item.email || "",
        phone: item.phone || ""
      });
    }

    return normalized;
  } catch (e) {
    return [];
  }
}

function saveRegistrations(regs) {
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(regs));
  const unified = regs.map(r => ({
    registration_id: Date.now() + Math.random(),
    event_id: r.eventId,
    title: r.eventTitle,
    category: r.eventCategory,
    student_name: r.studentName,
    student_id: r.studentId,
    start_datetime: r.eventDate,
    venue: r.eventVenue,
    ticket_code: r.regId,
    status: 'confirmed'
  }));
  localStorage.setItem("campusconnect_registrations", JSON.stringify(unified));
  updatePassBadges();
}

function getSavedBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) || [];
  } catch (e) {
    return [];
  }
}

function saveBookmarks(bmarks) {
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bmarks));
}

// ============================================================================
// 3. TOAST NOTIFICATION ENGINE
// ============================================================================
function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconHtml = '<i class="fa-solid fa-circle-info"></i>';
  if (type === "success") iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  if (type === "error") iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';

  toast.innerHTML = `
    ${iconHtml}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideToastOut 0.3s forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// ============================================================================
// 4. CANVAS CONFETTI ENGINE (Pure Vanilla JS celebration on ticket generation)
// ============================================================================
function triggerConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const numberOfPieces = 110;
  const colors = ["#ff0080", "#7928ca", "#06b6d4", "#10b981", "#fbbf24", "#3b82f6"];

  for (let i = 0; i < numberOfPieces; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 3,
      speedX: Math.random() * 3 - 1.5,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 8 - 4
    });
  }

  let animationFrameId;
  const startTime = performance.now();
  const duration = 3500; // ms

  function animate(now) {
    const elapsed = now - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();

      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
    });

    if (elapsed < duration) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrameId);
    }
  }

  requestAnimationFrame(animate);
}

// ============================================================================
// 5. HERO SPOTLIGHT CAROUSEL & LIVE COUNTDOWN
// ============================================================================
function initHeroCarousel() {
  renderFeaturedSlide(currentFeaturedSlide);
  startLiveCountdown();

  const prevBtn = document.getElementById("hero-prev-btn");
  const nextBtn = document.getElementById("hero-next-btn");
  const dots = document.querySelectorAll("#hero-carousel-dots .dot");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentFeaturedSlide = (currentFeaturedSlide - 1 + featuredEventsList.length) % featuredEventsList.length;
      renderFeaturedSlide(currentFeaturedSlide);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentFeaturedSlide = (currentFeaturedSlide + 1) % featuredEventsList.length;
      renderFeaturedSlide(currentFeaturedSlide);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", (e) => {
      const slideIdx = parseInt(e.target.getAttribute("data-slide"), 10);
      if (!isNaN(slideIdx)) {
        currentFeaturedSlide = slideIdx;
        renderFeaturedSlide(currentFeaturedSlide);
      }
    });
  });

  // Auto rotate every 6.5 seconds
  setInterval(() => {
    currentFeaturedSlide = (currentFeaturedSlide + 1) % featuredEventsList.length;
    renderFeaturedSlide(currentFeaturedSlide);
  }, 6500);
}

function renderFeaturedSlide(index) {
  const container = document.getElementById("featured-card-content");
  const counter = document.getElementById("hero-slide-counter");
  const dots = document.querySelectorAll("#hero-carousel-dots .dot");

  if (!container || !featuredEventsList[index]) return;

  const event = featuredEventsList[index];

  container.innerHTML = `
    <div class="featured-slide">
      <div class="featured-img-wrap">
        <img src="${event.image}" alt="${event.title}">
        <span class="featured-badge-overlay"><i class="fa-solid fa-tag"></i> ${event.category}</span>
        <span class="featured-date-pill"><i class="fa-regular fa-calendar"></i> ${event.month} ${event.day}</span>
      </div>

      <div class="featured-info">
        <h3>${event.title}</h3>
        <div class="featured-meta">
          <span><i class="fa-regular fa-clock text-pink"></i> ${event.time}</span>
          <span><i class="fa-solid fa-location-dot text-purple"></i> ${event.venue}</span>
        </div>
        <p class="featured-desc">${event.description}</p>
        
        <div class="featured-actions">
          <button class="btn btn-primary btn-glow" onclick="openRegistrationForEvent(${event.id})">
            <i class="fa-solid fa-ticket"></i> Register Free
          </button>
          <button class="btn btn-glass" onclick="openEventDetails(${event.id})">
            <i class="fa-solid fa-circle-info"></i> Details
          </button>
          <button class="btn btn-subtle" onclick="shareEvent(${event.id})" title="Copy Event Link">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  if (counter) {
    counter.textContent = `${index + 1} / ${featuredEventsList.length}`;
  }

  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === index);
  });
}

function startLiveCountdown() {
  const targetDate = new Date("2026-11-12T09:30:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    let difference = targetDate - now;

    // Fallback if target has passed: show demo static countdown
    if (difference <= 0) {
      difference = 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000 + 42 * 60 * 1000;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const dEl = document.getElementById("cd-days");
    const hEl = document.getElementById("cd-hours");
    const mEl = document.getElementById("cd-mins");
    const sEl = document.getElementById("cd-secs");

    if (dEl) dEl.textContent = String(days).padStart(2, "0");
    if (hEl) hEl.textContent = String(hours).padStart(2, "0");
    if (mEl) mEl.textContent = String(minutes).padStart(2, "0");
    if (sEl) sEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ============================================================================
// 6. EVENT CARDS RENDERING & GRID MANAGEMENT
// ============================================================================
function updateDynamicCounts() {
  // Update category cards counts
  const categories = ["Technology", "Cultural", "Coding", "Sports", "Creative", "Business"];
  categories.forEach(cat => {
    const count = campusEvents.filter(e => e.category === cat).length;
    const catCardCount = document.getElementById(`count-cat-${cat}`);
    const pillCount = document.getElementById(`pill-count-${cat}`);
    if (catCardCount) catCardCount.textContent = `${count} Active Event${count === 1 ? '' : 's'}`;
    if (pillCount) pillCount.textContent = count;
  });

  const allCountEl = document.getElementById("count-all");
  if (allCountEl) allCountEl.textContent = campusEvents.length;
}

function getFilteredAndSortedEvents() {
  let list = [...campusEvents];

  // 1. Category Filter
  if (activeCategory !== "all") {
    list = list.filter(e => e.category.toLowerCase() === activeCategory.toLowerCase());
  }

  // 2. Search Query Filter
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(e => 
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.organizer.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }

  // 3. Sorting
  if (sortMode === "date-asc") {
    list.sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));
  } else if (sortMode === "date-desc") {
    list.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
  } else if (sortMode === "popular") {
    list.sort((a, b) => (b.seatsRegistered / b.seatsTotal) - (a.seatsRegistered / a.seatsTotal));
  } else if (sortMode === "name-asc") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return list;
}

function renderEventsGrid() {
  const grid = document.getElementById("events-grid");
  const emptyState = document.getElementById("empty-state");
  const indicator = document.getElementById("active-filter-indicator");
  const indicatorText = document.getElementById("filter-indicator-text");

  const eventsToDisplay = getFilteredAndSortedEvents();
  const bookmarks = getSavedBookmarks();

  // Active Filter Banner
  if (indicator && indicatorText) {
    if (activeCategory !== "all" || searchQuery.trim() !== "") {
      indicator.classList.remove("d-none");
      let text = `Showing ${eventsToDisplay.length} event${eventsToDisplay.length === 1 ? '' : 's'}`;
      if (activeCategory !== "all") text += ` in "${activeCategory}"`;
      if (searchQuery.trim() !== "") text += ` matching "${searchQuery}"`;
      indicatorText.textContent = text;
    } else {
      indicator.classList.add("d-none");
    }
  }

  if (!grid) return;

  if (eventsToDisplay.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("d-none");
    return;
  }

  if (emptyState) emptyState.classList.add("d-none");

  grid.innerHTML = eventsToDisplay.map(event => {
    const isBookmarked = bookmarks.includes(event.id);
    const capacityPct = Math.round((event.seatsRegistered / event.seatsTotal) * 100);
    const seatsRemaining = event.seatsTotal - event.seatsRegistered;

    // Capacity color class
    let capColorClass = "cap-normal";
    if (capacityPct >= 90) capColorClass = "cap-danger";
    else if (capacityPct >= 70) capColorClass = "cap-warning";

    return `
      <article class="event-card" data-id="${event.id}">
        
        <!-- Media / Header with Date Badge -->
        <div class="event-card-media">
          <img src="${event.image}" alt="${event.title}" loading="lazy">
          
          <!-- Month & Day badge styled like reference screenshot -->
          <div class="date-badge">
            <span class="month">${event.month}</span>
            <span class="day">${event.day}</span>
          </div>

          <span class="event-category-chip">${event.category}</span>

          <div class="card-top-actions">
            <button class="action-icon-btn ${isBookmarked ? 'bookmarked' : ''}" 
                    onclick="toggleBookmark(${event.id})" 
                    title="${isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}" 
                    aria-label="Bookmark event">
              <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
            </button>
            <button class="action-icon-btn" 
                    onclick="shareEvent(${event.id})" 
                    title="Share Event" 
                    aria-label="Share event">
              <i class="fa-solid fa-share-nodes"></i>
            </button>
          </div>
        </div>

        <!-- Body & Details -->
        <div class="event-card-body">
          
          <!-- Dynamic Capacity Tracker -->
          <div class="capacity-tracker">
            <div class="capacity-info">
              <span class="status-badge text-purple"><i class="fa-solid fa-circle-dot"></i> Seats Open</span>
              <span class="seats-left">${seatsRemaining} left (${capacityPct}% filled)</span>
            </div>
            <div class="capacity-bar">
              <div class="capacity-progress ${capColorClass}" style="width: ${capacityPct}%"></div>
            </div>
          </div>

          <h3 class="event-title">${event.title}</h3>

          <div class="event-meta-list">
            <div class="event-meta-item">
              <i class="fa-regular fa-clock"></i>
              <span>${event.time}</span>
            </div>
            <div class="event-meta-item">
              <i class="fa-solid fa-location-dot"></i>
              <span>${event.venue}</span>
            </div>
            <div class="event-meta-item">
              <i class="fa-solid fa-users"></i>
              <span>${event.organizer}</span>
            </div>
          </div>

          <!-- Event Perk Chips -->
          <div class="event-perk-chips">
            ${event.perks ? event.perks.map(p => `<span class="perk-chip"><i class="fa-solid fa-check text-purple"></i> ${p}</span>`).join('') : ''}
          </div>

          <p class="event-description-snippet">${event.description}</p>

          <!-- Action Buttons -->
          <div class="event-card-footer">
            <button class="btn btn-secondary" onclick="openEventDetails(${event.id})">
              <i class="fa-solid fa-eye"></i> Details
            </button>
            <button class="btn btn-primary" onclick="openRegistrationForEvent(${event.id})">
              <i class="fa-solid fa-ticket"></i> Register
            </button>
          </div>

        </div>

      </article>
    `;
  }).join("");
}

// ============================================================================
// 7. SHARE & BOOKMARK EVENT ACTIONS
// ============================================================================
function shareEvent(eventId) {
  const event = campusEvents.find(e => e.id === eventId);
  if (!event) return;

  const url = `${window.location.origin}${window.location.pathname}#event-${eventId}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast(`🔗 Link copied to clipboard for "${event.title}"!`, "success");
    }).catch(() => {
      showToast(`Event: "${event.title}" (${event.dateFull})`, "info");
    });
  } else {
    showToast(`Event: "${event.title}" (${event.dateFull})`, "info");
  }
}

function toggleBookmark(eventId) {
  let bookmarks = getSavedBookmarks();
  const event = campusEvents.find(e => e.id === eventId);
  const title = event ? event.title : "Event";

  if (bookmarks.includes(eventId)) {
    bookmarks = bookmarks.filter(id => id !== eventId);
    showToast(`Removed "${title}" from your bookmarks`, "info");
  } else {
    bookmarks.push(eventId);
    showToast(`Bookmarked "${title}"! View anytime.`, "success");
  }

  saveBookmarks(bookmarks);
  renderEventsGrid();
}

// ============================================================================
// 8. EVENT DETAILS MODAL
// ============================================================================
function openEventDetails(eventId) {
  const event = campusEvents.find(e => e.id === eventId);
  if (!event) return;

  const modal = document.getElementById("event-details-modal");
  const modalBody = document.getElementById("details-modal-body");
  if (!modal || !modalBody) return;

  const capacityPct = Math.round((event.seatsRegistered / event.seatsTotal) * 100);

  modalBody.innerHTML = `
    <div class="details-hero">
      <img src="${event.image}" alt="${event.title}">
      <span class="details-category">${event.category}</span>
    </div>

    <h2 class="details-title">${event.title}</h2>

    <div class="details-meta-grid">
      <div class="details-meta-item">
        <i class="fa-regular fa-calendar-days"></i>
        <div>
          <strong>Date:</strong><br>
          <span>${event.dateFull}</span>
        </div>
      </div>
      <div class="details-meta-item">
        <i class="fa-regular fa-clock"></i>
        <div>
          <strong>Timing:</strong><br>
          <span>${event.time}</span>
        </div>
      </div>
      <div class="details-meta-item">
        <i class="fa-solid fa-location-dot"></i>
        <div>
          <strong>Venue:</strong><br>
          <span>${event.venue}</span>
        </div>
      </div>
      <div class="details-meta-item">
        <i class="fa-solid fa-users-gear"></i>
        <div>
          <strong>Host Organization:</strong><br>
          <span>${event.organizer}</span>
        </div>
      </div>
    </div>

    <h4 class="details-desc-title">Event Overview & Agenda</h4>
    <p class="details-desc">${event.description}</p>

    <div class="capacity-tracker mb-3">
      <div class="capacity-info">
        <span class="status-badge text-purple"><i class="fa-solid fa-circle-check"></i> Registration Open</span>
        <span class="seats-left">${event.seatsTotal - event.seatsRegistered} seats remaining of ${event.seatsTotal} total</span>
      </div>
      <div class="capacity-bar">
        <div class="capacity-progress cap-normal" style="width: ${capacityPct}%"></div>
      </div>
    </div>

    <div class="details-actions">
      <button class="btn btn-primary btn-large btn-glow w-100" onclick="closeDetailsModal(); openRegistrationForEvent(${event.id});">
        <i class="fa-solid fa-ticket"></i> Proceed to Free Registration
      </button>
      <button class="btn btn-secondary" onclick="shareEvent(${event.id})">
        <i class="fa-solid fa-share-nodes"></i> Share
      </button>
    </div>
  `;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDetailsModal() {
  const modal = document.getElementById("event-details-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ============================================================================
// 9. REGISTRATION FORM HANDLING, REAL-TIME VALIDATION & AUTO-FILL
// ============================================================================
function populateEventDropdown() {
  const select = document.getElementById("reg-event");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Choose an event from the list --</option>' + 
    campusEvents.map(e => `
      <option value="${e.id}">${e.title} (${e.month} ${e.day})</option>
    `).join("");

  if (currentVal) select.value = currentVal;
}

function openRegistrationForEvent(eventId) {
  const select = document.getElementById("reg-event");
  if (select) {
    select.value = eventId;
    clearFieldError("reg-event", "err-event");
  }

  const regSection = document.getElementById("register");
  if (regSection) {
    regSection.scrollIntoView({ behavior: "smooth" });
  }

  // Highlight form
  const formPanel = document.querySelector(".register-form-panel");
  if (formPanel) {
    formPanel.style.transition = "box-shadow 0.5s ease";
    formPanel.style.boxShadow = "0 0 30px rgba(121, 40, 202, 0.4)";
    setTimeout(() => {
      formPanel.style.boxShadow = "";
    }, 1800);
  }
}

// Real-Time Inline Input Listeners
function initRealtimeValidation() {
  const nameInput = document.getElementById("reg-name");
  const idInput = document.getElementById("reg-id");
  const deptInput = document.getElementById("reg-dept");
  const emailInput = document.getElementById("reg-email");
  const phoneInput = document.getElementById("reg-phone");
  const eventInput = document.getElementById("reg-event");

  if (nameInput) {
    nameInput.addEventListener("input", () => {
      if (nameInput.value.trim().length >= 3) clearFieldError("reg-name", "err-name");
    });
  }

  if (idInput) {
    idInput.addEventListener("input", () => {
      if (idInput.value.trim().length >= 4) clearFieldError("reg-id", "err-id");
    });
  }

  if (deptInput) {
    deptInput.addEventListener("change", () => {
      if (deptInput.value) clearFieldError("reg-dept", "err-dept");
    });
  }

  if (emailInput) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailInput.addEventListener("input", () => {
      if (emailRegex.test(emailInput.value.trim())) clearFieldError("reg-email", "err-email");
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const digits = phoneInput.value.replace(/\D/g, "");
      if (digits.length >= 10) clearFieldError("reg-phone", "err-phone");
    });
  }

  if (eventInput) {
    eventInput.addEventListener("change", () => {
      if (eventInput.value) clearFieldError("reg-event", "err-event");
    });
  }

  // Quick Demo Auto-Fill Button Handler
  const demoFillBtn = document.getElementById("btn-demo-fill");
  if (demoFillBtn) {
    demoFillBtn.addEventListener("click", () => {
      if (nameInput) nameInput.value = "Alex Morgan";
      if (idInput) idInput.value = "CS2024101";
      if (deptInput) deptInput.value = "Computer Science & Engineering";
      if (emailInput) emailInput.value = "alex.morgan@campus.edu";
      if (phoneInput) phoneInput.value = "9876543210";
      if (eventInput) eventInput.value = "1"; // TechFest
      
      const teamInput = document.getElementById("reg-team");
      if (teamInput) teamInput.value = "Quantum Coders";

      // Mark all fields as valid
      ["reg-name", "reg-id", "reg-email", "reg-phone"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.remove("is-invalid");
          el.classList.add("is-valid");
        }
      });

      showToast("⚡ Auto-filled sample student data for quick demonstration!", "success");
    });
  }
}

function handleRegistrationSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById("reg-name");
  const idInput = document.getElementById("reg-id");
  const deptInput = document.getElementById("reg-dept");
  const emailInput = document.getElementById("reg-email");
  const phoneInput = document.getElementById("reg-phone");
  const eventInput = document.getElementById("reg-event");
  const yearInput = document.getElementById("reg-year");
  const teamInput = document.getElementById("reg-team");
  const termsInput = document.getElementById("reg-terms");

  let isValid = true;

  // Validation: Name (>= 3 chars)
  if (!nameInput.value || nameInput.value.trim().length < 3) {
    showFieldError("reg-name", "err-name");
    isValid = false;
  } else {
    clearFieldError("reg-name", "err-name");
  }

  // Validation: Student ID (>= 4 chars)
  if (!idInput.value || idInput.value.trim().length < 4) {
    showFieldError("reg-id", "err-id");
    isValid = false;
  } else {
    clearFieldError("reg-id", "err-id");
  }

  // Validation: Department
  if (!deptInput.value) {
    showFieldError("reg-dept", "err-dept");
    isValid = false;
  } else {
    clearFieldError("reg-dept", "err-dept");
  }

  // Validation: Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput.value || !emailRegex.test(emailInput.value.trim())) {
    showFieldError("reg-email", "err-email");
    isValid = false;
  } else {
    clearFieldError("reg-email", "err-email");
  }

  // Validation: Phone (10 digits)
  const phoneDigits = phoneInput.value.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    showFieldError("reg-phone", "err-phone");
    isValid = false;
  } else {
    clearFieldError("reg-phone", "err-phone");
  }

  // Validation: Event Selection
  if (!eventInput.value) {
    showFieldError("reg-event", "err-event");
    isValid = false;
  } else {
    clearFieldError("reg-event", "err-event");
  }

  // Validation: Terms
  if (!termsInput.checked) {
    document.getElementById("err-terms").classList.add("visible");
    isValid = false;
  } else {
    document.getElementById("err-terms").classList.remove("visible");
  }

  if (!isValid) {
    showToast("Please review the highlighted required fields.", "error");
    return;
  }

  const selectedEventId = parseInt(eventInput.value, 10);
  const selectedEvent = campusEvents.find(e => e.id === selectedEventId);
  const studentId = idInput.value.trim().toUpperCase();

  // Check duplicate registration in localStorage
  const existingRegistrations = getSavedRegistrations();
  const alreadyRegistered = existingRegistrations.some(
    r => r.studentId === studentId && r.eventId === selectedEventId
  );

  if (alreadyRegistered) {
    showToast(`You have already registered Student ID ${studentId} for "${selectedEvent.title}"!`, "error");
    return;
  }

  // Generate unique pass number
  const regId = "CC-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);

  const newRegistration = {
    regId: regId,
    eventId: selectedEventId,
    eventTitle: selectedEvent.title,
    eventCategory: selectedEvent.category,
    eventDate: selectedEvent.dateFull,
    eventTime: selectedEvent.time,
    eventVenue: selectedEvent.venue,
    studentName: nameInput.value.trim(),
    studentId: studentId,
    department: deptInput.value,
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    year: yearInput ? yearInput.value : "4th Year",
    teamName: teamInput ? teamInput.value.trim() : "",
    registeredAt: new Date().toISOString()
  };

  existingRegistrations.push(newRegistration);
  saveRegistrations(existingRegistrations);

  // Increment simulated seat count
  selectedEvent.seatsRegistered += 1;
  renderEventsGrid();

  // Trigger celebration confetti
  triggerConfetti();

  // Clear form
  document.getElementById("registration-form").reset();
  document.querySelectorAll(".input-icon-wrapper input").forEach(el => el.classList.remove("is-valid"));

  showToast("🎉 Registration confirmed! Your digital entry pass has been generated.", "success");

  // Display the Digital Entry Pass Ticket Modal
  showTicketModal(newRegistration);
}

function showFieldError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (input) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
  }
  if (err) err.classList.add("visible");
}

function clearFieldError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }
  if (err) err.classList.remove("visible");
}

// ============================================================================
// 10. DIGITAL ENTRY PASS / TICKET MODAL
// ============================================================================
function showTicketModal(regData) {
  const modal = document.getElementById("ticket-pass-modal");
  if (!modal) return;

  const titleEl = document.getElementById("ticket-event-name");
  const nameEl = document.getElementById("ticket-student-name");
  const idEl = document.getElementById("ticket-student-id");
  const deptEl = document.getElementById("ticket-department");
  const passEl = document.getElementById("ticket-pass-id");
  const dtEl = document.getElementById("ticket-datetime") || document.getElementById("ticket-date");
  const venueEl = document.getElementById("ticket-venue");
  const barcodeEl = document.getElementById("ticket-barcode-num") || document.getElementById("ticket-barcode-text");
  const catBadge = document.getElementById("ticket-category-badge");

  if (titleEl) titleEl.textContent = regData.eventTitle || regData.title || "TechFest 2026: Quantum Leap";
  if (nameEl) nameEl.textContent = regData.studentName || regData.student_name || "Alex Morgan";
  if (idEl) idEl.textContent = regData.studentId || regData.student_id || "CS2026042";
  if (deptEl) deptEl.textContent = regData.department || "Computer Science & Engineering";
  if (passEl) passEl.textContent = regData.regId || regData.ticket_code || "CC-2026-8942";
  if (dtEl) dtEl.textContent = `${regData.eventDate || "Nov 12, 2026"} ${regData.eventTime ? "• " + regData.eventTime : ""}`.trim();
  if (venueEl) venueEl.textContent = regData.eventVenue || regData.venue || "Dr. APJ Abdul Kalam Auditorium";
  if (barcodeEl) barcodeEl.textContent = `PASS-${regData.regId || regData.ticket_code || "CC-2026-0042"}`;
  if (catBadge) catBadge.textContent = regData.eventCategory || regData.category || "Technology";

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

window.showTicketModal = showTicketModal;

function closeTicketModal() {
  const modal = document.getElementById("ticket-pass-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ============================================================================
// 11. "MY REGISTERED PASSES" MODAL
// ============================================================================
function openMyTicketsModal() {
  const modal = document.getElementById("my-tickets-modal");
  const listEl = document.getElementById("my-tickets-list");
  if (!modal || !listEl) return;

  const regs = getSavedRegistrations();

  if (regs.length === 0) {
    listEl.innerHTML = `
      <div class="text-center" style="padding: 2.5rem 1rem;">
        <i class="fa-solid fa-ticket text-muted" style="font-size: 2.85rem; margin-bottom: 0.85rem;"></i>
        <h4 style="color: var(--text-dark); margin-bottom: 0.35rem;">No Active Passes Found</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 380px; margin: 0 auto;">You have not registered for any campus events on this device yet. Explore upcoming fests and claim your free pass!</p>
      </div>
    `;
  } else {
    listEl.innerHTML = regs.map((reg, idx) => `
      <div class="my-ticket-card">
        <div class="my-ticket-info">
          <h4>${reg.eventTitle}</h4>
          <p><i class="fa-regular fa-calendar"></i> ${reg.eventDate} • ${reg.eventTime}</p>
          <p><i class="fa-solid fa-id-badge text-purple"></i> Pass ID: <strong>${reg.regId}</strong> (${reg.studentName})</p>
        </div>
        <div class="my-ticket-btns">
          <button class="btn btn-sm btn-primary" onclick="viewSavedPass(${idx})">
            <i class="fa-solid fa-qrcode"></i> View
          </button>
          <button class="btn btn-sm btn-secondary" onclick="cancelRegistration(${idx})" title="Cancel pass and release seat">
            <i class="fa-solid fa-trash-can text-accent"></i>
          </button>
        </div>
      </div>
    `).join("");
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeMyTicketsModal() {
  const modal = document.getElementById("my-tickets-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function viewSavedPass(index) {
  const regs = getSavedRegistrations();
  if (regs[index]) {
    closeMyTicketsModal();
    showTicketModal(regs[index]);
  }
}

function cancelRegistration(index) {
  let regs = getSavedRegistrations();
  if (!regs[index]) return;

  const canceled = regs[index];
  if (confirm(`Are you sure you want to cancel your pass for "${canceled.eventTitle}"?`)) {
    const event = campusEvents.find(e => e.id === canceled.eventId);
    if (event && event.seatsRegistered > 0) {
      event.seatsRegistered -= 1;
      renderEventsGrid();
    }

    regs.splice(index, 1);
    saveRegistrations(regs);
    showToast(`Pass ${canceled.regId} cancelled and seat released.`, "info");
    openMyTicketsModal();
  }
}

function updatePassBadges() {
  const count = getSavedRegistrations().length;
  const headerBadge = document.getElementById("registered-badge");
  const mobileBadge = document.getElementById("mobile-badge");

  if (headerBadge) headerBadge.textContent = count;
  if (mobileBadge) mobileBadge.textContent = count;
}

// ============================================================================
// 12. "HOST AN EVENT" PROPOSAL MODAL
// ============================================================================
function initHostEventModal() {
  const modal = document.getElementById("host-event-modal");
  const openHeroBtn = document.getElementById("hero-host-btn");
  const closeBtn = document.getElementById("close-host-modal");
  const form = document.getElementById("host-event-form");

  if (openHeroBtn && modal) {
    openHeroBtn.addEventListener("click", () => {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const clubName = document.getElementById("host-club-name").value.trim();
      const title = document.getElementById("host-event-title").value.trim();
      const category = document.getElementById("host-category").value;
      const capacity = document.getElementById("host-capacity").value;
      const desc = document.getElementById("host-desc").value.trim();

      if (!clubName || !title) {
        showToast("Please provide club name and event title.", "error");
        return;
      }

      let proposals = [];
      try {
        proposals = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROPOSALS)) || [];
      } catch (err) {
        proposals = [];
      }

      proposals.push({
        clubName,
        title,
        category,
        capacity,
        desc,
        submittedAt: new Date().toISOString()
      });

      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));

      form.reset();
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      showToast("🎉 Event proposal submitted for faculty advisor review!", "success");
    });
  }
}

// ============================================================================
// 13. FAQ ACCORDION INTERACTIVITY
// ============================================================================
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isCurrentlyActive = item.classList.contains("active");

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const btn = otherItem.querySelector(".faq-question");
          if (btn) btn.setAttribute("aria-expanded", "false");
        }
      });

      if (isCurrentlyActive) {
        item.classList.remove("active");
        questionBtn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        questionBtn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// ============================================================================
// 14. ANIMATED STATISTICS COUNTERS (Intersection Observer)
// ============================================================================
function initStatsCounters() {
  const statsSection = document.getElementById("stats-section");
  const counters = document.querySelectorAll(".stat-counter");
  if (!statsSection || counters.length === 0) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute("data-target"), 10);
          const duration = 1800;
          const startTimestamp = performance.now();

          function step(now) {
            const progress = Math.min((now - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * target);
            counter.textContent = currentVal.toLocaleString();

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              counter.textContent = target.toLocaleString();
            }
          }

          requestAnimationFrame(step);
        });
      }
    });
  }, { threshold: 0.35 });

  observer.observe(statsSection);
}

// ============================================================================
// 15. QUICK FILTER BAR & CATEGORY TILES INTEGRATION
// ============================================================================
function initQuickFilters() {
  const quickBtn = document.getElementById("quick-filter-btn");
  const dateSel = document.getElementById("quick-date-select");
  const deptSel = document.getElementById("quick-dept-select");
  const catSel = document.getElementById("quick-cat-select");

  if (quickBtn) {
    quickBtn.addEventListener("click", () => {
      const selectedCat = catSel ? catSel.value : "all";
      const selectedDept = deptSel ? deptSel.value : "all";
      const selectedMonth = dateSel ? dateSel.value : "all";

      // Apply category
      filterByCategory(selectedCat);

      // Apply department / month search keyword
      if (selectedDept !== "all" || selectedMonth !== "all") {
        let terms = [];
        if (selectedDept !== "all") terms.push(selectedDept);
        if (selectedMonth !== "all") terms.push(selectedMonth);
        searchQuery = terms.join(" ");

        const searchInput = document.getElementById("event-search-input");
        if (searchInput) searchInput.value = searchQuery;
      }

      renderEventsGrid();

      // Smooth scroll to events section
      const eventsEl = document.getElementById("events");
      if (eventsEl) {
        eventsEl.scrollIntoView({ behavior: "smooth" });
      }

      showToast(`Showing filtered events for: ${selectedCat !== 'all' ? selectedCat : 'All Categories'}`, "info");
    });
  }

  // Category Cards Click Handlers
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.getAttribute("data-category");
      if (cat) {
        filterByCategory(cat);
        const eventsEl = document.getElementById("events");
        if (eventsEl) {
          eventsEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    });

    // Keyboard enter support
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });
}

function filterByCategory(categoryName) {
  activeCategory = categoryName;

  // Update category pills state
  const pills = document.querySelectorAll(".cat-pill");
  pills.forEach(pill => {
    const filter = pill.getAttribute("data-filter");
    if (filter === categoryName) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });

  // Update category card active highlight
  const cards = document.querySelectorAll(".category-card");
  cards.forEach(card => {
    const cardCat = card.getAttribute("data-category");
    if (cardCat === categoryName) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });

  renderEventsGrid();
}

// ============================================================================
// 16. NAVIGATION, SCROLL PROGRESS & SCROLL SPY
// ============================================================================
function initNavigationAndScroll() {
  const header = document.getElementById("main-header");
  const mobileToggle = document.getElementById("mobile-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const backToTopBtn = document.getElementById("back-to-top");
  const progressBar = document.getElementById("scroll-progress");

  // Sticky header, reading progress & scroll spy
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar
    if (progressBar && docHeight > 0) {
      const progress = (scrollY / docHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }

    // Sticky header
    if (scrollY > 40) {
      if (header) header.classList.add("scrolled");
    } else {
      if (header) header.classList.remove("scrolled");
    }

    // Back to top
    if (scrollY > 450) {
      if (backToTopBtn) backToTopBtn.classList.add("visible");
    } else {
      if (backToTopBtn) backToTopBtn.classList.remove("visible");
    }

    // Scroll spy for active nav link
    const sections = ["home", "events", "categories", "about", "faq", "contact"];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.offsetTop - 120;
        const bottom = top + el.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      }
    });
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Mobile menu toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileDrawer.classList.contains("open");
      mobileToggle.classList.toggle("active");
      mobileDrawer.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileDrawer.setAttribute("aria-hidden", String(isOpen));
    });

    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("active");
        mobileDrawer.classList.remove("open");
        mobileToggle.setAttribute("aria-expanded", "false");
        mobileDrawer.setAttribute("aria-hidden", "true");
      });
    });
  }

  // Search input handling
  const searchInput = document.getElementById("event-search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle("d-none", searchQuery.trim().length === 0);
      }
      renderEventsGrid();
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchQuery = "";
      clearSearchBtn.classList.add("d-none");
      renderEventsGrid();
    });
  }

  // Indicator clear button
  const indicatorClearBtn = document.getElementById("btn-indicator-clear");
  if (indicatorClearBtn) {
    indicatorClearBtn.addEventListener("click", () => {
      resetAllFilters();
    });
  }

  // Header Nav Search
  const navSearchInput = document.getElementById("nav-search-input");
  if (navSearchInput) {
    navSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        searchQuery = navSearchInput.value;
        const eventsEl = document.getElementById("events");
        if (eventsEl) eventsEl.scrollIntoView({ behavior: "smooth" });
        if (searchInput) searchInput.value = searchQuery;
        renderEventsGrid();
      }
    });
  }

  // Ctrl+K Shortcut for Global Search
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (navSearchInput && window.innerWidth > 992) {
        navSearchInput.focus();
      } else if (searchInput) {
        searchInput.focus();
        document.getElementById("events").scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  // Sort Select
  const sortSelect = document.getElementById("event-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortMode = e.target.value;
      renderEventsGrid();
    });
  }

  // Reset Filters Functionality
  const resetBtn = document.getElementById("btn-reset-filters");
  const emptyResetBtn = document.getElementById("btn-empty-reset");

  function resetAllFilters() {
    activeCategory = "all";
    searchQuery = "";
    sortMode = "date-asc";

    if (searchInput) searchInput.value = "";
    if (navSearchInput) navSearchInput.value = "";
    if (clearSearchBtn) clearSearchBtn.classList.add("d-none");
    if (sortSelect) sortSelect.value = "date-asc";

    filterByCategory("all");
    showToast("All filters and searches have been reset.", "info");
  }

  if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener("click", resetAllFilters);

  // Category Pills
  const catPills = document.querySelectorAll(".cat-pill:not(.btn-clear-all-filters)");
  catPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const filter = pill.getAttribute("data-filter");
      if (filter) filterByCategory(filter);
    });
  });

  // Newsletter Form
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletter-email");
      if (emailInput && emailInput.value) {
        showToast(`Subscribed! Weekly digest will arrive at ${emailInput.value}`, "success");
        emailInput.value = "";
      }
    });
  }
}

// ============================================================================
// 17. MODAL LISTENERS & INITIALIZATION
// ============================================================================
function initModals() {
  // Details Modal
  const closeDetailsBtn = document.getElementById("close-details-modal");
  const detailsModal = document.getElementById("event-details-modal");
  if (closeDetailsBtn) closeDetailsBtn.addEventListener("click", closeDetailsModal);
  if (detailsModal) {
    detailsModal.addEventListener("click", (e) => {
      if (e.target === detailsModal) closeDetailsModal();
    });
  }

  // Ticket Modal
  const closeTicketBtn = document.getElementById("close-ticket-modal");
  const doneTicketBtn = document.getElementById("btn-done-ticket");
  const printTicketBtn = document.getElementById("btn-print-ticket");
  const downloadTicketBtn = document.getElementById("btn-download-ticket");
  const ticketModal = document.getElementById("ticket-pass-modal");

  if (closeTicketBtn) closeTicketBtn.addEventListener("click", closeTicketModal);
  if (doneTicketBtn) doneTicketBtn.addEventListener("click", closeTicketModal);

  if (printTicketBtn) {
    printTicketBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (downloadTicketBtn) {
    downloadTicketBtn.addEventListener("click", () => {
      showToast("📥 Digital Pass saved! Ready for gate presentation.", "success");
    });
  }

  if (ticketModal) {
    ticketModal.addEventListener("click", (e) => {
      if (e.target === ticketModal) closeTicketModal();
    });
  }

  // My Passes Modal
  const viewTicketsBtn = document.getElementById("btn-view-tickets");
  const mobileTicketsBtn = document.getElementById("mobile-my-tickets-btn");
  const closeMyTicketsBtn = document.getElementById("close-my-tickets-modal");
  const btnCloseMyTickets = document.getElementById("btn-close-my-tickets");
  const myTicketsModal = document.getElementById("my-tickets-modal");

  if (viewTicketsBtn) viewTicketsBtn.addEventListener("click", openMyTicketsModal);
  if (mobileTicketsBtn) {
    mobileTicketsBtn.addEventListener("click", () => {
      document.getElementById("mobile-toggle").classList.remove("active");
      document.getElementById("mobile-drawer").classList.remove("open");
      openMyTicketsModal();
    });
  }

  if (closeMyTicketsBtn) closeMyTicketsBtn.addEventListener("click", closeMyTicketsModal);
  if (btnCloseMyTickets) btnCloseMyTickets.addEventListener("click", closeMyTicketsModal);

  if (myTicketsModal) {
    myTicketsModal.addEventListener("click", (e) => {
      if (e.target === myTicketsModal) closeMyTicketsModal();
    });
  }

  // Escape key closes open modals
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDetailsModal();
      closeTicketModal();
      closeMyTicketsModal();
      const hostModal = document.getElementById("host-event-modal");
      if (hostModal) {
        hostModal.classList.remove("open");
        document.body.style.overflow = "";
      }
    }
  });
}

// ============================================================================
// 18. APP ENTRY POINT
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Event Data & Dynamic Badges
  populateEventDropdown();
  updateDynamicCounts();
  renderEventsGrid();
  updatePassBadges();

  // 2. Initialize Components & Interactivity
  initHeroCarousel();
  initQuickFilters();
  initNavigationAndScroll();
  initRealtimeValidation();
  initFaqAccordion();
  initStatsCounters();
  initHostEventModal();
  initModals();

  // 3. Attach Form Submit Handler
  const regForm = document.getElementById("registration-form");
  if (regForm) {
    regForm.addEventListener("submit", handleRegistrationSubmit);
  }

  // Greeting toast
  setTimeout(() => {
    showToast("Welcome to CampusConnect! Discover & register for campus events.", "info", 4000);
  }, 1000);
});
