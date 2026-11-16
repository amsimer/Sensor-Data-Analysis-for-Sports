// View: renders Step 5 (market and research context). All content comes from
// WRITTEN_ANSWERS.md through the ViewModel; no calculations here.

import { renderAnswersInto } from './answersView.js';
import { el, sub } from './dom.js';

const REFLECTION = { id: '5.3', min: 150, max: 250 };

export function bindStep5View(viewModel, container) {
  const study = el('div');
  const product = el('div');
  const reflection = el('div');
  const count = el('p', { class: 'word-count', 'aria-live': 'polite' });

  container.innerHTML = '';
  container.append(
    sub('5.1 Peer-reviewed study'), study,
    sub('5.2 Commercial product'), product,
    sub('5.3 Reflection'), reflection, count,
  );

  viewModel.subscribe((state) => {
    renderAnswersInto(study, viewModel, state, ['5.1', 'Q1', 'Q2', 'Q3']);
    renderAnswersInto(product, viewModel, state, ['5.2.1', '5.2.2', '5.2.3', '5.2.4', '5.2.5']);
    renderAnswersInto(reflection, viewModel, state, [REFLECTION.id]);

    if (state.answersStatus !== 'ready') {
      count.textContent = '';
      return;
    }
    const wc = viewModel.wordCountFor(REFLECTION.id, REFLECTION.min, REFLECTION.max);
    count.textContent = `${wc.words} words (required: ${wc.min}–${wc.max})`;
    count.classList.toggle('word-count--bad', !wc.ok);
  });
}
