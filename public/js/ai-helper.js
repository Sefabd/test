// Real-time AI Assistant Handler for Municipal Complaint System

let aiDebounceTimer = null;

function initAiAssistant() {
  const descInput = document.getElementById('complaint-description');
  const titleInput = document.getElementById('complaint-title');

  if (!descInput) return;

  const triggerAnalysis = () => {
    clearTimeout(aiDebounceTimer);
    aiDebounceTimer = setTimeout(runAiAnalysis, 600);
  };

  descInput.addEventListener('input', triggerAnalysis);
  if (titleInput) titleInput.addEventListener('input', triggerAnalysis);
}

async function runAiAnalysis() {
  const title = document.getElementById('complaint-title')?.value || '';
  const description = document.getElementById('complaint-description')?.value || '';
  const neighborhoodId = document.getElementById('complaint-neighborhood')?.value || '';
  const suggestionContainer = document.getElementById('ai-suggestion-container');

  if (!suggestionContainer) return;

  if (description.trim().length < 10) {
    suggestionContainer.style.display = 'none';
    return;
  }

  try {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        neighborhood_id: neighborhoodId
      })
    });

    const data = await res.json();

    if (data.success && data.analysis) {
      renderAiSuggestions(data.analysis);
    }
  } catch (err) {
    console.error('AI Analysis failed:', err);
  }
}

function renderAiSuggestions(analysis) {
  const container = document.getElementById('ai-suggestion-container');
  if (!container) return;

  let duplicateHtml = '';
  if (analysis.duplicate_detected && analysis.similar_complaints.length > 0) {
    duplicateHtml = `
      <div style="margin-top: 8px; padding: 10px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffeba2;">
        <strong style="color: #856404;">⚠️ Dikkat: Aynı Mahallede Benzer Şikâyet Bulundu!</strong>
        <ul style="margin-left: 20px; font-size: 0.85rem; color: #856404;">
          ${analysis.similar_complaints.map(c => `<li>Takip No: <strong>${c.tracking_code}</strong> - ${c.title} (${c.status})</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let warningHtml = '';
  if (analysis.is_flagged) {
    warningHtml = `
      <div style="color: #dc3545; font-size: 0.85rem; font-weight: 600;">
        🚫 Uyarı: Metinde uygunsuz veya hakaret içeren ifadeler tespit edildi.
      </div>
    `;
  }

  container.innerHTML = `
    <div class="ai-suggestion-box">
      <div class="ai-header">
        <i class="fas fa-robot"></i> Yapay Zekâ Akıllı Analiz Önerisi
        <span style="margin-left: auto; font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px;">Güven Skoru: %95</span>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
        <div><strong>Önerilen Kategori:</strong> ${analysis.suggested_category_name}</div>
        <div><strong>Sorumlu Birim:</strong> ${analysis.suggested_department_name}</div>
        <div><strong>Önerilen Öncelik:</strong> <span class="badge badge-yeni">${analysis.suggested_priority}</span></div>
        <div><strong>Duygu Analizi:</strong> ${analysis.sentiment}</div>
      </div>

      ${warningHtml}
      ${duplicateHtml}

      <div style="margin-top: 10px; text-align: right;">
        <button type="button" class="btn btn-sm btn-primary" onclick="applyAiSuggestions(${analysis.suggested_category_id}, '${analysis.suggested_priority}', ${analysis.suggested_department_id}, '${analysis.sentiment}', ${analysis.is_flagged ? 1 : 0})">
          <i class="fas fa-magic"></i> Önerileri Forma Uygula
        </button>
      </div>
    </div>
  `;

  container.style.display = 'block';
}

function applyAiSuggestions(catId, priority, deptId, sentiment, isFlagged) {
  const categorySelect = document.getElementById('complaint-category');
  const urgencySelect = document.getElementById('complaint-urgency');

  if (categorySelect) categorySelect.value = catId;
  if (urgencySelect) urgencySelect.value = priority;

  // Hidden AI metadata inputs
  document.getElementById('ai_suggested_category_id').value = catId;
  document.getElementById('ai_suggested_dept_id').value = deptId;
  document.getElementById('ai_suggested_priority').value = priority;
  document.getElementById('ai_sentiment').value = sentiment;
  document.getElementById('ai_flagged').value = isFlagged;

  showToast('Yapay zekâ önerileri forma başarıyla uygulandı.', 'info');
}

// Auto init when script loads
document.addEventListener('DOMContentLoaded', initAiAssistant);
