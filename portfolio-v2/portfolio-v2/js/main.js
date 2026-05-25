/* ============================================
   main.js — site interactivity
   - Scroll reveal animations
   - Journey timeline tabs
   - Maze grid generation
   ============================================ */

(function () {
  'use strict';

  // ============ SCROLL REVEAL ANIMATIONS ============
  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll('section').forEach((section) => {
      section.classList.add('reveal');
      observer.observe(section);
    });
  }

  // ============ JOURNEY TIMELINE TABS ============
  const journeyData = {
    '2009': {
      icon: '🏫',
      year: '2009 — 2022',
      title: 'School in Dammam',
      body: 'Thirteen years at <strong>International Indian School Dammam</strong> in Saudi Arabia. K through 12 with a focus on mathematics, computer science, and the sciences — laying the foundation that would eventually pull me toward software engineering as a career.'
    },
    '2022': {
      icon: '🍁',
      year: '2022',
      title: 'Moved to Canada · Started at Dalhousie',
      body: 'Moved from Dammam to Halifax to begin my <strong>Bachelor of Applied Computer Science</strong> at Dalhousie University. New country, new city, and the start of a serious focus on full-stack software engineering as a career.'
    },
    '2023': {
      icon: '🤖',
      year: '2023',
      title: 'Led a robotics team to a working autonomous robot',
      body: 'Led a team of four to design, program, and deploy an <strong>autonomous maze-solving robot</strong> on the Thymio platform. Wrote real-time sensor fusion logic in Aseba and refined the pathfinding algorithm across iterations. My first experience owning the technical lead role on a real engineering deliverable.'
    },
    '2025': {
      icon: '🚀',
      year: '2025',
      title: 'Shipped MIIRA — production app, solo, for a client',
      body: 'Built and shipped <strong>MIIRA</strong>, a cross-platform matchmaking app for a real client. Sole developer across Android, iOS, Web, and Desktop — owning requirements, system design, RESTful API architecture, WebSocket chat, JWT auth, Flutter UI, and live deployment. The project that taught me what end-to-end ownership really looks like.'
    },
    '2026': {
      icon: '📊',
      year: '2026',
      title: 'Data quality dashboard + final year at Dalhousie',
      body: 'Building a <strong>data cleaning &amp; quality dashboard</strong> with CI/CD-integrated quality gates. Pandas pipelines on the back, React on the front. Finishing my final year at Dalhousie (graduating <strong>December 2026</strong>) and actively looking for engineering co-op &amp; full-time roles.'
    }
  };

  function initJourneyTabs() {
    const tabs = document.querySelectorAll('.journey-tab');
    const elements = {
      icon: document.getElementById('journeyIcon'),
      year: document.getElementById('journeyYear'),
      title: document.getElementById('journeyTitle'),
      body: document.getElementById('journeyBody')
    };

    if (!tabs.length || !elements.icon) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const data = journeyData[tab.dataset.year];
        if (!data) return;

        // Fade out, swap content, fade in
        Object.values(elements).forEach((el) => (el.style.opacity = '0'));

        setTimeout(() => {
          elements.icon.textContent = data.icon;
          elements.year.textContent = data.year;
          elements.title.textContent = data.title;
          elements.body.innerHTML = data.body;
          Object.values(elements).forEach((el) => {
            el.style.transition = 'opacity 0.3s';
            el.style.opacity = '1';
          });
        }, 150);
      });
    });
  }

  // ============ MAZE GRID ============
  const mazeData = [
    [3, 2, 1, 0, 0, 1, 0, 0],
    [0, 2, 1, 0, 1, 1, 0, 1],
    [0, 2, 2, 2, 2, 0, 0, 1],
    [1, 1, 1, 0, 2, 1, 1, 0],
    [0, 0, 0, 0, 2, 0, 0, 0],
    [0, 1, 1, 1, 2, 2, 2, 0],
    [0, 0, 0, 0, 1, 1, 2, 1],
    [0, 1, 0, 1, 0, 0, 2, 4]
  ];

  function initMazeGrid() {
    const maze = document.getElementById('mazeGrid');
    if (!maze) return;

    const cellClassMap = { 1: 'wall', 2: 'path', 3: 'start', 4: 'end' };

    mazeData.forEach((row) => {
      row.forEach((cell) => {
        const div = document.createElement('div');
        if (cellClassMap[cell]) div.className = cellClassMap[cell];
        maze.appendChild(div);
      });
    });
  }

  // ============ INIT ============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollReveal();
      initJourneyTabs();
      initMazeGrid();
    });
  } else {
    initScrollReveal();
    initJourneyTabs();
    initMazeGrid();
  }
})();
