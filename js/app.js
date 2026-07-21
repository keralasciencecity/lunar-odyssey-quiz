/**
 * Moon Day Quiz - Core Application Controller
 * Handles starfield, quiz state, anti-cheat, canvas certificate rendering,
 * and Google Sheets API submissions.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- LUNAR SURFACE BACKGROUND ---
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let craters = [];
  let rocks = [];
  let tracks = [];
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function initMoonSurface() {
    craters = [];
    rocks = [];
    tracks = [];
    
    // Generate craters based on canvas size
    const numCraters = Math.max(6, Math.floor(canvas.width / 180));
    for (let i = 0; i < numCraters; i++) {
      craters.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 70 + 20 // radius 20 to 90
      });
    }
    
    // Generate scattered rocks
    const numRocks = Math.max(20, Math.floor(canvas.width / 70));
    for (let i = 0; i < numRocks; i++) {
      rocks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3.5 + 1.5
      });
    }
    
    // Generate rover tire tracks crossing
    const numTracks = Math.random() > 0.4 ? 2 : 1;
    for (let i = 0; i < numTracks; i++) {
      const angle = (Math.random() * 24 - 12) * Math.PI / 180; // slight angle
      const yPos = (i + 1) * (canvas.height / (numTracks + 1));
      tracks.push({
        yStart: yPos + (Math.random() * 80 - 40),
        angle: angle
      });
    }
  }
  
  function drawMoonSurface() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Rover Tire Tracks
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.012)";
    ctx.lineWidth = 6;
    ctx.setLineDash([3, 5]); // tread spacing
    tracks.forEach(track => {
      const trackSpacing = 16;
      ctx.beginPath();
      
      // Left tread
      ctx.moveTo(0, track.yStart - trackSpacing);
      ctx.lineTo(canvas.width, track.yStart - trackSpacing + Math.tan(track.angle) * canvas.width);
      
      // Right tread
      ctx.moveTo(0, track.yStart + trackSpacing);
      ctx.lineTo(canvas.width, track.yStart + trackSpacing + Math.tan(track.angle) * canvas.width);
      ctx.stroke();
    });
    ctx.restore();
    
    // 2. Draw 3D Shaded Craters
    craters.forEach(c => {
      ctx.save();
      // Outer light highlight (rim facing light)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner shadow gradient (crater bowl depth)
      let grad = ctx.createRadialGradient(c.x - c.r * 0.15, c.y - c.r * 0.15, c.r * 0.05, c.x, c.y, c.r);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.35)");
      grad.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0.005)");
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // 3. Draw Rocks with Shadows
    rocks.forEach(rock => {
      ctx.save();
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.beginPath();
      ctx.arc(rock.x + rock.r * 0.4, rock.y + rock.r * 0.4, rock.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Rock body highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
      ctx.beginPath();
      ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  
  // --- AUDIO SYNTHESIZER (WEB AUDIO API) ---
  const SoundFX = {
    muted: false,
    ctx: null,
    
    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    
    play(type) {
      this.init();
      if (this.muted || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      
      const now = this.ctx.currentTime;
      switch(type) {
        case 'click':
          this.beep(800, 0.05, 'sine', 0.08);
          break;
        case 'correct':
          // Rising reward tones
          this.beep(520, 0.08, 'sine', 0.12);
          setTimeout(() => {
            if (!this.muted) this.beep(780, 0.15, 'sine', 0.12);
          }, 80);
          break;
        case 'incorrect':
          // Retro buzz
          this.beep(160, 0.35, 'sawtooth', 0.18);
          break;
        case 'warning':
          // Pulsing warning alarm
          this.beep(980, 0.15, 'square', 0.15);
          setTimeout(() => {
            if (!this.muted) this.beep(880, 0.25, 'square', 0.15);
          }, 180);
          break;
        case 'tick':
          // Clock tick
          this.beep(1400, 0.015, 'triangle', 0.06);
          break;
        case 'finish':
          // Rising ship takeoff sweep
          this.sweep(300, 1000, 0.7, 'sine', 0.2);
          break;
      }
    },
    
    beep(freq, duration, type, vol) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch(e) {}
    },
    
    sweep(startFreq, endFreq, duration, type, vol) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch(e) {}
    }
  };

  // --- BACKGROUND ANIMATION LOOP ---
  let radarAngle = 0;
  let particles = [];

  function triggerParticleBurst() {
    particles = [];
    const colorOptions = ["#06b6d4", "#fbbf24", "#3b82f6", "#ffffff"];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 100,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        r: Math.random() * 3 + 1,
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        alpha: 1,
        decay: Math.random() * 0.01 + 0.008
      });
    }
  }

  function drawRadarSweep() {
    if (canvas.height < 300) return; // Hide radar on short viewports
    radarAngle += 0.008;
    if (radarAngle > Math.PI * 2) radarAngle = 0;
    
    const rx = 120;
    const ry = canvas.height - 120;
    const radarR = 80;
    
    ctx.save();
    ctx.strokeStyle = "rgba(6, 182, 212, 0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(rx, ry, radarR, 0, Math.PI * 2);
    ctx.arc(rx, ry, radarR * 0.65, 0, Math.PI * 2);
    ctx.arc(rx, ry, radarR * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(rx - radarR, ry); ctx.lineTo(rx + radarR, ry);
    ctx.moveTo(rx, ry - radarR); ctx.lineTo(rx, ry + radarR);
    ctx.stroke();
    
    ctx.font = "800 8px 'Orbitron'";
    ctx.fillStyle = "rgba(6, 182, 212, 0.3)";
    ctx.textAlign = "center";
    ctx.fillText("RADAR SCAN: ACTIVE", rx, ry - radarR - 8);
    
    ctx.translate(rx, ry);
    ctx.rotate(radarAngle);
    
    let grad = ctx.createLinearGradient(0, 0, radarR, 0);
    grad.addColorStop(0, "rgba(6, 182, 212, 0)");
    grad.addColorStop(1, "rgba(6, 182, 212, 0.4)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radarR, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function animateSurface() {
    drawMoonSurface();
    drawRadarSweep();
    drawParticles();
    requestAnimationFrame(animateSurface);
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    initMoonSurface();
  });
  
  resizeCanvas();
  initMoonSurface();
  animateSurface();

  // --- APPLICATION STATE ---
  const state = {
    user: {
      name: "",
      email: "",
      phone: "",
      place: "",
      category: "junior"
    },
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    attempted: 0,
    timeRemaining: window.QUIZ_CONFIG.QUIZ_DURATION_SECONDS,
    timerInterval: null,
    cheatCount: 0,
    cheated: false,
    quizActive: false,
    monitoringActive: false,
    leaderboard: { junior: [], senior: [] },
    activeTab: "junior"
  };

  // --- UI ELEMENTS ---
  const screens = {
    login: document.getElementById("screen-login"),
    quiz: document.getElementById("screen-quiz"),
    dq: document.getElementById("screen-dq"),
    results: document.getElementById("screen-results")
  };
  
  const header = document.getElementById("main-header");
  const loginForm = document.getElementById("login-form");
  const optionsGrid = document.getElementById("options-grid");
  const timerDisplay = document.getElementById("timer-display");
  const timerBar = document.getElementById("timer-bar");
  const scoreDisplay = document.getElementById("hud-score");
  const categoryBadge = document.getElementById("hud-category");
  const progressFill = document.getElementById("quiz-progress-indicator");
  const questionIndexLabel = document.getElementById("question-index-label");
  const questionText = document.getElementById("question-text");
  const cheatToast = document.getElementById("cheat-toast");
  
  // Results Elements
  const resCategory = document.getElementById("res-category");
  const resScore = document.getElementById("res-score");
  const resAttempted = document.getElementById("res-attempted");
  const resAccuracy = document.getElementById("res-accuracy");
  const resCheatStatus = document.getElementById("res-cheat-status");
  const certPreviewImg = document.getElementById("certificate-preview-img");
  const certLoading = document.getElementById("cert-loading");
  
  // Actions
  const btnDownloadCert = document.getElementById("btn-download-cert");
  const btnShareWhatsapp = document.getElementById("btn-share-whatsapp");

  // --- UTILS ---
  function showScreen(screenId) {
    Object.keys(screens).forEach(key => {
      screens[key].classList.remove("active");
    });
    screens[screenId].classList.add("active");
    
    // Hide header on quiz arena and dq screen to conserve space
    if (screenId === "quiz" || screenId === "dq") {
      header.style.display = "none";
    } else {
      header.style.display = "flex";
    }
  }

  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  // --- FORM VALIDATION ---
  function validateForm() {
    let isValid = true;
    
    const nameInput = document.getElementById("input-name");
    const emailInput = document.getElementById("input-email");
    const phoneInput = document.getElementById("input-phone");
    const placeInput = document.getElementById("input-place");
    const rulesCheck = document.getElementById("agree-rules");
    
    // Name validation
    if (!nameInput.value.trim()) {
      nameInput.parentElement.classList.add("invalid");
      isValid = false;
    } else {
      nameInput.parentElement.classList.remove("invalid");
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.parentElement.classList.add("invalid");
      isValid = false;
    } else {
      emailInput.parentElement.classList.remove("invalid");
    }
    
    // Phone validation
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phoneInput.value.trim())) {
      phoneInput.parentElement.classList.add("invalid");
      isValid = false;
    } else {
      phoneInput.parentElement.classList.remove("invalid");
    }
    
    // Place validation
    if (!placeInput.value.trim()) {
      placeInput.parentElement.classList.add("invalid");
      isValid = false;
    } else {
      placeInput.parentElement.classList.remove("invalid");
    }
    
    // Rules validation
    if (!rulesCheck.checked) {
      rulesCheck.parentElement.parentElement.classList.add("invalid");
      isValid = false;
    } else {
      rulesCheck.parentElement.parentElement.classList.remove("invalid");
    }
    
    return isValid;
  }

  // Clear errors dynamically on input
  loginForm.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      if (input.type === "checkbox") {
        input.parentElement.parentElement.classList.remove("invalid");
      } else {
        input.parentElement.classList.remove("invalid");
      }
    });
  });

  // --- ANTI-CHEAT DETECTORS ---
  function showCheatWarning() {
    cheatToast.classList.add("show");
    setTimeout(() => {
      cheatToast.classList.remove("show");
    }, 5000);
  }

  function triggerCheatedDisqualification() {
    state.quizActive = false;
    state.cheated = true;
    clearInterval(state.timerInterval);
    showScreen("dq");
  }

  function handleVisibilityViolation() {
    if (!state.quizActive || !state.monitoringActive) return;
    
    state.cheatCount++;
    if (state.cheatCount === 1) {
      showCheatWarning();
      SoundFX.play('warning');
    } else if (state.cheatCount >= 2) {
      triggerCheatedDisqualification();
    }
  }

  // Prevent right-click, copy, paste, and text selection
  document.addEventListener("contextmenu", e => {
    if (state.quizActive) e.preventDefault();
  });

  document.addEventListener("keydown", e => {
    if (!state.quizActive) return;
    
    // Disable shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+C, Ctrl+V, Ctrl+U
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "C" || e.key === "c")) ||
      (e.ctrlKey && (e.key === "c" || e.key === "C" || e.key === "v" || e.key === "V" || e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S"))
    ) {
      e.preventDefault();
      handleVisibilityViolation();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      handleVisibilityViolation();
    }
  });

  window.addEventListener("blur", () => {
    // Window loses focus (e.g. devtools opened or Alt+Tab)
    handleVisibilityViolation();
  });

  // --- QUIZ GAME ENGINE ---
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    
    if (!validateForm() && !window.QUIZ_CONFIG.DEBUG_MODE) return;
    
    // Save user info
    state.user.name = document.getElementById("input-name").value.trim();
    state.user.email = document.getElementById("input-email").value.trim();
    state.user.phone = document.getElementById("input-phone").value.trim();
    state.user.place = document.getElementById("input-place").value.trim();
    
    const selectedCategory = document.querySelector('input[name="category"]:checked').value;
    state.user.category = selectedCategory;
    
    startQuiz();
  });

  function startQuiz() {
    // Initialize Quiz Stats
    state.score = 0;
    state.attempted = 0;
    state.currentQuestionIndex = 0;
    state.timeRemaining = window.QUIZ_CONFIG.QUIZ_DURATION_SECONDS;
    state.cheatCount = 0;
    state.cheated = false;
    state.quizActive = true;
    state.monitoringActive = false; // Start on cooldown
    
    // Load and shuffle questions
    const sourcePool = window.MOON_QUIZ_QUESTIONS[state.user.category];
    state.questions = shuffle([...sourcePool]); // Shuffle pool
    
    // HUD update
    categoryBadge.textContent = state.user.category.toUpperCase() + " APEX";
    scoreDisplay.textContent = "00";
    timerDisplay.textContent = state.timeRemaining;
    
    // Reset timer progress bar and stress styles
    timerBar.classList.remove("timer-stress");
    timerDisplay.classList.remove("timer-text-stress");
    timerBar.setAttribute("stroke-dasharray", "100, 100");

    // Display first question
    renderQuestion();
    
    // Start Screen Quiz
    showScreen("quiz");
    
    // Start Countdown Timer
    startTimer();

    // Enable anti-cheat system after 2 seconds to bypass initial keyboard/focus shifts
    setTimeout(() => {
      if (state.quizActive) {
        state.monitoringActive = true;
      }
    }, 2000);
  }

  function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.timeRemaining--;
      timerDisplay.textContent = state.timeRemaining;
      
      // Update SVG Progress circle
      const percentage = (state.timeRemaining / window.QUIZ_CONFIG.QUIZ_DURATION_SECONDS) * 100;
      timerBar.setAttribute("stroke-dasharray", `${percentage}, 100`);
      
      // Stress mode under 15 seconds
      if (state.timeRemaining <= 15) {
        timerBar.classList.add("timer-stress");
        timerDisplay.classList.add("timer-text-stress");
        if (state.timeRemaining > 0) {
          SoundFX.play('tick');
        }
      }
      
      if (state.timeRemaining <= 0) {
        endQuiz();
      }
    }, 1000);
  }

  function renderQuestion() {
    // If we run out of questions in the pool, reshuffle pool to keep going (infinite loop for 2 minutes)
    if (state.currentQuestionIndex >= state.questions.length) {
      const sourcePool = window.MOON_QUIZ_QUESTIONS[state.user.category];
      state.questions = state.questions.concat(shuffle([...sourcePool]));
    }
    
    const currentQ = state.questions[state.currentQuestionIndex];
    
    // Render text
    questionIndexLabel.textContent = `QUESTION ${String(state.attempted + 1).padStart(2, '0')}`;
    questionText.textContent = currentQ.question;
    
    // Render options
    optionsGrid.innerHTML = "";
    currentQ.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.dataset.index = idx;
      
      const letter = String.fromCharCode(65 + idx); // A, B, C, D
      btn.innerHTML = `
        <span class="option-letter font-orbitron">${letter}</span>
        <span class="option-text">${escapeHTML(optText)}</span>
      `;
      
      btn.addEventListener("click", () => selectOption(idx));
      optionsGrid.appendChild(btn);
    });
    
    // Update progress bar fill based on average pace (assuming 15 questions target, but just grows dynamically)
    const prog = Math.min((state.attempted / 20) * 100, 100);
    progressFill.style.width = `${prog}%`;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function selectOption(selectedIdx) {
    // Prevent double clicking
    const buttons = optionsGrid.querySelectorAll(".option-btn");
    buttons.forEach(btn => btn.classList.add("disabled"));
    
    const currentQ = state.questions[state.currentQuestionIndex];
    const isCorrect = selectedIdx === currentQ.answer;
    
    state.attempted++;
    
    // Highlight choices
    buttons.forEach(btn => {
      const idx = parseInt(btn.dataset.index);
      if (idx === currentQ.answer) {
        btn.classList.add("correct");
      }
      if (idx === selectedIdx && !isCorrect) {
        btn.classList.add("incorrect");
      }
    });
    
    if (isCorrect) {
      state.score++;
      scoreDisplay.textContent = String(state.score).padStart(2, '0');
      SoundFX.play('correct');
    } else {
      SoundFX.play('incorrect');
    }
    
    // Brief delay to visualize feedback, then advance
    setTimeout(() => {
      state.currentQuestionIndex++;
      renderQuestion();
    }, 450);
  }

  function endQuiz() {
    state.quizActive = false;
    clearInterval(state.timerInterval);
    SoundFX.play('finish');
    triggerParticleBurst();
    
    // Setup results screen details
    resCategory.textContent = state.user.category.toUpperCase();
    resScore.textContent = state.score;
    resAttempted.textContent = state.attempted;
    
    const acc = state.attempted > 0 ? Math.round((state.score / state.attempted) * 100) : 0;
    resAccuracy.textContent = `${acc}%`;
    
    if (state.cheatCount > 0) {
      resCheatStatus.className = "cheat-notif warn-notif";
      resCheatStatus.textContent = `⚠️ Telemetry Warning: ${state.cheatCount} tab switch/blur event(s) logged. Score was submitted but flagged.`;
    } else {
      resCheatStatus.className = "cheat-notif success-notif";
      resCheatStatus.textContent = "✅ Telemetry clean. Flight logs clear of disruptions.";
    }
    
    showScreen("results");
    
    // Start certificate generation
    generateCertificate();
    
    // Submit scores to Google Sheet API
    submitScore();
  }

  // --- CERTIFICATE CANVAS RENDERING ---
  function generateCertificate() {
    certLoading.style.display = "flex";
    
    const canvas = document.getElementById("certificate-canvas");
    const ctx = canvas.getContext("2d");
    
    // Calculate Rank
    let rank = "LUNAR CADET";
    let accessLevel = "LEVEL 01";
    let rankColor = "#9ca3af"; // Silver/gray
    if (state.score >= 19) {
      rank = "LUNAR COMMANDER";
      accessLevel = "LEVEL 04 (ELITE)";
      rankColor = "#fbbf24"; // Gold
    } else if (state.score >= 11) {
      rank = "LUNAR EXPLORER";
      accessLevel = "LEVEL 03 (ADVANCED)";
      rankColor = "#06b6d4"; // Cyan
    } else if (state.score >= 5) {
      rank = "LUNAR NAVIGATOR";
      accessLevel = "LEVEL 02 (STANDARD)";
      rankColor = "#3b82f6"; // Blue
    }
    
    const randomSerial = "LMR-2026-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    
    // Ensure all custom fonts are ready before drawing
    document.fonts.ready.then(() => {
      // 1. Draw Space Dark Background (Lunar Grey)
      ctx.fillStyle = "#13151a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 2. Draw craters in badge background
      for (let i = 0; i < 15; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let r = Math.random() * 30 + 10;
        
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        
        let grad = ctx.createRadialGradient(x - r * 0.15, y - r * 0.15, r * 0.05, x, y, r);
        grad.addColorStop(0, "rgba(0, 0, 0, 0.2)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.003)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      // 3. Technical Grid Pattern overlay
      ctx.strokeStyle = "rgba(6, 182, 212, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();
      
      // 4. Double borders (Cyan Neon and Silver)
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#06b6d4"; // Cyan outer
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 10;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
      
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"; // White/silver inner
      ctx.shadowBlur = 0; // reset shadow
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      
      // 5. Corner Ornaments
      drawCornerOrnament(ctx, 45, 45, 1);
      drawCornerOrnament(ctx, canvas.width - 45, 45, 2);
      drawCornerOrnament(ctx, 45, canvas.height - 45, 3);
      drawCornerOrnament(ctx, canvas.width - 45, canvas.height - 45, 4);
      
      // 6. Header Agency Text
      ctx.textAlign = "left";
      ctx.font = "bold 22px 'Orbitron'";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("MOON DAY ONLINE CHAMPIONSHIP 2026", 70, 80);
      
      ctx.font = "800 10px 'Orbitron'";
      ctx.fillStyle = "#06b6d4";
      ctx.fillText("LUNAR ODYSSEY NAVIGATION TELEMETRY", 70, 100);
      
      ctx.font = "600 12px 'Outfit'";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("JOINTLY PRESENTED BY SCIENCE CITY KOTTAYAM & AASTRO KERALA, KOTTAYAM CHAPTER", 70, 120);
      
      // Space Agency Circular Mission Patch logo (Upper Right)
      drawMissionPatch(ctx, canvas.width - 120, 95);
      
      // Divider line
      ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, 140);
      ctx.lineTo(canvas.width - 70, 140);
      ctx.stroke();
      
      // 7. Pilot Avatar/ID Box
      drawAstronautAvatar(ctx, 70, 180, 180, 220);
      
      // 8. Pilot Info
      ctx.textAlign = "left";
      ctx.font = "800 13px 'Orbitron'";
      ctx.fillStyle = "#06b6d4";
      ctx.fillText("MISSION PILOT CREDENTIALS", 280, 195);
      
      ctx.font = "700 32px 'Outfit'";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(state.user.name.toUpperCase(), 280, 235);
      
      ctx.font = "500 14px 'Outfit'";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(`SECTOR / PLACE: ${state.user.place.toUpperCase()}`, 280, 270);
      ctx.fillText(`CHAMPIONSHIP CATEGORY: ${state.user.category.toUpperCase()} PILOT`, 280, 295);
      ctx.fillText(`ACCESS AUTHORIZATION: ${accessLevel}`, 280, 320);
      
      ctx.font = "400 12px 'Orbitron'";
      ctx.fillStyle = "rgba(6, 182, 212, 0.7)";
      ctx.fillText(`SYSTEM REGISTRATION SERIAL: ${randomSerial}`, 280, 350);
      
      // Certification statement
      ctx.font = "italic 13px 'Outfit'";
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText("Has successfully completed the space science navigation and speed quiz module.", 280, 390);
      
      // 9. Telemetry Stats Box
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1;
      ctx.fillRect(70, 420, 490, 100);
      ctx.strokeRect(70, 420, 490, 100);
      
      // Vertical separators in stats box
      ctx.beginPath();
      ctx.moveTo(230, 420); ctx.lineTo(230, 520);
      ctx.moveTo(390, 420); ctx.lineTo(390, 520);
      ctx.stroke();
      
      // Stat 1: Correct Runs (Score)
      ctx.textAlign = "center";
      ctx.font = "800 24px 'Orbitron'";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`${state.score}`, 150, 465);
      ctx.font = "500 10px 'Outfit'";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("CORRECT RUNS", 150, 495);
      
      // Stat 2: Accuracy
      ctx.font = "800 24px 'Orbitron'";
      ctx.fillStyle = "#06b6d4";
      const acc = state.attempted > 0 ? Math.round((state.score / state.attempted) * 100) : 0;
      ctx.fillText(`${acc}%`, 310, 465);
      ctx.font = "500 10px 'Outfit'";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("ACCURACY RATE", 310, 495);
      
      // Stat 3: Telemetry Lock status
      const lockStatus = (state.cheated || state.cheatCount > 0) ? "DISRUPTED" : "SECURE";
      const lockColor = (state.cheated || state.cheatCount > 0) ? "#ef4444" : "#10b981";
      ctx.font = "800 18px 'Orbitron'";
      ctx.fillStyle = lockColor;
      ctx.fillText(lockStatus, 475, 465);
      ctx.font = "500 10px 'Outfit'";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("TELEMETRY LINK", 475, 495);
      
      // 10. System Authorization Barcode
      ctx.textAlign = "left";
      ctx.font = "800 13px 'Orbitron'";
      ctx.fillStyle = "#06b6d4";
      ctx.fillText("AUTHORIZATION SYSTEM LOCK", 70, 565);
      
      drawBarcode(ctx, 70, 585, 300, 60, state.user.name + randomSerial);
      
      ctx.font = "500 11px 'Orbitron'";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillText(`SYS.VERIFIED.2026.KOTTAYAM`, 70, 665);
      
      ctx.font = "500 14px 'Outfit'";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(`Date: July 20, 2026`, 70, 715);
      ctx.fillText(`Verification: SECURE CRYPTO SIGNATURES`, 70, 740);
      

      
      // 11. Right Side: Technical Rover Blueprint
      ctx.textAlign = "center";
      ctx.font = "800 12px 'Orbitron'";
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillText("LUNAR ROVER SCHEMATIC (PRAGYAN-M1)", 900, 360);
      
      drawRoverBlueprint(ctx, 900, 480);
      
      // 12. Right Side: Dynamic Rank Badge
      ctx.textAlign = "center";
      ctx.font = "800 12px 'Orbitron'";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("ASSIGNED PILOT RANK", 900, 185);
      
      ctx.font = "800 24px 'Orbitron'";
      ctx.fillStyle = rankColor;
      ctx.fillText(rank, 900, 220);
      
      drawRankIcon(ctx, 900, 275, rank, rankColor);
      
      // Convert canvas to image for user preview
      const dataUrl = canvas.toDataURL("image/png");
      certPreviewImg.src = dataUrl;
      certLoading.style.display = "none";
    });
  }

  function drawMissionPatch(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1.5;
    
    // Outer double ring
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();
    
    // Small text space agency initials
    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 9px 'Orbitron'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCK", 0, -18);
    ctx.fillText("AK", 0, 18);
    
    // Crescent Moon
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(0, 0, 12, -Math.PI / 2, Math.PI / 2);
    ctx.arc(-4, 0, 10, Math.PI / 2, -Math.PI / 2, true);
    ctx.fill();
    
    ctx.restore();
  }

  function drawAstronautAvatar(ctx, x, y, w, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
    
    // Diagonal grid pattern
    ctx.strokeStyle = "rgba(6, 182, 212, 0.08)";
    ctx.beginPath();
    for (let i = 15; i < w; i += 15) {
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + h);
    }
    for (let i = 15; i < h; i += 15) {
      ctx.moveTo(x, y + i);
      ctx.lineTo(x + w, y + i);
    }
    ctx.stroke();
    
    // Helmet outline
    const cx = x + w / 2;
    const cy = y + h / 2 + 10;
    ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 36, Math.PI, 0);
    ctx.lineTo(cx + 36, cy + 25);
    ctx.lineTo(cx - 36, cy + 25);
    ctx.closePath();
    ctx.stroke();
    
    // Golden Visor
    ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 5, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Reflection
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 8, 10, Math.PI * 1.2, Math.PI * 1.7);
    ctx.stroke();
    
    // Shoulders
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 36, cy + 25);
    ctx.lineTo(x + 15, y + h - 15);
    ctx.lineTo(x + w - 15, y + h - 15);
    ctx.lineTo(cx + 36, cy + 25);
    ctx.stroke();
    
    ctx.restore();
  }

  function drawRoverBlueprint(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.22)";
    ctx.fillStyle = "rgba(6, 182, 212, 0.02)";
    ctx.lineWidth = 1.5;
    
    // Ground tracks
    ctx.setLineDash([6, 10]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.moveTo(-220, 110);
    ctx.lineTo(220, 110);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(6, 182, 212, 0.22)";
    
    // Chassis box
    ctx.fillRect(-120, -10, 240, 50);
    ctx.strokeRect(-120, -10, 240, 50);
    
    // Grid lines inside chassis
    ctx.beginPath();
    ctx.moveTo(-80, -10); ctx.lineTo(-80, 40);
    ctx.moveTo(0, -10); ctx.lineTo(0, 40);
    ctx.moveTo(80, -10); ctx.lineTo(80, 40);
    ctx.moveTo(-120, 15); ctx.lineTo(120, 15);
    ctx.stroke();
    
    // Solar Panel
    ctx.fillStyle = "rgba(6, 182, 212, 0.05)";
    ctx.beginPath();
    ctx.moveTo(-80, -10);
    ctx.lineTo(-100, -65);
    ctx.lineTo(40, -65);
    ctx.lineTo(60, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-90, -37); ctx.lineTo(50, -37);
    ctx.moveTo(-40, -65); ctx.lineTo(-20, -10);
    ctx.moveTo(10, -65); ctx.lineTo(30, -10);
    ctx.stroke();
    
    // Camera mast
    ctx.beginPath();
    ctx.moveTo(80, -10);
    ctx.lineTo(80, -95);
    ctx.stroke();
    
    // Camera box
    ctx.fillRect(65, -115, 30, 20);
    ctx.strokeRect(65, -115, 30, 20);
    ctx.beginPath();
    ctx.arc(80, -105, 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Antenna
    ctx.beginPath();
    ctx.moveTo(-60, -10);
    ctx.lineTo(-85, -60);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-92, -65, 14, Math.PI * 1.2, Math.PI * 0.2);
    ctx.stroke();
    
    // Robotic Arm
    ctx.beginPath();
    ctx.moveTo(110, 25);
    ctx.lineTo(145, 35);
    ctx.lineTo(155, 65);
    ctx.lineTo(135, 78);
    ctx.stroke();
    
    // Suspension and 3 Wheels
    const wheels = [-80, 0, 80];
    wheels.forEach(wx => {
      ctx.beginPath();
      ctx.moveTo(wx - 15, 40);
      ctx.lineTo(wx, 75);
      ctx.lineTo(wx + 15, 40);
      ctx.stroke();
      
      ctx.fillStyle = "#090d16";
      ctx.beginPath();
      ctx.arc(wx, 75, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(wx, 75, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        let startX = wx + Math.cos(a) * 16;
        let startY = 75 + Math.sin(a) * 16;
        let endX = wx + Math.cos(a) * 24;
        let endY = 75 + Math.sin(a) * 24;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
      }
      ctx.stroke();
    });
    
    ctx.restore();
  }

  function drawRankIcon(ctx, x, y, rank, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2.5;
    
    if (rank === "LUNAR COMMANDER") {
      ctx.beginPath();
      ctx.moveTo(-45, -8); ctx.lineTo(-18, -4); ctx.lineTo(-8, 16); ctx.lineTo(-35, 12); ctx.closePath();
      ctx.moveTo(45, -8); ctx.lineTo(18, -4); ctx.lineTo(8, 16); ctx.lineTo(35, 12); ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 40, 12, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
      drawStar(ctx, 0, 0, 5, 20, 9, color);
    } else if (rank === "LUNAR EXPLORER") {
      ctx.beginPath();
      ctx.moveTo(-35, -12); ctx.quadraticCurveTo(-12, -8, -4, 8);
      ctx.moveTo(35, -12); ctx.quadraticCurveTo(12, -8, 4, 8);
      ctx.moveTo(-12, 12); ctx.lineTo(0, 22); ctx.lineTo(12, 12);
      ctx.moveTo(-12, 18); ctx.lineTo(0, 28); ctx.lineTo(12, 18);
      ctx.stroke();
      drawStar(ctx, 0, 0, 5, 14, 6, color);
    } else if (rank === "LUNAR NAVIGATOR") {
      ctx.beginPath();
      ctx.arc(0, -4, 12, 0, Math.PI * 2);
      ctx.moveTo(-16, 10); ctx.lineTo(0, 20); ctx.lineTo(16, 10);
      ctx.moveTo(-16, 16); ctx.lineTo(0, 26); ctx.lineTo(16, 16);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(3, -4); ctx.lineTo(0, -6); ctx.lineTo(-3, -4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-16, -8); ctx.lineTo(0, 6); ctx.lineTo(16, -8);
      ctx.moveTo(-16, -1); ctx.lineTo(0, 13); ctx.lineTo(16, -1);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawBarcode(ctx, x, y, w, h, code) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#000000";
    let currentX = x + 8;
    const endX = x + w - 8;
    
    let seed = 0;
    for (let i = 0; i < code.length; i++) {
      seed += code.charCodeAt(i);
    }
    
    function randomWidth() {
      const widths = [1, 2, 3, 5, 7];
      seed = (seed * 9301 + 49297) % 233280;
      return widths[Math.floor((seed / 233280) * widths.length)];
    }
    
    while (currentX < endX) {
      const barW = randomWidth();
      const spaceW = randomWidth();
      if (currentX + barW < endX) {
        ctx.fillRect(currentX, y, barW, h);
      }
      currentX += barW + spaceW;
    }
    ctx.restore();
  }

  function drawCornerOrnament(ctx, x, y, corner) {
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const size = 20;
    if (corner === 1) { // top-left
      ctx.moveTo(x + size, y); ctx.lineTo(x, y); ctx.lineTo(x, y + size);
    } else if (corner === 2) { // top-right
      ctx.moveTo(x - size, y); ctx.lineTo(x, y); ctx.lineTo(x, y + size);
    } else if (corner === 3) { // bottom-left
      ctx.moveTo(x + size, y); ctx.lineTo(x, y); ctx.lineTo(x, y - size);
    } else if (corner === 4) { // bottom-right
      ctx.moveTo(x - size, y); ctx.lineTo(x, y); ctx.lineTo(x, y - size);
    }
    ctx.stroke();
  }

  function drawGoldenSeal(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = "rgba(251, 191, 36, 0.3)";
    ctx.shadowBlur = 10;
    
    // Star spikes
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    const spikes = 24;
    const outerR = 30;
    const innerR = 25;
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    
    ctx.moveTo(0, -outerR);
    for (let i = 0; i < spikes; i++) {
      let sx = Math.cos(rot) * outerR;
      let sy = Math.sin(rot) * outerR;
      ctx.lineTo(sx, sy);
      rot += step;
      
      sx = Math.cos(rot) * innerR;
      sy = Math.sin(rot) * innerR;
      ctx.lineTo(sx, sy);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#d97706";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
    
    // Star symbols inside seal
    ctx.fillStyle = "#d97706";
    ctx.font = "8px 'Orbitron'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("APEX", 0, -4);
    ctx.fillText("2026", 0, 5);
    
    ctx.restore();
  }

  // --- DOWNLOAD & SHARE ---
  btnDownloadCert.addEventListener("click", () => {
    const canvas = document.getElementById("certificate-canvas");
    const link = document.createElement("a");
    link.download = `Lunar_Explorer_Badge_${state.user.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  btnShareWhatsapp.addEventListener("click", () => {
    let rank = "LUNAR CADET";
    if (state.score >= 19) rank = "LUNAR COMMANDER";
    else if (state.score >= 11) rank = "LUNAR EXPLORER";
    else if (state.score >= 5) rank = "LUNAR NAVIGATOR";

    const customText = `I completed the Moon Day Online Quiz 2026 and achieved the rank of ${rank} (score: ${state.score}/${state.attempted})! 🚀 Test your space coordinates and get your certificate badge here: ${window.location.origin}${window.location.pathname}`;

    const canvas = document.getElementById("certificate-canvas");
    if (!canvas) return;

    // Show a loader indicator
    const originalText = btnShareWhatsapp.innerHTML;
    btnShareWhatsapp.innerHTML = `<span class="btn-text">🔄 PREPARING SHARE...</span>`;

    canvas.toBlob((blob) => {
      btnShareWhatsapp.innerHTML = originalText;
      if (!blob) {
        // Fallback to text link
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(customText)}`;
        window.open(url, "_blank");
        return;
      }

      const file = new File([blob], `Lunar_Pilot_Badge_${state.score}.png`, { type: 'image/png' });

      // Try native sharing (Web Share API Level 2 - supports files)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'Lunar Pilot Credentials',
          text: customText
        })
        .catch(err => {
          console.warn("Share cancelled or failed, falling back to text-link:", err);
          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(customText)}`;
          window.open(url, "_blank");
        });
      } else {
        // Fallback to WhatsApp link
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(customText)}`;
        window.open(url, "_blank");
      }
    }, 'image/png');
  });

  // --- DATABASE & LEADERBOARD SYNC ---
  function submitScore() {
    const payload = {
      name: state.user.name,
      email: state.user.email,
      phone: state.user.phone,
      place: state.user.place,
      category: state.user.category,
      score: state.score,
      attempted: state.attempted,
      timeRemaining: state.timeRemaining,
      cheated: state.cheated || (state.cheatCount > 0),
      cheatCount: state.cheatCount,
      userAgent: navigator.userAgent
    };
    
    const apiURL = window.QUIZ_CONFIG.GOOGLE_SHEETS_URL;
    
    if (!apiURL) {
      console.warn("Google Sheet URL is not configured. Falling back to local storage.");
      saveLocalScore(payload);
      renderLeaderboardLocal();
      return;
    }
    
    fetch(apiURL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script Web App redirects if CORS is not customized
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(() => {
      console.log("Score sent successfully (no-cors response parsed)");
      // Fetch leaderboard using GET request
      fetchLeaderboard(apiURL);
    })
    .catch(err => {
      console.error("Failed to submit score via web API, saving locally:", err);
      saveLocalScore(payload);
      renderLeaderboardLocal();
    });
  }

  function deduplicateAndSortLeaderboard(rawList) {
    if (!Array.isArray(rawList)) return [];
    
    // 1. Filter out cheaters
    const valid = rawList.filter(e => !e.cheated);
    
    // 2. Group by normalized student name
    const studentMap = new Map();
    
    valid.forEach(entry => {
      // Normalize name to catch slight typing variations: "Akshara. S" -> "aksharas"
      const nameKey = (entry.name || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      if (!nameKey) return;
      
      let rawScore = Number(entry.score) || 0;
      let attempted = Number(entry.attempted) || 1;
      
      // Normalize score if cumulative: a single quiz has 20 questions max.
      let singleScore = rawScore;
      if (singleScore > 20) {
        let estimatedRuns = Math.max(1, Math.round(attempted / 12));
        singleScore = Math.min(20, Math.round(rawScore / estimatedRuns));
      }
      singleScore = Math.min(20, Math.max(0, singleScore));
      
      const normalizedEntry = {
        name: entry.name,
        place: entry.place,
        category: entry.category,
        score: singleScore,
        attempted: attempted,
        cheated: !!entry.cheated,
        timestamp: entry.timestamp || new Date().toISOString()
      };
      
      if (!studentMap.has(nameKey)) {
        studentMap.set(nameKey, normalizedEntry);
      } else {
        const existing = studentMap.get(nameKey);
        // Compare: Keep entry with higher singleScore. If tied, keep entry with FEWEST attempts!
        let replace = false;
        if (normalizedEntry.score > existing.score) {
          replace = true;
        } else if (normalizedEntry.score === existing.score) {
          if (normalizedEntry.attempted < existing.attempted) {
            replace = true;
          }
        }
        if (replace) {
          studentMap.set(nameKey, normalizedEntry);
        }
      }
    });
    
    // 3. Convert Map values to Array & Sort
    const uniqueStudents = Array.from(studentMap.values());
    
    uniqueStudents.sort((a, b) => {
      // Primary: Score (Highest first)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Tie-breaker 1: Attempt Count (Fewest attempts first!)
      if (a.attempted !== b.attempted) {
        return a.attempted - b.attempted;
      }
      // Tie-breaker 2: Timestamp (Earlier submission first)
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    return uniqueStudents;
  }

  function fetchLeaderboard(url) {
    fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.status === "success" && data.leaderboard) {
        state.leaderboard.junior = deduplicateAndSortLeaderboard(data.leaderboard.junior || []).slice(0, 20);
        state.leaderboard.senior = deduplicateAndSortLeaderboard(data.leaderboard.senior || []).slice(0, 20);
        renderLeaderboardTable();
      } else {
        renderLeaderboardLocal();
      }
    })
    .catch(err => {
      console.error("Error fetching remote leaderboard:", err);
      renderLeaderboardLocal();
    });
  }

  function saveLocalScore(entry) {
    let localData = [];
    try {
      localData = JSON.parse(localStorage.getItem("moon_quiz_results")) || [];
    } catch(e) {
      localData = [];
    }
    
    localData.push({
      name: entry.name,
      place: entry.place,
      category: entry.category,
      score: entry.score,
      attempted: entry.attempted,
      cheated: entry.cheated,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem("moon_quiz_results", JSON.stringify(localData));
  }

  function renderLeaderboardLocal() {
    let localData = [];
    try {
      localData = JSON.parse(localStorage.getItem("moon_quiz_results")) || [];
    } catch(e) {
      localData = [];
    }
    
    const juniorList = localData.filter(e => e.category === "junior");
    const seniorList = localData.filter(e => e.category === "senior");
    
    state.leaderboard.junior = deduplicateAndSortLeaderboard(juniorList).slice(0, 20);
    state.leaderboard.senior = deduplicateAndSortLeaderboard(seniorList).slice(0, 20);
    
    renderLeaderboardTable();
  }

  function renderLeaderboardTable() {
    const tbodyResults = document.getElementById("leaderboard-rows");
    if (tbodyResults) {
      populateRows(tbodyResults, state.activeTab);
    }
    
    const tbodyLogin = document.getElementById("login-leaderboard-rows");
    if (tbodyLogin) {
      populateRows(tbodyLogin, state.loginActiveTab || "junior");
    }
  }

  function populateRows(tbody, category) {
    tbody.innerHTML = "";
    const list = state.leaderboard[category] || [];
    
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center">No telemetry records found. Be the first to establish coordinates!</td></tr>`;
      return;
    }
    
    list.forEach((entry, idx) => {
      const rank = idx + 1;
      let badgeClass = "rank-other";
      if (rank === 1) badgeClass = "rank-1";
      else if (rank === 2) badgeClass = "rank-2";
      else if (rank === 3) badgeClass = "rank-3";
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="rank-badge ${badgeClass}">${rank}</span></td>
        <td>
          <div class="astronaut-name">${escapeHTML(entry.name)}</div>
        </td>
        <td><span class="astronaut-place">${escapeHTML(entry.place || "N/A")}</span></td>
        <td><span class="astronaut-score">${entry.score} pts <span style="font-size:0.75rem;color:var(--text-secondary)">(${entry.attempted} att)</span></span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Bind tab switching for Results page
  window.switchLeaderboardTab = (category) => {
    SoundFX.play('click');
    state.activeTab = category;
    document.getElementById("tab-junior").classList.toggle("active", category === "junior");
    document.getElementById("tab-senior").classList.toggle("active", category === "senior");
    renderLeaderboardTable();
  };

  // Bind landing page tabs
  const tabShowRegister = document.getElementById("tab-show-register");
  const tabShowLeaderboard = document.getElementById("tab-show-leaderboard");
  const registerView = document.getElementById("login-register-view");
  const leaderboardView = document.getElementById("login-leaderboard-view");
  
  if (tabShowRegister && tabShowLeaderboard) {
    tabShowRegister.addEventListener("click", () => {
      SoundFX.play('click');
      tabShowRegister.classList.add("active");
      tabShowLeaderboard.classList.remove("active");
      registerView.classList.remove("display-none");
      leaderboardView.classList.add("display-none");
    });
    
    tabShowLeaderboard.addEventListener("click", () => {
      SoundFX.play('click');
      tabShowLeaderboard.classList.add("active");
      tabShowRegister.classList.remove("active");
      registerView.classList.add("display-none");
      leaderboardView.classList.remove("display-none");
      
      // Fetch latest scores
      const apiURL = window.QUIZ_CONFIG.GOOGLE_SHEETS_URL;
      if (apiURL) {
        fetchLeaderboard(apiURL);
      } else {
        renderLeaderboardLocal();
      }
    });
  }

  // Category switching on landing page leaderboard
  const loginTabJunior = document.getElementById("login-tab-junior");
  const loginTabSenior = document.getElementById("login-tab-senior");
  
  if (loginTabJunior && loginTabSenior) {
    state.loginActiveTab = "junior";
    loginTabJunior.addEventListener("click", () => {
      SoundFX.play('click');
      state.loginActiveTab = "junior";
      loginTabJunior.classList.add("active");
      loginTabSenior.classList.remove("active");
      renderLeaderboardTable();
    });
    
    loginTabSenior.addEventListener("click", () => {
      SoundFX.play('click');
      state.loginActiveTab = "senior";
      loginTabSenior.classList.add("active");
      loginTabJunior.classList.remove("active");
      renderLeaderboardTable();
    });
  }

  // Audio Mute Buttons Binding
  const btnMuteHeader = document.getElementById("btn-mute");
  const btnMuteHud = document.getElementById("btn-mute-hud");
  
  function toggleMute() {
    SoundFX.muted = !SoundFX.muted;
    const icon = SoundFX.muted ? "🔇" : "🔊";
    if (btnMuteHeader) btnMuteHeader.textContent = icon;
    if (btnMuteHud) btnMuteHud.textContent = icon;
    
    if (!SoundFX.muted) {
      SoundFX.play('click');
    }
  }
  
  if (btnMuteHeader) btnMuteHeader.addEventListener("click", toggleMute);
  if (btnMuteHud) btnMuteHud.addEventListener("click", toggleMute);

  // Play click on start button
  const btnStart = document.getElementById("btn-start");
  if (btnStart) {
    btnStart.addEventListener("click", () => {
      SoundFX.play('click');
    });
  }

  // --- INTERACTIVE LUNAR PHASE SIMULATOR ---
  function getLunarPhaseFromPct(pct) {
    const cycle = 29.53059;
    const age = (pct / 100) * cycle;
    let phaseName = "";
    let illumination = Math.round(50 * (1 - Math.cos((2 * Math.PI * age) / cycle)));
    
    if (age < 1.84 || age >= 27.68) {
      phaseName = "New Moon";
    } else if (age < 5.53) {
      phaseName = "Waxing Crescent";
    } else if (age < 9.22) {
      phaseName = "First Quarter";
    } else if (age < 12.91) {
      phaseName = "Waxing Gibbous";
    } else if (age < 16.61) {
      phaseName = "Full Moon";
    } else if (age < 20.30) {
      phaseName = "Waning Gibbous";
    } else if (age < 23.99) {
      phaseName = "Third Quarter";
    } else {
      phaseName = "Waning Crescent";
    }
    
    return { phaseName, illumination, age };
  }

  function drawSensorMoon(canvas, age) {
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = canvas.width / 2 - 10;
    const cycle = 29.53059;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Glow atmosphere
    ctx.save();
    let glowGrad = ctx.createRadialGradient(cx, cy, r - 5, cx, cy, r + 8);
    glowGrad.addColorStop(0, "rgba(6, 182, 212, 0.15)");
    glowGrad.addColorStop(1, "rgba(6, 182, 212, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 1. Shadowed moon disk (base)
    ctx.fillStyle = "#161b22";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. Draw illuminated part
    ctx.save();
    ctx.fillStyle = "#e2e8f0";
    
    const half = cycle / 2;
    if (age <= half) {
      // Waxing phases (Right side lit)
      const pct = age / half;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI/2, Math.PI/2, false);
      const ctrlX = cx + r * (1 - 2 * pct);
      ctx.quadraticCurveTo(ctrlX, cy, cx, cy - r);
      ctx.fill();
    } else {
      // Waning phases (Left side lit)
      const pct = (age - half) / half;
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI/2, -Math.PI/2, false);
      const ctrlX = cx - r * (1 - 2 * pct);
      ctx.quadraticCurveTo(ctrlX, cy, cx, cy + r);
      ctx.fill();
    }
    ctx.restore();
    
    // 3. Crater textures overlay
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    const craters = [
      { x: -r * 0.4, y: -r * 0.2, cr: r * 0.15 },
      { x: r * 0.3, y: r * 0.2, cr: r * 0.2 },
      { x: -r * 0.1, y: r * 0.4, cr: r * 0.12 },
      { x: r * 0.15, y: -r * 0.5, cr: r * 0.1 }
    ];
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(cx + c.x, cy + c.y, c.cr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
    
    // 4. Outer rim line
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  function updateLunarSimulator(pct, isLive = false) {
    const info = getLunarPhaseFromPct(pct);
    const canvas = document.getElementById("lunar-sensor-canvas");
    if (canvas) {
      drawSensorMoon(canvas, info.age);
    }
    
    const phaseNameEl = document.getElementById("sensor-phase-name");
    const illuminationEl = document.getElementById("sensor-illumination");
    const cycleDayEl = document.getElementById("sensor-cycle-day");
    const dateDisplayEl = document.getElementById("sensor-date-display");
    
    if (phaseNameEl) phaseNameEl.textContent = info.phaseName.toUpperCase();
    if (illuminationEl) illuminationEl.textContent = `${info.illumination}% ILLUMINATED`;
    if (cycleDayEl) cycleDayEl.textContent = `CYCLE DAY: ${info.age.toFixed(1)}`;
    if (dateDisplayEl) {
      dateDisplayEl.textContent = isLive ? "LIVE DATA" : "SIMULATION";
      dateDisplayEl.style.color = isLive ? "var(--accent-green)" : "var(--accent-cyan)";
      dateDisplayEl.style.borderColor = isLive ? "var(--accent-green)" : "var(--accent-cyan)";
    }
  }

  // Bind slider
  const lunarSlider = document.getElementById("lunar-sensor-slider");
  if (lunarSlider) {
    lunarSlider.addEventListener("input", (e) => {
      updateLunarSimulator(parseFloat(e.target.value), false);
    });
  }

  // Auto-sync live phase on load
  function initLiveLunarSensor() {
    try {
      const today = new Date();
      const refDate = new Date(Date.UTC(2023, 0, 7, 23, 8, 0));
      const diffDays = (today.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
      const cycle = 29.53059;
      const todayAge = (diffDays % cycle + cycle) % cycle;
      const todayPct = (todayAge / cycle) * 100;
      
      if (lunarSlider) {
        lunarSlider.value = todayPct;
      }
      updateLunarSimulator(todayPct, true);
      
      // Auto-collapse cards on mobile screens to avoid screen clutter on start
      const isMobile = window.innerWidth <= 480;
      if (isMobile) {
        const sensAccordion = document.querySelector(".lunar-sensor-accordion");
        const sigAccordion = document.querySelector(".significance-panel-accordion");
        if (sensAccordion) sensAccordion.removeAttribute("open");
        if (sigAccordion) sigAccordion.removeAttribute("open");
      }
    } catch(e) {
      console.error("Error setting live lunar phase:", e);
    }
  }

  initLiveLunarSensor();



  // Load local rankings on start
  renderLeaderboardLocal();
});
