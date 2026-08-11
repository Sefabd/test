// Yapay Zekâ Asistanı - Akıllı Kategori ve Öncelik Öneri Motoru

document.addEventListener('DOMContentLoaded', () => {
  bindAiListeners();
});

function bindAiListeners() {
  const modalDescInput = document.getElementById('complaint-description');
  const pageDescInput = document.getElementById('page-complaint-description');

  let debounceTimer;

  function handleInput(e, isPage = false) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      analyzeTextWithAI(e.target.value, isPage);
    }, 400);
  }

  if (modalDescInput) {
    modalDescInput.addEventListener('input', (e) => handleInput(e, false));
  }

  if (pageDescInput) {
    pageDescInput.addEventListener('input', (e) => handleInput(e, true));
  }
}

async function analyzeTextWithAI(text, isPage = false) {
  const containerId = isPage ? 'page-ai-suggestion-container' : 'ai-suggestion-container';
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!text || text.trim().length < 3) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  try {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: text })
    });

    const data = await res.json();

    if (data.success && data.analysis) {
      const { suggested_category_id, suggested_category_name, suggested_department_name, suggested_priority, confidence_score } = data.analysis;

      container.style.display = 'block';
      container.innerHTML = `
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 12px 16px; margin-top: 10px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #0369a1; font-size: 0.88rem;"><i class="fas fa-robot" style="color: #0284c7; margin-right: 4px;"></i> Yapay Zekâ Akıllı Öneri</strong>
            <span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 10px; font-weight: 700;">Güven: %${Math.round((confidence_score || 0.85) * 100)}</span>
          </div>
          <div style="font-size: 0.85rem; color: #0f172a; margin-bottom: 8px;">
            <strong>Önerilen Kategori:</strong> <span style="color: #0284c7; font-weight: 700;">${suggested_category_name || 'Genel'}</span> | 
            <strong>Birim:</strong> <strong>${suggested_department_name || 'Fen İşleri'}</strong> | 
            <strong>Öncelik:</strong> <span class="badge badge-yeni">${suggested_priority || 'Normal'}</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; background: #0284c7; color: white; border: none; font-weight: 600;" onclick="applyAiSuggestions(${suggested_category_id}, '${suggested_priority}', ${isPage})">
            <i class="fas fa-magic"></i> Önerileri Form Alanlarına Uygula
          </button>
        </div>
      `;

      // Set hidden fields
      const catField = document.getElementById(isPage ? 'page_ai_suggested_category_id' : 'ai_suggested_category_id');
      const prioField = document.getElementById(isPage ? 'page_ai_suggested_priority' : 'ai_suggested_priority');
      if (catField) catField.value = suggested_category_id || '';
      if (prioField) prioField.value = suggested_priority || 'Normal';
    }
  } catch (err) {
    console.log('AI analyze error:', err);
  }
}

function applyAiSuggestions(catId, priority, isPage = false) {
  const catSelect = document.getElementById(isPage ? 'page-complaint-category' : 'complaint-category');
  const urgencySelect = document.getElementById(isPage ? 'page-complaint-urgency' : 'complaint-urgency');

  if (catSelect && catId) catSelect.value = catId;
  if (urgencySelect && priority) urgencySelect.value = priority;

  if (typeof showToast === 'function') {
    showToast('🤖 Yapay zekâ önerileri forma uygulandı!', 'success');
  }
}
