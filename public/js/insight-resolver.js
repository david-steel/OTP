/**
 * Insight Resolver -- Interactive claim generation from scanner insights.
 *
 * Include this script on the scan-results page. It enhances insight cards
 * with "Resolve" buttons that let users address critical/warning insights,
 * generating new OOS claims from their resolutions.
 *
 * Expected DOM structure (each insight card):
 *   <div class="insight-card" data-insight-id="INS-001" data-severity="critical"
 *        data-title="..." data-description="..." data-recommendation="...">
 *     ...card content...
 *   </div>
 *
 * Expected page elements:
 *   #coordination-score       -- element showing the score number
 *   #coordination-grade       -- element showing the letter grade
 *   #oos-content-store        -- hidden textarea/input holding raw OOS markdown
 *   #resolved-counter         -- element showing "X of Y critical issues resolved"
 *   .score-breakdown-bar[data-dimension]  -- optional breakdown bar elements
 */

(function () {
  'use strict';

  // ---- State ----
  const state = {
    resolvedInsights: new Set(),
    totalActionable: 0,
    oosContent: '',
    currentScore: 0,
    currentGrade: '',
    claims: [],
  };

  // ---- Init ----
  function init() {
    // Load OOS content from the hidden store
    const oosStore = document.getElementById('oos-content-store');
    if (oosStore) {
      state.oosContent = oosStore.value || oosStore.textContent || '';
    }

    // Read current score
    const scoreEl = document.getElementById('coordination-score');
    if (scoreEl) {
      state.currentScore = parseInt(scoreEl.textContent, 10) || 0;
    }
    const gradeEl = document.getElementById('coordination-grade');
    if (gradeEl) {
      state.currentGrade = gradeEl.textContent.trim();
    }

    // Find all actionable insight cards (critical + warning)
    const cards = document.querySelectorAll('.insight-card[data-severity="critical"], .insight-card[data-severity="warning"]');
    state.totalActionable = cards.length;

    cards.forEach(function (card) {
      attachResolveButton(card);
    });

    updateResolvedCounter();
  }

  // ---- Attach Resolve Button to an Insight Card ----
  function attachResolveButton(card) {
    // Skip if already has a resolve button
    if (card.querySelector('.resolve-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'resolve-btn';
    btn.textContent = 'Resolve';
    btn.setAttribute('type', 'button');

    // Style the button inline (scan-results page may have its own styles, these are fallback)
    Object.assign(btn.style, {
      marginTop: '12px',
      padding: '8px 20px',
      backgroundColor: '#6366f1',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'background-color 0.2s',
    });

    btn.addEventListener('mouseenter', function () {
      btn.style.backgroundColor = '#4f46e5';
    });
    btn.addEventListener('mouseleave', function () {
      if (!card.classList.contains('insight-resolved')) {
        btn.style.backgroundColor = '#6366f1';
      }
    });

    btn.addEventListener('click', function () {
      showResolveForm(card, btn);
    });

    card.appendChild(btn);
  }

  // ---- Show the Inline Resolution Form ----
  function showResolveForm(card, triggerBtn) {
    // Don't show if already resolved
    if (state.resolvedInsights.has(card.dataset.insightId)) return;

    // Don't show if form already open
    if (card.querySelector('.resolve-form')) return;

    // Hide the trigger button
    triggerBtn.style.display = 'none';

    var recommendation = card.dataset.recommendation || '';
    var insightId = card.dataset.insightId || '';
    var insightTitle = card.dataset.title || card.querySelector('.insight-title')?.textContent || '';
    var insightDescription = card.dataset.description || '';

    var form = document.createElement('div');
    form.className = 'resolve-form';
    Object.assign(form.style, {
      marginTop: '12px',
      padding: '16px',
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(99, 102, 241, 0.2)',
    });

    form.innerHTML =
      '<label style="display:block;font-weight:600;margin-bottom:6px;color:#e2e8f0;font-size:14px;">' +
        'How do you want to handle this?' +
      '</label>' +
      '<textarea class="resolve-input" rows="3" style="' +
        'width:100%;padding:10px 12px;border:1px solid rgba(148,163,184,0.3);border-radius:6px;' +
        'font-size:14px;line-height:1.5;resize:vertical;background:#1e293b;color:#e2e8f0;' +
        'font-family:inherit;"' +
      '>' + escapeHtml(recommendation) + '</textarea>' +
      '<div style="display:flex;gap:8px;margin-top:10px;">' +
        '<button type="button" class="resolve-submit" style="' +
          'padding:8px 20px;background:#10b981;color:#fff;border:none;border-radius:6px;' +
          'cursor:pointer;font-size:14px;font-weight:600;transition:background-color 0.2s;' +
        '">Generate Claim</button>' +
        '<button type="button" class="resolve-cancel" style="' +
          'padding:8px 20px;background:transparent;color:#94a3b8;border:1px solid rgba(148,163,184,0.3);' +
          'border-radius:6px;cursor:pointer;font-size:14px;transition:background-color 0.2s;' +
        '">Cancel</button>' +
      '</div>';

    card.appendChild(form);

    // Focus the textarea
    var textarea = form.querySelector('.resolve-input');
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    // Cancel handler
    form.querySelector('.resolve-cancel').addEventListener('click', function () {
      form.remove();
      triggerBtn.style.display = '';
    });

    // Submit handler
    form.querySelector('.resolve-submit').addEventListener('click', function () {
      var resolution = textarea.value.trim();
      if (!resolution) {
        textarea.style.borderColor = '#ef4444';
        textarea.focus();
        return;
      }
      submitResolution(card, form, triggerBtn, {
        insight_id: insightId,
        insight_title: insightTitle,
        insight_description: insightDescription,
        resolution: resolution,
      });
    });

    // Ctrl/Cmd+Enter to submit
    textarea.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        form.querySelector('.resolve-submit').click();
      }
    });
  }

  // ---- Submit Resolution to API ----
  function submitResolution(card, form, triggerBtn, data) {
    var submitBtn = form.querySelector('.resolve-submit');
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Generating...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';

    var payload = {
      insight_id: data.insight_id,
      insight_title: data.insight_title,
      insight_description: data.insight_description,
      resolution: data.resolution,
      oos_content: state.oosContent,
    };

    fetch('/api/v1/scanner/resolve-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (err) {
            throw new Error(err.error?.message || 'Failed to resolve insight');
          });
        }
        return res.json();
      })
      .then(function (result) {
        // Update stored OOS content
        state.oosContent = result.updatedOosContent;
        var oosStore = document.getElementById('oos-content-store');
        if (oosStore) {
          if (oosStore.tagName === 'TEXTAREA' || oosStore.tagName === 'INPUT') {
            oosStore.value = result.updatedOosContent;
          } else {
            oosStore.textContent = result.updatedOosContent;
          }
        }

        // Track the resolved claim
        state.resolvedInsights.add(data.insight_id);
        state.claims.push(result.claim);

        // Show success in the card
        showResolutionSuccess(card, form, triggerBtn, result);

        // Update the score display
        recalculateScoreLocally();

        // Update the counter
        updateResolvedCounter();

        // Dispatch event for other page components that might want to react
        document.dispatchEvent(new CustomEvent('insight-resolved', {
          detail: {
            insightId: data.insight_id,
            claim: result.claim,
            resolvedCount: state.resolvedInsights.size,
            totalActionable: state.totalActionable,
          },
        }));
      })
      .catch(function (err) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';

        var errorEl = form.querySelector('.resolve-error');
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = 'resolve-error';
          Object.assign(errorEl.style, {
            color: '#ef4444',
            fontSize: '13px',
            marginTop: '8px',
          });
          form.appendChild(errorEl);
        }
        errorEl.textContent = err.message || 'Something went wrong. Try again.';
      });
  }

  // ---- Show Success State After Resolution ----
  function showResolutionSuccess(card, form, triggerBtn, result) {
    // Remove the form
    form.remove();

    // Mark the card as resolved
    card.classList.add('insight-resolved');
    Object.assign(card.style, {
      borderColor: 'rgba(16, 185, 129, 0.4)',
      opacity: '0.85',
    });

    // Remove the trigger button
    triggerBtn.remove();

    // Add the new claim display
    var claim = result.claim;
    var successEl = document.createElement('div');
    successEl.className = 'resolve-success';
    Object.assign(successEl.style, {
      marginTop: '12px',
      padding: '12px 16px',
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      borderRadius: '8px',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      fontSize: '13px',
      lineHeight: '1.6',
    });

    successEl.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
        '<span style="color:#10b981;font-weight:700;font-size:14px;">Resolved</span>' +
        '<span style="color:#64748b;font-size:12px;">New claim added to OOS</span>' +
      '</div>' +
      '<div style="color:#94a3b8;">' +
        '<div><strong style="color:#e2e8f0;">[' + escapeHtml(claim.claimId) + ']</strong> ' +
          '<span style="color:#6366f1;">' + escapeHtml(claim.section) + '</span></div>' +
        '<div style="margin-top:4px;"><strong>Rule:</strong> ' + escapeHtml(claim.rule) + '</div>' +
        '<div style="margin-top:2px;color:#64748b;"><strong>Why:</strong> ' + escapeHtml(claim.why) + '</div>' +
      '</div>';

    card.appendChild(successEl);

    // Add a resolved badge near the severity indicator if one exists
    var severityEl = card.querySelector('.insight-severity');
    if (severityEl) {
      var badge = document.createElement('span');
      badge.textContent = 'RESOLVED';
      Object.assign(badge.style, {
        marginLeft: '8px',
        padding: '2px 8px',
        backgroundColor: '#10b981',
        color: '#fff',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.5px',
      });
      severityEl.parentNode.insertBefore(badge, severityEl.nextSibling);
    }
  }

  // ---- Recalculate Score Locally ----
  // Approximation: each resolved critical insight adds ~8 points, each warning adds ~4
  // Capped at 100. This gives instant feedback; the real score comes from a full re-scan.
  function recalculateScoreLocally() {
    var resolvedCards = document.querySelectorAll('.insight-card.insight-resolved');
    var criticalResolved = 0;
    var warningResolved = 0;

    resolvedCards.forEach(function (card) {
      if (card.dataset.severity === 'critical') criticalResolved++;
      if (card.dataset.severity === 'warning') warningResolved++;
    });

    // Base score from the original scan
    var baseScore = parseInt(document.getElementById('coordination-score')?.dataset.baseScore || '0', 10) || state.currentScore;
    var bonus = (criticalResolved * 8) + (warningResolved * 4);
    var newScore = Math.min(100, baseScore + bonus);
    var newGrade = newScore >= 80 ? 'A' : newScore >= 65 ? 'B' : newScore >= 50 ? 'C' : newScore >= 35 ? 'D' : 'F';

    state.currentScore = newScore;
    state.currentGrade = newGrade;

    // Animate the score update
    var scoreEl = document.getElementById('coordination-score');
    if (scoreEl) {
      // Save original base score on first update
      if (!scoreEl.dataset.baseScore) {
        scoreEl.dataset.baseScore = scoreEl.textContent.trim();
      }
      animateNumber(scoreEl, parseInt(scoreEl.textContent, 10), newScore);
    }

    var gradeEl = document.getElementById('coordination-grade');
    if (gradeEl) {
      gradeEl.textContent = newGrade;
      // Flash the grade
      gradeEl.style.transition = 'color 0.3s';
      gradeEl.style.color = '#10b981';
      setTimeout(function () {
        gradeEl.style.color = '';
      }, 1500);
    }
  }

  // ---- Update Resolved Counter ----
  function updateResolvedCounter() {
    var counterEl = document.getElementById('resolved-counter');
    if (!counterEl) {
      // Try to create one if there's a suitable parent
      var scoreSection = document.querySelector('.score-section, .scan-results-header');
      if (scoreSection) {
        counterEl = document.createElement('div');
        counterEl.id = 'resolved-counter';
        Object.assign(counterEl.style, {
          fontSize: '14px',
          color: '#94a3b8',
          marginTop: '8px',
        });
        scoreSection.appendChild(counterEl);
      }
    }

    if (counterEl) {
      var resolved = state.resolvedInsights.size;
      var total = state.totalActionable;

      if (resolved === 0) {
        counterEl.textContent = total + ' issue' + (total !== 1 ? 's' : '') + ' to resolve';
        counterEl.style.color = '#94a3b8';
      } else if (resolved < total) {
        counterEl.textContent = resolved + ' of ' + total + ' issues resolved';
        counterEl.style.color = '#f59e0b';
      } else {
        counterEl.textContent = 'All ' + total + ' issues resolved';
        counterEl.style.color = '#10b981';
        counterEl.style.fontWeight = '600';
      }
    }
  }

  // ---- Animate Number Transition ----
  function animateNumber(el, from, to) {
    var duration = 600;
    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(from + (to - from) * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  // ---- HTML Escape ----
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  }

  // ---- Public API ----
  // Expose for external use by the scan-results page
  window.InsightResolver = {
    init: init,
    getState: function () {
      return {
        resolvedCount: state.resolvedInsights.size,
        totalActionable: state.totalActionable,
        resolvedInsightIds: Array.from(state.resolvedInsights),
        currentScore: state.currentScore,
        currentGrade: state.currentGrade,
        oosContent: state.oosContent,
        claims: state.claims.slice(),
      };
    },
    // Allow the scan-results page to set initial OOS content programmatically
    setOosContent: function (content) {
      state.oosContent = content;
    },
    // Allow setting the initial score (e.g., from scan result data)
    setInitialScore: function (score, grade) {
      state.currentScore = score;
      state.currentGrade = grade || '';
      var scoreEl = document.getElementById('coordination-score');
      if (scoreEl && !scoreEl.dataset.baseScore) {
        scoreEl.dataset.baseScore = String(score);
      }
    },
    // Re-scan the DOM for new insight cards (useful if cards are added dynamically)
    refresh: function () {
      var cards = document.querySelectorAll('.insight-card[data-severity="critical"], .insight-card[data-severity="warning"]');
      state.totalActionable = cards.length;
      cards.forEach(function (card) {
        if (!state.resolvedInsights.has(card.dataset.insightId)) {
          attachResolveButton(card);
        }
      });
      updateResolvedCounter();
    },
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
