// View: renders Step 1 (data collection documentation). No calculations here.

import { renderAnswersInto } from './answersView.js';

const STEP1_IDS = ['1.1', '1.2', '1.3', '1.4'];

export function bindStep1View(viewModel, container) {
  viewModel.subscribe((state) => renderAnswersInto(container, viewModel, state, STEP1_IDS));
}
