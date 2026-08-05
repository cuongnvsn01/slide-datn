const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const counter = document.getElementById('counter');
const progressBar = document.getElementById('progressBar');
const notesPanel = document.getElementById('notesPanel');
const notesText = document.getElementById('notesText');
const notesBtn = document.getElementById('notesBtn');
const closeNotes = document.getElementById('closeNotes');
const overview = document.getElementById('overview');
const overviewBtn = document.getElementById('overviewBtn');
const closeOverview = document.getElementById('closeOverview');
const overviewGrid = document.getElementById('overviewGrid');
const themeBtn = document.getElementById('themeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

let current = 0;

function render() {
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === current);
  });
  counter.textContent = `Slide ${current + 1} / ${slides.length}`;
  progressBar.style.width = `${((current + 1) / slides.length) * 100}%`;
  notesText.textContent = slides[current].dataset.notes || 'Chưa có ghi chú cho slide này.';
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === slides.length - 1;
}

function goTo(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  render();
}

function next() {
  goTo(current + 1);
}

function prev() {
  goTo(current - 1);
}

function buildOverview() {
  overviewGrid.innerHTML = '';
  slides.forEach((slide, index) => {
    const card = document.createElement('button');
    card.className = 'overview-card';
    card.innerHTML = `<b>${String(index + 1).padStart(2, '0')}</b><span>${slide.dataset.title || slide.querySelector('h2,h1')?.textContent || 'Slide'}</span>`;
    card.addEventListener('click', () => {
      overview.classList.remove('open');
      goTo(index);
    });
    overviewGrid.appendChild(card);
  });
}

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') next();
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') prev();
  if (event.key.toLowerCase() === 'n') notesPanel.classList.toggle('open');
  if (event.key.toLowerCase() === 'o') overview.classList.toggle('open');
  if (event.key === 'Escape') {
    notesPanel.classList.remove('open');
    overview.classList.remove('open');
  }
});

notesBtn.addEventListener('click', () => notesPanel.classList.toggle('open'));
closeNotes.addEventListener('click', () => notesPanel.classList.remove('open'));
overviewBtn.addEventListener('click', () => overview.classList.add('open'));
closeOverview.addEventListener('click', () => overview.classList.remove('open'));

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeBtn.textContent = document.body.classList.contains('dark') ? '☾' : '☀';
});

fullscreenBtn.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen().catch(() => {});
  } else {
    await document.exitFullscreen().catch(() => {});
  }
});

buildOverview();
render();
