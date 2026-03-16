(function () {
  const refs = {
    enterBtn: document.getElementById('enterBtn'),
    content: document.getElementById('content'),
    startScreen: document.getElementById('startScreen'),
    audio: document.getElementById('romanticAudio'),
    unlockBtn: document.getElementById('unlockBtn'),
    lockStatus: document.getElementById('lockStatus'),
    finalMessage: document.getElementById('finalMessage'),
    audioToggle: document.getElementById('audioToggle'),
    scrollTopBtn: document.getElementById('scrollTopBtn'),
    tinyNote: document.getElementById('tinyNote'),
    starfield: document.querySelector('.starfield'),
    cardsWrap: document.querySelector('.cards-wrap')
  };

  const sections = {
    story: false,
    gallery: false,
    smallthings: false
  };

  const notes = {
    1: 'Aku suka gimana kamu selalu mau dengerin aku, bahkan saat aku lagi banyak unek-unek atau cerita yang mungkin ga selalu enak didengar. Kamu ga menghakimin, ga motong ceritaku, kamu cuma dengerin dengan sabar. Kadang cuma dengan didengar aja sama kamu, rasanya hati aku uda jauh lebih tenang.',
    2: 'Ada sesuatu dari cara kamu ngomong yang selalu bisa buat aku tenang. Bahkan saat aku lagi overthinking atau ngerasa ga baik-baik aja, kata-kata dari kamu seringkali cukup untuk buat semuanya lebih ringan.',
    3: 'Sama kamu rasanya seperti punya banyak peran dalam satu orang. Kadang kamu kaya temen yang bisa diajak bercanda, kadang seperti sahabat yang selalu ada untuk ngedengerin aku, kadang kaya keluarga yang buat aku merasa aman. Dan tentu aja, kamu juga seseorang yang sangat berarti dalam hidupku.',
    4: 'Salah satu hal yang paling aku rasain dari kamu adalah gimana kamu selalu berusaha prioritasin aku. Bahkan seringkali kamu dahuluin aku sebelum orang lain, bahkan sebelum diri kamu sendiri. Hal itu buat aku ngerasa sangat dihargai dan disayangi.'
  };

  const STORAGE_KEY = 'ruang-kenangan-progress';

  const saveProgress = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    } catch (error) {
      // localStorage tidak tersedia
    }
  };

  const updateUnlockStatus = () => {
    const canUnlock = sections.story && sections.gallery && sections.smallthings;

    refs.unlockBtn.disabled = !canUnlock;
    if (canUnlock) {
      refs.lockStatus.textContent = '🔓 Siap! Sekarang tekan untuk membuka Pesan Terakhir.';
      refs.lockStatus.style.color = '#C3A45E';
    }
  };

  const applyScrollButtonVisibility = () => {
    const shouldShow = window.scrollY > 280;
    refs.scrollTopBtn.classList.toggle('invisible', !shouldShow);
  };

  const playAudioWithGesture = () => {
    if (!refs.audio || !refs.audio.paused) return;
    const promise = refs.audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        // Autoplay denied; akan menyala setelah interaksi
      });
    }
  };

  refs.enterBtn.addEventListener('click', () => {
    refs.startScreen.classList.add('invisible');
    refs.content.classList.add('visible');
    playAudioWithGesture();
    refs.scrollTopBtn.classList.remove('invisible');
  });

  refs.audioToggle.addEventListener('click', () => {
    if (refs.audio.paused) {
      refs.audio.play();
      refs.audioToggle.textContent = 'Pause Musik';
    } else {
      refs.audio.pause();
      refs.audioToggle.textContent = 'Putar Musik';
    }
  });

  refs.scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => window.requestAnimationFrame(applyScrollButtonVisibility));
  window.addEventListener('keydown', playAudioWithGesture);

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      const key = entry.target.dataset.section;
      if (key && key in sections) {
        sections[key] = true;
        saveProgress();
        updateUnlockStatus();
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.22
  });

  document.querySelectorAll('.section').forEach(section => revealObserver.observe(section));

  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add('visible'), index * 200);
    });
  }, { root: null, threshold: 0.16 });

  document.querySelectorAll('.memory-card').forEach(card => galleryObserver.observe(card));

  refs.cardsWrap.addEventListener('click', (event) => {
    const button = event.target.closest('.tiny-card');
    if (!button) return;

    refs.cardsWrap.querySelectorAll('.tiny-card').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });

    button.classList.add('active');
    button.setAttribute('aria-expanded', 'true');

    const idx = button.dataset.idx;
    refs.tinyNote.textContent = notes[idx] || 'Terus ceritakan lebih banyak lagi, Yoel.';
  });

  refs.unlockBtn.addEventListener('click', () => {
    if (refs.unlockBtn.disabled) return;
    refs.finalMessage.classList.remove('invisible');
    refs.unlockBtn.textContent = 'Pesan Terakhir Sudah Dibuka';
    refs.unlockBtn.disabled = true;
    refs.lockStatus.textContent = '💖 Kamu berhasil sampai akhir!';
  });

  const restoreProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      Object.assign(sections, parsed);
      updateUnlockStatus();
    } catch (_) {
      // ignore malformed saved progress
    }
  };

  for (let i = 0; i < 33; i++) {
    const star = document.createElement('div');
    star.className = 'mini-star';
    const size = (Math.random() * 1.8 + 1).toFixed(2);
    const posX = (Math.random() * 100).toFixed(2);
    const delay = (Math.random() * 8).toFixed(2);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${posX}%`;
    star.style.animationDelay = `${delay}s`;
    star.style.animationDuration = `${(3 + Math.random() * 3).toFixed(2)}s`;
    refs.starfield.appendChild(star);
  }

  const heartsContainer = document.querySelector('.hearts-container');

  const spawnHeart = () => {
    const heart = document.createElement('div');
    const sizes = Math.random() * 16 + 20; // bigger hearts
    const left = Math.random() * 100;
    const drift = Math.floor(Math.random() * 160 - 80);
    const hue = Math.random();

    let className = 'heart primary';
    if (hue < 0.33) className = 'heart magenta';
    else if (hue < 0.66) className = 'heart pink';

    heart.className = className;
    heart.textContent = '♥';

    heart.style.fontSize = `${sizes}px`;
    heart.style.left = `${left}%`;
    heart.style.setProperty('--drift', `${drift}px`);
    heart.style.animationDuration = `${3.3 + Math.random() * 1.7}s`;

    heartsContainer.appendChild(heart);

    heart.addEventListener('animationend', () => heart.remove());
  };

  let heartInterval = null;

  const startOnEnter = () => {
    if (!heartsContainer.classList.contains('active')) {
      heartsContainer.classList.add('active');
      heartsContainer.style.opacity = '1';
      spawnHeart();
      heartInterval = setInterval(spawnHeart, 520);
    }
  };

  refs.enterBtn.addEventListener('click', startOnEnter);

  restoreProgress();
  applyScrollButtonVisibility();
})();