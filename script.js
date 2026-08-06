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
  if (document.querySelector('.diagram-modal-overlay.active')) {
    if (event.key === 'Escape') closeDiagramModal();
    return;
  }
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

/* Diagram Interactive Zoom Modal Engine */
let modalScale = 1;
let modalPanX = 0;
let modalPanY = 0;
let isDragging = false;
let startMouseX = 0;
let startMouseY = 0;

function createDiagramModalDOM() {
  if (document.getElementById('diagramModal')) return;

  const modalHtml = `
    <div id="diagramModal" class="diagram-modal-overlay">
      <div class="diagram-modal-header">
        <div id="diagramModalTitle" class="diagram-modal-title">Xem sơ đồ hệ thống</div>
        <div class="diagram-modal-controls">
          <span id="modalScaleIndicator" class="modal-scale-indicator">100%</span>
          <button id="modalZoomIn" class="modal-control-btn" title="Phóng to (+)">🔍 +</button>
          <button id="modalZoomOut" class="modal-control-btn" title="Thu nhỏ (-)">🔍 -</button>
          <button id="modalReset" class="modal-control-btn" title="Đặt lại (0)">🔄 Đặt lại</button>
          <button id="modalClose" class="modal-control-btn btn-close" title="Đóng (ESC)">✕ Đóng</button>
        </div>
      </div>
      <div id="diagramModalBody" class="diagram-modal-body">
        <img id="diagramModalImg" class="diagram-modal-img" src="" alt="Sơ đồ" />
        <div class="diagram-modal-hint">💡 Lăn chuột để Phóng to/Thu nhỏ • Kéo chuột để Di chuyển • ESC để Đóng</div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const body = document.getElementById('diagramModalBody');

  document.getElementById('modalClose').addEventListener('click', closeDiagramModal);
  document.getElementById('modalReset').addEventListener('click', resetDiagramTransform);
  document.getElementById('modalZoomIn').addEventListener('click', () => adjustScale(0.25));
  document.getElementById('modalZoomOut').addEventListener('click', () => adjustScale(-0.25));

  body.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    adjustScale(delta);
  }, { passive: false });

  body.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startMouseX = e.clientX - modalPanX;
    startMouseY = e.clientY - modalPanY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    modalPanX = e.clientX - startMouseX;
    modalPanY = e.clientY - startMouseY;
    updateDiagramTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

function openDiagramModal(src, title) {
  createDiagramModalDOM();
  const modal = document.getElementById('diagramModal');
  const modalImg = document.getElementById('diagramModalImg');
  const modalTitle = document.getElementById('diagramModalTitle');

  modalImg.src = src;
  modalTitle.textContent = title || 'Sơ đồ hệ thống SparkleBooth';
  resetDiagramTransform();

  modal.classList.add('active');
}

function closeDiagramModal() {
  const modal = document.getElementById('diagramModal');
  if (modal) modal.classList.remove('active');
}

function resetDiagramTransform() {
  modalScale = 1;
  modalPanX = 0;
  modalPanY = 0;
  updateDiagramTransform();
}

function adjustScale(delta) {
  modalScale = Math.max(0.5, Math.min(4.5, modalScale + delta));
  updateDiagramTransform();
}

function updateDiagramTransform() {
  const img = document.getElementById('diagramModalImg');
  const indicator = document.getElementById('modalScaleIndicator');
  if (img) {
    img.style.transform = `translate(${modalPanX}px, ${modalPanY}px) scale(${modalScale})`;
  }
  if (indicator) {
    indicator.textContent = `${Math.round(modalScale * 100)}%`;
  }
}

function bindDiagramEvents() {
  document.querySelectorAll('.diagram-card').forEach((card) => {
    const img = card.querySelector('.diagram-img-wrap img');
    const zoomBtn = card.querySelector('.zoom-btn');
    const titleEl = card.querySelector('.diagram-title');
    const titleText = titleEl ? titleEl.textContent : 'Sơ đồ hệ thống';

    if (zoomBtn && img) {
      zoomBtn.addEventListener('click', () => openDiagramModal(img.src, titleText));
    }
    if (img) {
      img.parentElement.addEventListener('click', () => openDiagramModal(img.src, titleText));
    }
  });
}

buildOverview();
render();
createDiagramModalDOM();
bindDiagramEvents();
