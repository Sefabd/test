// Yapay Zekâ Asistanı - Akıllı Başlık, Kategori, Birim ve Öncelik Otomatik Doldurma Motoru (Bulancak 153)

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
      analyzeTextWithAI(e.target.value, isPage, true);
    }, 1500); // 1.5s Debounce
  }

  function handleBlur(e, isPage = false) {
    clearTimeout(debounceTimer);
    if (e.target.value && e.target.value.trim().length >= 5) {
      analyzeTextWithAI(e.target.value, isPage, true);
    }
  }

  if (modalDescInput) {
    modalDescInput.addEventListener('input', (e) => handleInput(e, false));
    modalDescInput.addEventListener('blur', (e) => handleBlur(e, false));
  }

  if (pageDescInput) {
    pageDescInput.addEventListener('input', (e) => handleInput(e, true));
    pageDescInput.addEventListener('blur', (e) => handleBlur(e, true));
  }
}

async function analyzeTextWithAI(text, isPage = false, autoApply = false) {
  const containerId = isPage ? 'page-ai-suggestion-container' : 'ai-suggestion-container';
  const container = document.getElementById(containerId);

  if (!text || text.trim().length < 5) {
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
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
      const { generated_title, suggested_category_id, suggested_category_name, suggested_department_id, suggested_department_name, suggested_priority, confidence_score } = data.analysis;

      // Auto-fill form fields
      if (autoApply) {
        applyAiSuggestionsDirect(generated_title, suggested_department_id || 1, suggested_category_id, suggested_priority || 'Normal', isPage);
      }

      if (container) {
        container.style.display = 'block';
        container.innerHTML = `
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 10px 14px; margin-top: 8px; margin-bottom: 12px; animation: fadeIn 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: #15803d; font-size: 0.85rem;"><i class="fas fa-wand-magic-sparkles" style="color: #16a34a; margin-right: 4px;"></i> Yapay Zekâ Otomatik Doldurdu</strong>
              <span style="font-size: 0.72rem; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 10px; font-weight: 700;">Doğruluk: %${Math.round((confidence_score || 0.90) * 100)}</span>
            </div>
            <div style="font-size: 0.82rem; color: #1e293b;">
              <strong>Önerilen Başlık:</strong> <span style="color: #0f766e; font-weight: 600;">${generated_title || 'Otomatik Belirlendi'}</span><br>
              <strong>Birim:</strong> <span style="color: #15803d; font-weight: 700;">${suggested_department_name || 'Fen İşleri'}</span> | 
              <strong>Kategori:</strong> <strong>${suggested_category_name || 'Genel'}</strong> | 
              <strong>Aciliyet:</strong> <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700;">${suggested_priority || 'Normal'}</span>
            </div>
          </div>
        `;
      }

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

function applyAiSuggestionsDirect(title, deptId, catId, priority, isPage = false) {
  const titleInput = document.getElementById(isPage ? 'page-complaint-title' : 'complaint-title');
  const deptSelect = document.getElementById(isPage ? 'page-complaint-department' : 'complaint-department');
  const catSelect = document.getElementById(isPage ? 'page-complaint-category' : 'complaint-category');
  const urgencySelect = document.getElementById(isPage ? 'page-complaint-urgency' : 'complaint-urgency');

  // 1. Auto-fill Title if empty or was previously auto-filled
  if (titleInput && (!titleInput.value || titleInput.value.trim() === '' || titleInput.dataset.aiGenerated === 'true')) {
    if (title) {
      titleInput.value = title;
      titleInput.dataset.aiGenerated = 'true';
    }
  }

  // 2. Select Department and populate categories
  if (deptSelect && deptId) {
    deptSelect.value = deptId;
    deptSelect.dispatchEvent(new Event('change'));
  }

  // 3. Select Category & Urgency
  setTimeout(() => {
    if (catSelect && catId) {
      catSelect.value = catId;
      catSelect.dispatchEvent(new Event('change'));
    }
    if (urgencySelect && priority) {
      urgencySelect.value = priority;
    }
  }, 100);
}

function applyAiSuggestions(deptId, catId, priority, isPage = false) {
  applyAiSuggestionsDirect(null, deptId, catId, priority, isPage);
  if (typeof Swal !== 'undefined') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
    Toast.fire({
      icon: 'success',
      title: 'Öneriler forma uygulandı'
    });
  } else if (typeof showToast === 'function') {
    showToast('🤖 Yapay zekâ önerileri forma uygulandı!', 'success');
  }
}
