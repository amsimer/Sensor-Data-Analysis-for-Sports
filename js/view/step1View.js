// View: renders Step 1 (data collection documentation). No calculations here.

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js';

const EMPTY_TEXT = 'To be filled in WRITTEN_ANSWERS.md';

export function bindStep1View(viewModel, container) {
  viewModel.subscribe((state) => {
    if (state.status === 'loading' || state.status === 'idle') {
      container.innerHTML = '<p class="status">Loading session documentation…</p>';
      return;
    }
    if (state.status === 'error') {
      container.innerHTML = '';
      const p = document.createElement('p');
      p.className = 'error';
      p.textContent = `Could not show Step 1: ${state.error}`;
      container.append(p);
      return;
    }

    container.innerHTML = '';
    for (const item of viewModel.step1Items) {
      const block = document.createElement('div');
      block.className = 'qa';

      const question = document.createElement('div');
      question.className = 'qa-question';
      question.innerHTML = marked.parseInline(item.question);

      const answer = document.createElement('div');
      answer.className = 'qa-answer';
      if (item.isEmpty) {
        answer.classList.add('qa-answer--empty');
        answer.textContent = item.missing
          ? `Question ${item.id} not found in WRITTEN_ANSWERS.md`
          : EMPTY_TEXT;
      } else {
        answer.innerHTML = marked.parse(item.answer);
      }

      block.append(question, answer);
      container.append(block);
    }
  });
}
