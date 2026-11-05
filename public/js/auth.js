/**
 * CampusConnect — Authentication Client Logic (auth.js)
 * Handles client-side validation, show/hide password, login/signup API submission,
 * loading states, friendly errors, and demo auto-fill helpers.
 */

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggles();
  setupLoginForm();
  setupSignupForm();
  setupForgotPasswordModal();
  setupDemoFillButtons();
});

// ============================================================================
// 1. SHOW / HIDE PASSWORD FUNCTIONALITY
// ============================================================================
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.btn-toggle-password');
  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const icon = btn.querySelector('i');
      if (icon) {
        if (isPassword) {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      }
    });
  });
}

// ============================================================================
// 2. LOGIN FORM HANDLER
// ============================================================================
function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const alertBox = document.getElementById('login-alert');
  const alertText = document.getElementById('login-alert-text');
  const submitBtn = document.getElementById('btn-login-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('login-remember') ? document.getElementById('login-remember').checked : false;

    // Reset alert
    if (alertBox) alertBox.style.display = 'none';

    // Validation
    if (!email || !password) {
      showLoginAlert('Please enter both your email address and password.', 'error');
      return;
    }

    // Set loading state
    setButtonLoading(submitBtn, true, 'Signing In...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, remember_me: rememberMe })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showLoginAlert(data.message || 'Login successful! Redirecting...', 'success');
        if (data.user) {
          localStorage.setItem('campusconnect_active_user', JSON.stringify(data.user));
        }
        setTimeout(() => {
          const target = data.redirectTo ? data.redirectTo.replace(/^\//, '') : 'dashboard.html';
          window.location.href = target;
        }, 600);
      } else {
        showLoginAlert(data.message || 'Invalid email or password.', 'error');
      }
    } catch (err) {
      console.warn('Backend server offline, authenticating via local storage fallback:', err);
      const localUsers = JSON.parse(localStorage.getItem('campusconnect_users') || '[]');
      
      const defaultAccounts = [
        {
          id: 1,
          full_name: 'Dr. Rajesh Sharma (Dean)',
          email: 'admin@campusconnect.edu',
          student_id: 'ADMIN001',
          department: 'Student Affairs Council',
          study_year: 'Administration',
          role: 'admin',
          password: 'Admin@12345'
        },
        {
          id: 2,
          full_name: 'Priya Sharma',
          email: 'priya.sharma@campus.edu',
          student_id: 'CS2026042',
          department: 'Computer Science & Engineering',
          study_year: '3rd Year (Junior)',
          role: 'student',
          password: 'Student@123'
        }
      ];

      const allAccounts = [...defaultAccounts, ...localUsers];
      const match = allAccounts.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (match) {
        localStorage.setItem('campusconnect_active_user', JSON.stringify(match));
        showLoginAlert('Login successful! Redirecting to dashboard...', 'success');
        setTimeout(() => {
          window.location.href = match.role === 'admin' ? 'admin.html' : 'dashboard.html';
        }, 600);
      } else {
        showLoginAlert('Invalid email or password. Please verify credentials.', 'error');
      }
    } finally {
      setButtonLoading(submitBtn, false, 'Sign In to CampusConnect');
    }
  });

  function showLoginAlert(msg, type) {
    if (!alertBox || !alertText) return;
    alertBox.className = `auth-alert ${type}`;
    alertText.textContent = msg;
    alertBox.style.display = 'flex';
  }
}

// ============================================================================
// 3. SIGNUP FORM HANDLER
// ============================================================================
function setupSignupForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const alertBox = document.getElementById('signup-alert');
  const alertText = document.getElementById('signup-alert-text');
  const submitBtn = document.getElementById('btn-signup-submit');

  const pwInput = document.getElementById('signup-password');
  const confirmPwInput = document.getElementById('signup-confirm-password');
  const matchIndicator = document.getElementById('pw-match-indicator');

  // Real-time password match validator
  if (pwInput && confirmPwInput && matchIndicator) {
    const checkMatch = () => {
      const val1 = pwInput.value;
      const val2 = confirmPwInput.value;
      if (!val2) {
        matchIndicator.className = 'pw-match-indicator';
        matchIndicator.textContent = '';
        return;
      }
      if (val1 === val2) {
        matchIndicator.className = 'pw-match-indicator match';
        matchIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i> Passwords match perfectly';
      } else {
        matchIndicator.className = 'pw-match-indicator mismatch';
        matchIndicator.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Passwords do not match';
      }
    };

    pwInput.addEventListener('input', checkMatch);
    confirmPwInput.addEventListener('input', checkMatch);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const studentId = document.getElementById('signup-id').value.trim();
    const department = document.getElementById('signup-dept').value;
    const studyYear = document.getElementById('signup-year').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const terms = document.getElementById('signup-terms').checked;

    // Reset alert
    if (alertBox) alertBox.style.display = 'none';

    // Client-side validations
    if (!fullName || fullName.length < 2) {
      showSignupAlert('Please enter your full student name.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showSignupAlert('Please enter a valid university or personal email address.', 'error');
      return;
    }

    if (!studentId || studentId.length < 3) {
      showSignupAlert('Please enter your Student ID / Roll Number (at least 3 characters).', 'error');
      return;
    }

    if (!department) {
      showSignupAlert('Please select your academic department.', 'error');
      return;
    }

    if (!studyYear) {
      showSignupAlert('Please select your current year of study.', 'error');
      return;
    }

    if (!password || password.length < 6) {
      showSignupAlert('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showSignupAlert('Passwords do not match. Please verify.', 'error');
      return;
    }

    if (!terms) {
      showSignupAlert('You must agree to the Campus Event Code of Conduct to proceed.', 'error');
      return;
    }

    setButtonLoading(submitBtn, true, 'Creating Account...');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: fullName,
          email,
          student_id: studentId,
          department,
          study_year: studyYear,
          password,
          confirm_password: confirmPassword,
          terms
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSignupAlert('Account created successfully! Taking you to your dashboard...', 'success');
        if (data.user) {
          localStorage.setItem('campusconnect_active_user', JSON.stringify(data.user));
        }
        setTimeout(() => {
          const target = data.redirectTo ? data.redirectTo.replace(/^\//, '') : 'dashboard.html';
          window.location.href = target;
        }, 800);
      } else {
        showSignupAlert(data.message || 'Failed to create account.', 'error');
      }
    } catch (err) {
      console.warn('Backend server offline, saving student into browser registry fallback:', err);
      const localUsers = JSON.parse(localStorage.getItem('campusconnect_users') || '[]');
      const exists = localUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.student_id.toLowerCase() === studentId.toLowerCase()
      );

      if (exists) {
        showSignupAlert('An account with this student email or roll number already exists.', 'error');
        setButtonLoading(submitBtn, false, 'Create Student Account');
        return;
      }

      const newUser = {
        id: Date.now(),
        full_name: fullName,
        email: email,
        student_id: studentId,
        department: department,
        study_year: studyYear,
        role: 'student',
        password: password,
        created_at: new Date().toISOString()
      };

      localUsers.push(newUser);
      localStorage.setItem('campusconnect_users', JSON.stringify(localUsers));
      localStorage.setItem('campusconnect_active_user', JSON.stringify(newUser));

      showSignupAlert('Account created successfully! Taking you to your dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } finally {
      setButtonLoading(submitBtn, false, 'Create Student Account');
    }
  });

  function showSignupAlert(msg, type) {
    if (!alertBox || !alertText) return;
    alertBox.className = `auth-alert ${type}`;
    alertText.textContent = msg;
    alertBox.style.display = 'flex';
  }
}

// ============================================================================
// 4. FORGOT PASSWORD MODAL & API FLOW
// ============================================================================
function setupForgotPasswordModal() {
  const trigger = document.getElementById('link-forgot-password');
  const modal = document.getElementById('forgot-password-modal');
  const closeBtn = document.getElementById('close-forgot-modal');
  const form = document.getElementById('forgot-password-form');
  const alertBox = document.getElementById('forgot-alert');
  const alertText = document.getElementById('forgot-alert-text');

  if (!modal) return;

  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
      if (alertBox) alertBox.style.display = 'none';
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();

      if (!email) {
        showForgotAlert('Please provide your university email.', 'error');
        return;
      }

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        showForgotAlert(data.message, 'success');
      } catch (err) {
        showForgotAlert('Could not process request at this moment.', 'error');
      }
    });
  }

  function showForgotAlert(msg, type) {
    if (!alertBox || !alertText) return;
    alertBox.className = `auth-alert ${type}`;
    alertText.textContent = msg;
    alertBox.style.display = 'flex';
  }
}

// ============================================================================
// 5. DEMO AUTO-FILL BUTTONS (Presentation Lifesaver!)
// ============================================================================
function setupDemoFillButtons() {
  // Login as Student Demo
  const btnFillStudent = document.getElementById('btn-fill-student-login');
  if (btnFillStudent) {
    btnFillStudent.addEventListener('click', () => {
      document.getElementById('login-email').value = 'priya.sharma@campus.edu';
      document.getElementById('login-password').value = 'Student@123';
    });
  }

  // Login as Admin Demo
  const btnFillAdmin = document.getElementById('btn-fill-admin-login');
  if (btnFillAdmin) {
    btnFillAdmin.addEventListener('click', () => {
      document.getElementById('login-email').value = 'admin@campusconnect.edu';
      document.getElementById('login-password').value = 'Admin@12345';
    });
  }

  // Signup Form Demo Fill
  const btnFillSignup = document.getElementById('btn-fill-signup-demo');
  if (btnFillSignup) {
    btnFillSignup.addEventListener('click', () => {
      const rand = Math.floor(100 + Math.random() * 900);
      document.getElementById('signup-name').value = 'Alex Morgan';
      document.getElementById('signup-email').value = `alex.m${rand}@campus.edu`;
      document.getElementById('signup-id').value = `CS2026${rand}`;
      document.getElementById('signup-dept').value = 'Computer Science & Engineering';
      document.getElementById('signup-year').value = '3rd Year (Junior)';
      document.getElementById('signup-password').value = 'Pass@12345';
      document.getElementById('signup-confirm-password').value = 'Pass@12345';
      document.getElementById('signup-terms').checked = true;

      // trigger password check
      const matchIndicator = document.getElementById('pw-match-indicator');
      if (matchIndicator) {
        matchIndicator.className = 'pw-match-indicator match';
        matchIndicator.innerHTML = '<i class="fa-solid fa-check-circle"></i> Passwords match perfectly';
      }
    });
  }
}

// Helper: Button Loading State
function setButtonLoading(btn, isLoading, text) {
  if (!btn) return;
  const textSpan = btn.querySelector('.auth-btn-text');
  if (isLoading) {
    btn.classList.add('loading');
    btn.disabled = true;
    if (textSpan) textSpan.textContent = text;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    if (textSpan) textSpan.textContent = text;
  }
}

