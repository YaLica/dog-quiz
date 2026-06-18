window.CONFIG = {

  /* ====== ВИДЕО И ФОНЫ ====== */
  previewVideo : 'preview.mp4',
  bgImage      : 'london-bg.png',

  /* ====== ССЫЛКА НА GOOGLE SCRIPT ====== */
  googleScriptUrl: 'https://script.google.com/macros/s/AKfycbxQiSBhiH3Wmy4s6sLZp32CjW6l_2ZwtzzRC5vwHfwfRz0-qsXHE7qo9sYAvSBV388MEQ/exec',

  /* ====== ВОПРОСЫ ====== */
  questions: [
    {
      id          : 1,
      corgiImage  : 'corgi-shock.png',
      questionText: 'Какое слово точнее всего описывает эмоцию маскота Корги?',
      correctAnswer: '2',
      nextScreen  : 2,
      answers: [
        { id: '1', text: 'Excited'    },
        { id: '2', text: 'Shocked'    },
        { id: '3', text: 'Devastated' },
        { id: '4', text: 'Bored'      }
      ]
    },
    {
      id          : 2,
      corgiImage  : 'corgi-strange.png',
      questionText: 'Доктор Корги-Стрэндж просчитал 14 000 вариантов будущего. Помоги ему выбрать верную грамматику для заклинания: „If I tell you what happens, it ... happen".',
      correctAnswer: '1',
      nextScreen  : 3,
      answers: [
        { id: '1', text: "won't"    },
        { id: '2', text: "doesn't"  },
        { id: '3', text: "didn't"   },
        { id: '4', text: "wouldn't" }
      ]
    },
    {
      id          : 3,
      corgiImage  : 'corgi-freddie.png',
      questionText: 'Корги Меркьюри виртуозно управляет временами. Какое слово пропущено в строке легендарной песни: «I ... it all, and I want it now»?',
      correctAnswer: '1',
      nextScreen  : 4,
      answers: [
        { id: '1', text: 'want'        },
        { id: '2', text: 'wanted'      },
        { id: '3', text: 'have wanted' },
        { id: '4', text: "'m wanting"  }
      ]
    }
  ],

  /* ====== РЕЗУЛЬТАТЫ ====== */
  results: {
    score3: 'Потрясающе! Ты настоящий знаток!',
    score2: 'Отличный результат!',
    score1: 'Неплохо, но есть куда расти!',
    score0: 'Попробуй ещё раз!'
  },

  /* ====== ФИНАЛЬНЫЙ ЭКРАН ====== */
  finalScreen: {
    namePlaceholder : 'Ваше имя',
    emailPlaceholder: 'Ваш e-mail',
    phonePlaceholder: '7 (900) 000-00-00',
    submitBtnText   : 'ОСТАВИТЬ ЗАЯВКУ',
    sendingBtnText  : 'Отправка...',
    successBtnText  : 'Спасибо! В ближайшее время мы свяжемся с Вами!',
    messengers: [
      { value: 'WhatsApp', text: 'WhatsApp' },
      { value: 'Telegram', text: 'Telegram' },
      { value: 'МАХ',      text: 'МАХ'      }
    ]
  }

};