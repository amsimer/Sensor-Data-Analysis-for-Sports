// ViewModel: holds the page state and runs the Model in lab-step order.
// Views subscribe and re-render when the state changes. No DOM access here.

import { loadAnswers } from '../model/answers.js';

// The Step 1 items the handout asks to document, by their id in WRITTEN_ANSWERS.md.
const STEP1_IDS = ['1.1', '1.2', '1.3', '1.4'];

export class LabViewModel {
  constructor() {
    this.state = {
      status: 'idle',   // 'idle' | 'loading' | 'ready' | 'error'
      error: null,
      answers: new Map(),
    };
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener(this.state));
  }

  async load() {
    this.setState({ status: 'loading', error: null });
    try {
      const answers = await loadAnswers();
      this.setState({ status: 'ready', answers });
    } catch (err) {
      this.setState({ status: 'error', error: err.message });
    }
  }

  /** Step 1 items, ready to display: [{ id, question, answer, isEmpty }]. */
  get step1Items() {
    return STEP1_IDS.map((id) => {
      const item = this.state.answers.get(id);
      if (!item) {
        return { id, question: `Question ${id}`, answer: '', isEmpty: true, missing: true };
      }
      return { ...item, isEmpty: item.answer === '' };
    });
  }
}
