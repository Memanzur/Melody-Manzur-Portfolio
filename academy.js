/* ==========================================
   The Melody Method - Interactive Logic
   ========================================== */

(function () {
  'use strict';

  // ---- Star Field ----
  function createStarField() {
    var field = document.querySelector('.star-field');
    if (!field) return;
    var count = 120;
    for (var i = 0; i < count; i++) {
      var star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = (Math.random() * 5) + 's';
      star.style.animationDuration = (2.5 + Math.random() * 4) + 's';
      if (Math.random() < 0.18) star.classList.add('big');
      if (Math.random() < 0.1) star.classList.add('pink');
      else if (Math.random() < 0.1) star.classList.add('purple');
      else if (Math.random() < 0.05) star.classList.add('gold');
      field.appendChild(star);
    }
  }

  // ---- Progress Tracking (localStorage) ----
  var STORAGE_KEY = 'melodyMethod';

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function markLessonRead(moduleId, lessonIndex) {
    var data = loadProgress();
    if (!data.lessons) data.lessons = {};
    data.lessons[moduleId + '-' + lessonIndex] = true;
    saveProgress(data);
    updateProgressBar();
    updateModuleStatuses();
    updateLearningPath();
    updateQuizVisibility();
  }

  function markQuizPassed(moduleId) {
    var data = loadProgress();
    if (!data.quizzes) data.quizzes = {};
    data.quizzes[moduleId] = true;
    saveProgress(data);
    updateProgressBar();
    updateModuleStatuses();
    updateLearningPath();
  }

  function isLessonRead(moduleId, lessonIndex) {
    var data = loadProgress();
    return data.lessons && data.lessons[moduleId + '-' + lessonIndex];
  }

  function isQuizPassed(moduleId) {
    var data = loadProgress();
    return data.quizzes && data.quizzes[moduleId];
  }

  function isModuleComplete(moduleId) {
    var mod = document.querySelector('[data-module="' + moduleId + '"]');
    if (!mod) return false;
    var lessons = mod.querySelectorAll('.lesson');
    var allRead = lessons.length > 0;
    for (var i = 0; i < lessons.length; i++) {
      if (!isLessonRead(moduleId, i)) { allRead = false; break; }
    }
    return allRead && isQuizPassed(moduleId);
  }

  function areAllLessonsRead(moduleId) {
    var mod = document.querySelector('[data-module="' + moduleId + '"]');
    if (!mod) return false;
    var lessons = mod.querySelectorAll('.lesson');
    if (lessons.length === 0) return false;
    for (var i = 0; i < lessons.length; i++) {
      if (!isLessonRead(moduleId, i)) return false;
    }
    return true;
  }

  // ---- Progress Bar ----
  function updateProgressBar() {
    var modules = document.querySelectorAll('.module');
    var total = 0;
    var done = 0;
    modules.forEach(function (mod) {
      var id = mod.dataset.module;
      var lessons = mod.querySelectorAll('.lesson');
      total += lessons.length + 1;
      lessons.forEach(function (_, i) {
        if (isLessonRead(id, i)) done++;
      });
      if (isQuizPassed(id)) done++;
    });
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var fill = document.querySelector('.mm-progress-fill');
    var text = document.querySelector('.mm-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = pct + '% complete';
  }

  // ---- Learning Path ----
  function updateLearningPath() {
    var dots = document.querySelectorAll('.path-dot');
    var lines = document.querySelectorAll('.path-line');
    var foundCurrent = false;

    dots.forEach(function (dot, i) {
      var modId = dot.dataset.path;
      dot.classList.remove('completed', 'current');
      if (i > 0) lines[i - 1].classList.remove('completed');

      if (isModuleComplete(modId)) {
        dot.classList.add('completed');
        if (i > 0) lines[i - 1].classList.add('completed');
      } else if (!foundCurrent) {
        dot.classList.add('current');
        if (i > 0) lines[i - 1].classList.add('completed');
        foundCurrent = true;
      }
    });
  }

  // ---- Module Status Indicators ----
  function updateModuleStatuses() {
    document.querySelectorAll('.module').forEach(function (mod) {
      var id = mod.dataset.module;
      var lessons = mod.querySelectorAll('.lesson');
      var readCount = 0;
      lessons.forEach(function (lesson, i) {
        if (isLessonRead(id, i)) {
          lesson.classList.add('read');
          readCount++;
        }
      });

      // Update lesson counter in header
      var counter = mod.querySelector('.module-lesson-count');
      if (counter) {
        counter.textContent = readCount + ' of ' + lessons.length + ' lessons';
      }

      if (readCount === lessons.length && lessons.length > 0 && isQuizPassed(id)) {
        mod.classList.add('completed');
        var statusEl = mod.querySelector('.module-status');
        if (statusEl) statusEl.textContent = '\u2713';
      }
    });
  }

  // ---- Quiz Visibility ----
  function updateQuizVisibility() {
    document.querySelectorAll('.module').forEach(function (mod) {
      var id = mod.dataset.module;
      var quiz = mod.querySelector('.quiz-section');
      if (!quiz) return;

      var allRead = areAllLessonsRead(id);
      var alreadyPassed = isQuizPassed(id);

      if (allRead || alreadyPassed) {
        quiz.classList.remove('quiz-locked');
        quiz.classList.add('quiz-unlocked');
      } else {
        quiz.classList.add('quiz-locked');
        quiz.classList.remove('quiz-unlocked');
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
          setTimeout(function () {
            mod.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      });
    });

    // Auto-open first incomplete module
    var opened = false;
    document.querySelectorAll('.module').forEach(function (mod) {
      if (!opened && !isModuleComplete(mod.dataset.module)) {
        mod.classList.add('active');
        opened = true;
      }
    });
    // If all complete, open the first one
    if (!opened) {
      var first = document.querySelector('.module');
      if (first) first.classList.add('active');
    }
  }

  // ---- Lesson Expand/Collapse ----
  function initLessons() {
    document.querySelectorAll('.lesson-header').forEach(function (header) {
      header.addEventListener('click', function () {
        var lesson = header.closest('.lesson');
        var mod = lesson.closest('.module');

        var wasOpen = lesson.classList.contains('open');
        // Close siblings
        mod.querySelectorAll('.lesson.open').forEach(function (l) {
          l.classList.remove('open');
        });
        // Toggle
        if (!wasOpen) {
          lesson.classList.add('open');
        }
      });
    });

    // Add "Got it" buttons to each lesson
    document.querySelectorAll('.lesson').forEach(function (lesson) {
      var mod = lesson.closest('.module');
      var moduleId = mod.dataset.module;
      var lessons = mod.querySelectorAll('.lesson');
      var index = Array.from(lessons).indexOf(lesson);

      var body = lesson.querySelector('.lesson-body');
      if (!body) return;

      var btn = document.createElement('button');
      btn.className = 'lesson-done-btn';

      if (isLessonRead(moduleId, index)) {
        btn.textContent = 'Completed';
        btn.classList.add('is-done');
        btn.disabled = true;
      } else {
        btn.textContent = 'Got it, next lesson';
      }

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (btn.classList.contains('is-done')) return;

        // Mark this lesson as read
        markLessonRead(moduleId, index);
        lesson.classList.add('read');
        btn.textContent = 'Completed';
        btn.classList.add('is-done');
        btn.disabled = true;

        // Auto-open next lesson or show quiz
        var nextLesson = lessons[index + 1];
        if (nextLesson && !nextLesson.classList.contains('read')) {
          lesson.classList.remove('open');
          nextLesson.classList.add('open');
          setTimeout(function () {
            nextLesson.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        } else {
          // All lessons done, close this one and scroll to quiz
          lesson.classList.remove('open');
          var quiz = mod.querySelector('.quiz-section');
          if (quiz && areAllLessonsRead(moduleId)) {
            setTimeout(function () {
              quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
          }
        }
      });

      body.appendChild(btn);
    });
  }

  // ---- Quiz System ----
  function initQuizzes() {
    document.querySelectorAll('.quiz-section').forEach(function (quiz) {
      var mod = quiz.closest('.module');
      var moduleId = mod.dataset.module;

      // Add locked overlay
      var lockedMsg = document.createElement('div');
      lockedMsg.className = 'quiz-locked-msg';
      lockedMsg.innerHTML = '<p>Complete all lessons above to unlock the quiz.</p>';
      quiz.insertBefore(lockedMsg, quiz.querySelector('.quiz-question'));

      if (isQuizPassed(moduleId)) {
        showQuizPassed(quiz);
        return;
      }

      var options = quiz.querySelectorAll('.quiz-option');
      var submitBtn = quiz.querySelector('.quiz-submit');

      options.forEach(function (opt) {
        opt.addEventListener('click', function () {
          if (opt.disabled) return;
          if (quiz.classList.contains('quiz-locked')) return;
          var qBlock = opt.closest('.quiz-question');
          qBlock.querySelectorAll('.quiz-option').forEach(function (o) {
            o.classList.remove('selected');
          });
          opt.classList.add('selected');
          var questions = quiz.querySelectorAll('.quiz-question');
          var allAnswered = true;
          questions.forEach(function (q) {
            if (!q.querySelector('.quiz-option.selected')) allAnswered = false;
          });
          if (submitBtn) submitBtn.disabled = !allAnswered;
        });
      });

      if (submitBtn) {
        submitBtn.addEventListener('click', function () {
          if (quiz.classList.contains('quiz-locked')) return;
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
          options.forEach(function (o) {
            if (o.dataset.correct === 'true') o.classList.add('correct-answer');
          });
        }
      }
    });

    var submitBtn = quizEl.querySelector('.quiz-submit');
    if (submitBtn) submitBtn.style.display = 'none';

    var resultEl = quizEl.querySelector('.quiz-result');
    var passed = correct >= Math.ceil(total * 0.7);

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

  function showQuizPassed(quizEl) {
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
    var count = 120;
    for (var i = 0; i < count; i++) {
      (function (delay) {
        setTimeout(function () {
          var piece = document.createElement('div');
          piece.className = 'confetti-piece';
          var size = 5 + Math.random() * 10;
          piece.style.width = size + 'px';
          piece.style.height = size * (0.3 + Math.random() * 0.7) + 'px';
          piece.style.background = colors[Math.floor(Math.random() * colors.length)];
          piece.style.left = (10 + Math.random() * 80) + 'vw';
          piece.style.top = '-20px';
          piece.style.opacity = '1';
          piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
          document.body.appendChild(piece);
          animateConfetti(piece);
        }, delay);
      })(Math.random() * 600);
    }
  }

  function animateConfetti(piece) {
    var startX = parseFloat(piece.style.left);
    var drift = (Math.random() - 0.5) * 40;
    var duration = 2200 + Math.random() * 2500;
    var start = performance.now();
    var spin = (Math.random() - 0.5) * 900;

    function frame(now) {
      var elapsed = now - start;
      var t = Math.min(elapsed / duration, 1);
      var ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      piece.style.top = (-20 + ease * (window.innerHeight + 60)) + 'px';
      piece.style.left = (startX + Math.sin(t * Math.PI * 3) * drift) + 'vw';
      piece.style.opacity = String(Math.max(0, 1 - t * 0.8));
      piece.style.transform = 'rotate(' + (spin * t) + 'deg)';
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        piece.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  // ---- Reset Progress ----
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
    updateLearningPath();
    updateQuizVisibility();
  });
})();
