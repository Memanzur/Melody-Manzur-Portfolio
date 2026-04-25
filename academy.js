/* ==========================================
   The Melody Method - Interactive Logic
   ========================================== */

(function () {
  'use strict';

  // ---- Star Field ----
  function createStarField() {
    const field = document.querySelector('.star-field');
    if (!field) return;
    const count = 80;
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = (Math.random() * 4) + 's';
      star.style.animationDuration = (3 + Math.random() * 3) + 's';
      if (Math.random() < 0.15) star.classList.add('big');
      if (Math.random() < 0.08) star.classList.add('pink');
      else if (Math.random() < 0.08) star.classList.add('purple');
      else if (Math.random() < 0.04) star.classList.add('gold');
      field.appendChild(star);
    }
  }

  // ---- Progress Tracking (localStorage) ----
  const STORAGE_KEY = 'melodyMethod';

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function markLessonRead(moduleId, lessonIndex) {
    const data = loadProgress();
    if (!data.lessons) data.lessons = {};
    const key = moduleId + '-' + lessonIndex;
    data.lessons[key] = true;
    saveProgress(data);
    updateProgressBar();
    updateModuleStatuses();
  }

  function markQuizPassed(moduleId) {
    const data = loadProgress();
    if (!data.quizzes) data.quizzes = {};
    data.quizzes[moduleId] = true;
    saveProgress(data);
    updateProgressBar();
    updateModuleStatuses();
  }

  function isLessonRead(moduleId, lessonIndex) {
    const data = loadProgress();
    return data.lessons && data.lessons[moduleId + '-' + lessonIndex];
  }

  function isQuizPassed(moduleId) {
    const data = loadProgress();
    return data.quizzes && data.quizzes[moduleId];
  }

  // ---- Progress Bar ----
  function updateProgressBar() {
    const modules = document.querySelectorAll('.module');
    let total = 0;
    let done = 0;
    modules.forEach(function (mod) {
      const id = mod.dataset.module;
      const lessons = mod.querySelectorAll('.lesson');
      total += lessons.length + 1; // lessons + quiz
      lessons.forEach(function (_, i) {
        if (isLessonRead(id, i)) done++;
      });
      if (isQuizPassed(id)) done++;
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const fill = document.querySelector('.mm-progress-fill');
    const text = document.querySelector('.mm-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = pct + '% complete';
  }

  // ---- Module Status Indicators ----
  function updateModuleStatuses() {
    document.querySelectorAll('.module').forEach(function (mod) {
      const id = mod.dataset.module;
      const lessons = mod.querySelectorAll('.lesson');
      let allRead = lessons.length > 0;
      lessons.forEach(function (lesson, i) {
        if (isLessonRead(id, i)) {
          lesson.classList.add('read');
        } else {
          allRead = false;
        }
      });
      if (allRead && isQuizPassed(id)) {
        mod.classList.add('completed');
        var statusEl = mod.querySelector('.module-status');
        if (statusEl) statusEl.textContent = '\u2713';
      }
    });
  }

  // ---- Module Accordion ----
  function initModules() {
    document.querySelectorAll('.module-header').forEach(function (header) {
      header.addEventListener('click', function () {
        var mod = header.closest('.module');
        var wasActive = mod.classList.contains('active');
        // Close all
        document.querySelectorAll('.module.active').forEach(function (m) {
          m.classList.remove('active');
        });
        // Toggle clicked
        if (!wasActive) {
          mod.classList.add('active');
          // Scroll into view
          setTimeout(function () {
            mod.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      });
    });
  }

  // ---- Lesson Expand/Collapse ----
  function initLessons() {
    document.querySelectorAll('.lesson-header').forEach(function (header) {
      header.addEventListener('click', function () {
        var lesson = header.closest('.lesson');
        var mod = lesson.closest('.module');
        var moduleId = mod.dataset.module;
        var index = Array.from(mod.querySelectorAll('.lesson')).indexOf(lesson);

        var wasOpen = lesson.classList.contains('open');
        // Close siblings
        mod.querySelectorAll('.lesson.open').forEach(function (l) {
          l.classList.remove('open');
        });
        // Toggle
        if (!wasOpen) {
          lesson.classList.add('open');
          // Mark as read after a moment
          setTimeout(function () {
            markLessonRead(moduleId, index);
            lesson.classList.add('read');
          }, 1500);
        }
      });
    });
  }

  // ---- Quiz System ----
  function initQuizzes() {
    document.querySelectorAll('.quiz-section').forEach(function (quiz) {
      var mod = quiz.closest('.module');
      var moduleId = mod.dataset.module;

      // If already passed, show result
      if (isQuizPassed(moduleId)) {
        showQuizPassed(quiz, moduleId);
        return;
      }

      var options = quiz.querySelectorAll('.quiz-option');
      var submitBtn = quiz.querySelector('.quiz-submit');

      // Option selection
      options.forEach(function (opt) {
        opt.addEventListener('click', function () {
          if (opt.disabled) return;
          // Deselect siblings in same question
          var qBlock = opt.closest('.quiz-question');
          qBlock.querySelectorAll('.quiz-option').forEach(function (o) {
            o.classList.remove('selected');
          });
          opt.classList.add('selected');
          // Enable submit if all questions answered
          var questions = quiz.querySelectorAll('.quiz-question');
          var allAnswered = true;
          questions.forEach(function (q) {
            if (!q.querySelector('.quiz-option.selected')) allAnswered = false;
          });
          if (submitBtn) submitBtn.disabled = !allAnswered;
        });
      });

      // Submit
      if (submitBtn) {
        submitBtn.addEventListener('click', function () {
          gradeQuiz(quiz, moduleId);
        });
      }
    });
  }

  function gradeQuiz(quizEl, moduleId) {
    var questions = quizEl.querySelectorAll('.quiz-question');
    var correct = 0;
    var total = questions.length;

    questions.forEach(function (q) {
      var selected = q.querySelector('.quiz-option.selected');
      var options = q.querySelectorAll('.quiz-option');
      options.forEach(function (o) { o.disabled = true; });

      if (selected) {
        if (selected.dataset.correct === 'true') {
          selected.classList.add('correct');
          correct++;
        } else {
          selected.classList.add('wrong');
          // Highlight correct answer
          options.forEach(function (o) {
            if (o.dataset.correct === 'true') o.classList.add('correct-answer');
          });
        }
      }
    });

    var submitBtn = quizEl.querySelector('.quiz-submit');
    if (submitBtn) submitBtn.style.display = 'none';

    var resultEl = quizEl.querySelector('.quiz-result');
    var passed = correct >= Math.ceil(total * 0.7); // 70% to pass

    if (passed) {
      resultEl.className = 'quiz-result pass';
      resultEl.innerHTML = '<h4>You passed!</h4><p>You got ' + correct + ' out of ' + total + ' right. Nice work, you really get this stuff.</p>';
      resultEl.style.display = 'block';
      markQuizPassed(moduleId);
      launchConfetti();
    } else {
      resultEl.className = 'quiz-result fail';
      resultEl.innerHTML = '<h4>Almost there</h4><p>You got ' + correct + ' out of ' + total + '. You need ' + Math.ceil(total * 0.7) + ' to pass. Re-read the lessons and try again.</p>' +
        '<button class="quiz-retry" onclick="location.reload()">Try Again</button>';
      resultEl.style.display = 'block';
    }
  }

  function showQuizPassed(quizEl, moduleId) {
    var questions = quizEl.querySelectorAll('.quiz-question');
    questions.forEach(function (q) {
      q.querySelectorAll('.quiz-option').forEach(function (o) {
        o.disabled = true;
        if (o.dataset.correct === 'true') o.classList.add('correct-answer');
      });
    });
    var submitBtn = quizEl.querySelector('.quiz-submit');
    if (submitBtn) submitBtn.style.display = 'none';
    var resultEl = quizEl.querySelector('.quiz-result');
    resultEl.className = 'quiz-result pass';
    resultEl.innerHTML = '<h4>Already passed!</h4><p>You aced this one. Move on to the next module.</p>';
    resultEl.style.display = 'block';
  }

  // ---- Confetti ----
  function launchConfetti() {
    var colors = ['#ec4899', '#a855f7', '#f9a8d4', '#fbbf24', '#4ade80', '#60a5fa', '#c4b5fd'];
    var count = 100;
    for (var i = 0; i < count; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';
      var size = 6 + Math.random() * 8;
      piece.style.width = size + 'px';
      piece.style.height = size * (0.4 + Math.random() * 0.6) + 'px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = (10 + Math.random() * 80) + 'vw';
      piece.style.top = '-20px';
      piece.style.opacity = '1';
      piece.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      document.body.appendChild(piece);
      animateConfetti(piece);
    }
  }

  function animateConfetti(piece) {
    var startX = parseFloat(piece.style.left);
    var drift = (Math.random() - 0.5) * 30;
    var duration = 2000 + Math.random() * 2000;
    var start = performance.now();
    var spin = (Math.random() - 0.5) * 720;

    function frame(now) {
      var elapsed = now - start;
      var t = Math.min(elapsed / duration, 1);
      // Ease out quad
      var ease = t * (2 - t);
      piece.style.top = (-20 + ease * (window.innerHeight + 40)) + 'px';
      piece.style.left = (startX + Math.sin(t * Math.PI * 2) * drift) + 'vw';
      piece.style.opacity = String(1 - t * 0.6);
      piece.style.transform = 'rotate(' + (spin * t) + 'deg)';
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        piece.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  // ---- Reset Progress (hidden feature, type "reset" in console) ----
  window.resetMelodyMethod = function () {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', function () {
    createStarField();
    initModules();
    initLessons();
    initQuizzes();
    updateModuleStatuses();
    updateProgressBar();
  });
})();
