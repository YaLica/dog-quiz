/* ====== engine.js ====== */
/* Все данные берём из глобального объекта CONFIG (config.js) */

(function () {

  /* Защита: если config.js не подключён — стоп */
  if (typeof window.CONFIG === 'undefined') {
    console.error('❌ CONFIG не найден! Проверьте подключение config.js в index.html');
    return;
  }

  const CFG = window.CONFIG;

  /* ====== КОНСТАНТЫ ====== */
  const SWIPE_THRESHOLD = 50;
  const totalScreens    = 5;

  /* ====== ПЕРЕМЕННЫЕ СОСТОЯНИЯ ====== */
  let current           = 0;
  let startX            = 0;
  let startY            = 0;
  let moved             = false;
  let isDragging        = false;
  let score             = 0;
  let selectedMessenger = '';

  /* ====== ЭЛЕМЕНТЫ ====== */
  const carousel = document.getElementById('carousel');
  const video    = document.getElementById('preview-video');
  const overlay  = document.getElementById('preview-overlay');

  /* ====== ПОДСТАВЛЯЕМ ДАННЫЕ ИЗ CONFIG В HTML ====== */
  function applyConfig() {

    /* --- Видео превью --- */
    video.src = CFG.previewVideo;

    /* --- Фоновые картинки --- */
    document.querySelectorAll('.bg-image').forEach(function (img) {
      img.src = CFG.bgImage;
    });

    /* --- Вопросы --- */
    CFG.questions.forEach(function (q) {
      var screenNum = q.id;

      /* Картинка корги */
      var corgiImg = document.querySelector(
        '#screen-' + screenNum + ' .corgi-wrap img'
      );
      if (corgiImg) corgiImg.src = q.corgiImage;

      /* Текст вопроса */
      var qText = document.querySelector(
        '#screen-' + screenNum + ' .question-text'
      );
      if (qText) qText.textContent = q.questionText;

      /* Варианты ответов */
      var grid = document.querySelector('#buttons-grid-' + screenNum);
      if (grid) {
        grid.setAttribute('data-correct', q.correctAnswer);
        grid.setAttribute('data-next',    q.nextScreen);

        var btns = grid.querySelectorAll('.btn-item');
        btns.forEach(function (btn, i) {
          if (q.answers[i]) {
            btn.setAttribute('data-answer', q.answers[i].id);
            btn.textContent = q.answers[i].text;
          }
        });
      }
    });

    /* --- Финальный экран --- */
    var nameInp  = document.getElementById('user-name');
    var emailInp = document.getElementById('user-email');
    var phoneInp = document.getElementById('user-phone');

    if (nameInp)  nameInp.placeholder  = CFG.finalScreen.namePlaceholder;
    if (emailInp) emailInp.placeholder = CFG.finalScreen.emailPlaceholder;
    if (phoneInp) phoneInp.placeholder = CFG.finalScreen.phonePlaceholder;

    /* --- Кнопка отправки --- */
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.textContent = CFG.finalScreen.submitBtnText;

    /* --- Мессенджеры --- */
    var messengerRow = document.querySelector('.messenger-row');
    if (messengerRow) {
      messengerRow.innerHTML = '';
      CFG.finalScreen.messengers.forEach(function (m) {
        var btn = document.createElement('button');
        btn.className = 'messenger-btn';
        btn.setAttribute('data-messenger', m.value);
        btn.textContent = m.text;
        messengerRow.appendChild(btn);
      });
    }
  }

  /* ====== ПРОГРЕСС-БАР ====== */
  function updateProgressBar(currentStep) {
    var totalSteps = CFG.questions.length;
    var percent    = Math.round((currentStep / totalSteps) * 100);

    var screenId = 'screen-' + currentStep;
    var screen   = document.getElementById(screenId);
    if (!screen) return;

    var fill   = screen.querySelector('.progress-fill');
    var labels = screen.querySelectorAll('.progress-label span');

    if (fill)      fill.style.width     = percent + '%';
    if (labels[0]) labels[0].textContent = 'Вопрос ' + currentStep + ' из ' + totalSteps;
    if (labels[1]) labels[1].textContent = percent + '%';
  }

  /* ====== МАСКА ТЕЛЕФОНА ====== */
  function initPhoneMask(selector) {
    var inp = document.querySelector(selector);
    if (!inp) return;

    function formatPhone(digits) {
      var d      = digits;
      var result = '7 (';
      if (d.length === 0) return '7 (';
      result += d.substring(0, 3);
      if (d.length >= 3) result += ') ';
      result += d.substring(3, 6);
      if (d.length >= 6) result += '-';
      result += d.substring(6, 8);
      if (d.length >= 8) result += '-';
      result += d.substring(8, 10);
      return result;
    }

    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        var raw    = inp.value.replace(/\D/g, '');
        var digits = raw.length > 1 ? raw.substring(1) : '';
        if (digits.length === 0) { inp.value = ''; return; }
        digits    = digits.substring(0, digits.length - 1);
        inp.value = digits.length === 0 ? '' : formatPhone(digits);
      }
    });

    inp.addEventListener('input', function () {
      var raw = inp.value.replace(/\D/g, '');
      if (raw.length === 0) { inp.value = ''; return; }
      if (raw[0] === '7' || raw[0] === '8') raw = raw.substring(1);
      raw       = raw.substring(0, 10);
      inp.value = formatPhone(raw);
    });

    inp.addEventListener('touchstart', function (e) {
      e.stopPropagation();
    }, { passive: true });

    inp.addEventListener('touchend', function (e) {
      e.stopPropagation();
    }, { passive: true });
  }

  /* ====== ПЕРЕХОД НА ЭКРАН ====== */
  function goTo(index) {
    if (index < 0)             index = 0;
    if (index >= totalScreens) index = totalScreens - 1;
    current = index;

    /* Обновляем прогресс-бар для экранов вопросов */
    if (current >= 1 && current <= CFG.questions.length) {
      updateProgressBar(current);
    }

    /* Экран результатов */
    if (current === 4) {
      var label = '';
      if      (score === 3) label = CFG.results.score3;
      else if (score === 2) label = CFG.results.score2;
      else if (score === 1) label = CFG.results.score1;
      else                  label = CFG.results.score0;

      document.getElementById('result-text').innerHTML =
        label + '<br>Твой уровень знаний:<br>' + score + ' из ' +
        CFG.questions.length + ' баллов';

      resetForm();
    }

    carousel.style.transform = 'translateX(-' + (current * 20) + '%)';
  }

  /* ====== СБРОС ФОРМЫ ====== */
  function resetForm() {
    document.getElementById('user-name').value  = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-phone').value = '';

    ['user-name', 'user-email', 'user-phone'].forEach(function (id) {
      document.getElementById(id).style.borderColor = 'rgba(255,255,255,0.35)';
    });

    selectedMessenger = '';
    document.querySelectorAll('.messenger-btn').forEach(function (b) {
      b.classList.remove('selected');
    });

    var btn = document.getElementById('submit-btn');
    btn.textContent = CFG.finalScreen.submitBtnText;
    btn.disabled    = false;
  }

  /* ====== ПОДСВЕТКА ОШИБКИ ====== */
  function highlightError(el) {
    el.style.borderColor = '#ff6b6b';
    setTimeout(function () {
      el.style.borderColor = 'rgba(255,255,255,0.35)';
    }, 1500);
  }

  /* ====== ВЫБОР МЕССЕНДЖЕРА ====== */
  function initMessengers() {
    document.querySelectorAll('.messenger-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.messenger-btn').forEach(function (b) {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
        selectedMessenger = btn.getAttribute('data-messenger');
      });

      btn.addEventListener('touchstart', function (e) {
        e.stopPropagation();
      }, { passive: true });

      btn.addEventListener('touchend', function (e) {
        e.stopPropagation();
      }, { passive: true });
    });
  }

  /* ====== ОТПРАВКА В GOOGLE SHEETS ====== */
  function initSubmitBtn() {
    var submitBtn = document.getElementById('submit-btn');

    submitBtn.addEventListener('click', function () {
      var nameInp  = document.getElementById('user-name');
      var emailInp = document.getElementById('user-email');
      var phoneInp = document.getElementById('user-phone');

      var name  = nameInp.value.trim();
      var email = emailInp.value.trim();
      var phone = phoneInp.value.trim();

      var hasError = false;
      if (!name)  { highlightError(nameInp);  hasError = true; }
      if (!email) { highlightError(emailInp); hasError = true; }
      if (!phone || phone.replace(/\D/g, '').length < 11) {
        highlightError(phoneInp);
        hasError = true;
      }
      if (hasError) return;

      submitBtn.textContent = CFG.finalScreen.sendingBtnText;
      submitBtn.disabled    = true;

      var formData = new FormData();
      formData.append('name',      name);
      formData.append('email',     email);
      formData.append('phone',     phone);
      formData.append('messenger', selectedMessenger || 'не выбран');
      formData.append('score',     score + ' из ' + CFG.questions.length);

      fetch(CFG.googleScriptUrl, { method: 'POST', body: formData })
        .then(function () {
          submitBtn.textContent = CFG.finalScreen.successBtnText;
        })
        .catch(function () {
          submitBtn.textContent = CFG.finalScreen.successBtnText;
        });
    });

    /* Блокируем свайп на кнопке */
    ['user-name', 'user-email', 'user-phone', 'submit-btn'].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('touchstart', function (e) {
        e.stopPropagation();
      }, { passive: true });
      el.addEventListener('touchend', function (e) {
        e.stopPropagation();
      }, { passive: true });
    });
  }

  /* ====== ЛОГИКА ОТВЕТОВ ====== */
  function handleAnswer(btn) {
    if (btn.classList.contains('wrong') ||
        btn.classList.contains('correct')) return;

    var answer        = btn.getAttribute('data-answer');
    var grid          = btn.closest('.buttons-grid');
    var correctAnswer = grid.getAttribute('data-correct');
    var nextScreen    = parseInt(grid.getAttribute('data-next'));

    grid.classList.add('locked');
    btn.classList.remove('pressed');

    if (answer === correctAnswer) {
      score++;
      btn.classList.add('correct');
    } else {
      btn.classList.add('wrong');
    }

    setTimeout(function () {
      goTo(nextScreen);
    }, 800);
  }

  /* ====== КНОПКИ ОТВЕТОВ — СОБЫТИЯ ====== */
  function initAnswerButtons() {
    document.querySelectorAll('.btn-item').forEach(function (btn) {

      btn.addEventListener('touchstart', function () {
        btn.classList.add('pressed');
      }, { passive: true });

      btn.addEventListener('touchcancel', function () {
        btn.classList.remove('pressed');
      }, { passive: true });

      btn.addEventListener('touchend', function (e) {
        btn.classList.remove('pressed');
        if (moved) return;
        var t = e.changedTouches[0];
        if (Math.abs(t.clientX - startX) > 10 ||
            Math.abs(t.clientY - startY) > 10) return;
        e.stopPropagation();
        handleAnswer(btn);
      }, { passive: true });

      btn.addEventListener('mousedown', function () {
        btn.classList.add('pressed');
      });

      btn.addEventListener('mouseleave', function () {
        btn.classList.remove('pressed');
      });

      btn.addEventListener('mouseup', function () {
        btn.classList.remove('pressed');
        if (moved) return;
        handleAnswer(btn);
      });
    });
  }

  /* ====== ПРЕВЬЮ — СОБЫТИЯ ====== */
  function initPreview() {
    video.addEventListener('timeupdate', function () {
      if (video.currentTime >= 6.25) overlay.classList.add('active');
    });

    overlay.addEventListener('click', function () {
      video.pause();
      goTo(1);
    });

    var previewScreen = document.getElementById('screen-preview');
    ['touchstart', 'touchend'].forEach(function (evt) {
      previewScreen.addEventListener(evt, function (e) {
        e.stopPropagation();
      }, { passive: true });
    });
    ['mousedown', 'mouseup'].forEach(function (evt) {
      previewScreen.addEventListener(evt, function (e) {
        e.stopPropagation();
      });
    });
  }

  /* ====== СВАЙПЫ КАРУСЕЛИ ====== */
  function initSwipes() {

    carousel.addEventListener('touchstart', function (e) {
      if (current === 0) return;
      startX     = e.touches[0].clientX;
      startY     = e.touches[0].clientY;
      moved      = false;
      isDragging = true;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      if (e.target.closest('.btn-item')) return;
      isDragging = false;
      if (current === 0) return;
      var dx = startX - e.changedTouches[0].clientX;
      var dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy) && dx > SWIPE_THRESHOLD) {
        moved = true;
        goTo(current + 1);
      }
    }, { passive: true });

    carousel.addEventListener('mousedown', function (e) {
      if (current === 0) return;
      startX     = e.clientX;
      startY     = e.clientY;
      moved      = false;
      isDragging = true;
    });

    carousel.addEventListener('mouseup', function (e) {
      if (!isDragging) return;
      if (e.target.closest('.btn-item')) return;
      isDragging = false;
      if (current === 0) return;
      var dx = startX - e.clientX;
      var dy = startY - e.clientY;
      if (Math.abs(dx) > Math.abs(dy) && dx > SWIPE_THRESHOLD) {
        moved = true;
        goTo(current + 1);
      }
    });

    window.addEventListener('keydown', function (e) {
      if (current === 0) return;
      if (e.key === 'ArrowRight') goTo(current + 1);
    });
  }

  /* ====== СТАРТ ====== */
  function init() {
    applyConfig();       /* 1. Подставляем данные из CONFIG в HTML */
    initPhoneMask('#user-phone'); /* 2. Маска телефона             */
    initMessengers();    /* 3. Кнопки мессенджеров                 */
    initSubmitBtn();     /* 4. Кнопка отправки                     */
    initAnswerButtons(); /* 5. Кнопки ответов                      */
    initPreview();       /* 6. Превью видео                        */
    initSwipes();        /* 7. Свайпы карусели                     */
    goTo(0);             /* 8. Стартуем с экрана превью            */
  }

  init();

})();