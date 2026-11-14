// View helper: renders question/answer blocks from WRITTEN_ANSWERS.md.

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js';

const EMPTY_TEXT = 'To be filled in WRITTEN_ANSWERS.md';

function answerBox(markdown, emptyText = EMPTY_TEXT) {
  const box = document.createElement('div');
  box.className = 'qa-answer';
  if (!markdown) {
    box.classList.add('qa-answer--empty');
    box.textContent = emptyText;
  } else {
    box.innerHTML = marked.parse(markdown);
  }
  return box;
}

/** Render a list of answer items (from LabViewModel.answerItems) into a fragment. */
export function renderAnswers(items) {
  const fragment = document.createDocumentFragment();
  for (const item of items) {
    const block = document.createElement('div');
    block.className = 'qa';

    const question = document.createElement('div');
    question.className = 'qa-question';
    question.innerHTML = marked.parseInline(item.question);
    block.append(question);

    if (item.missing) {
      block.append(answerBox('', `Question ${item.id} not found in WRITTEN_ANSWERS.md`));
    } else if (item.parts.length) {
      for (const part of item.parts) {
        const label = document.createElement('div');
        label.className = 'qa-part';
        label.textContent = part.label;
        block.append(label, answerBox(part.answer));
      }
    } else {
      block.append(answerBox(item.answer));
    }
    fragment.append(block);
  }
  return fragment;
}

/** Render the answers section for some ids, or a status/error message. */
export function renderAnswersInto(container, viewModel, state, ids) {
  container.innerHTML = '';
  if (state.answersStatus === 'error') {
    const p = document.createElement('p');
    p.className = 'error';
    p.textContent = `Could not load the written answers: ${state.answersError}`;
    container.append(p);
  } else if (state.answersStatus !== 'ready') {
    container.innerHTML = '<p class="status">Loading written answers…</p>';
  } else {
    container.append(renderAnswers(viewModel.answerItems(ids)));
  }
}
