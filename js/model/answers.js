// Model: reads WRITTEN_ANSWERS.md and splits it into questions and answers.
// Pure functions only (no DOM). Questions are found by their bold id,
// e.g. "**1.2 Phone position:** ..." -> id "1.2".

const QUESTION_LINE = /^\*\*(\d+\.\d+|Q\d+)\b/;   // **1.1 ...  /  **Q1.** ...
const ANSWER_LINE = /^\s*Answer:\s*(.*)$/;
const SECTION_BREAK = /^(#{1,6}\s|---\s*$)/;          // headings and rules end an answer

/**
 * Parse the markdown text into a Map: id -> { id, question, answer }.
 * `question` is the question line (markdown); `answer` is the trimmed answer
 * text (markdown), or "" when the student has not written anything yet.
 */
export function parseAnswers(markdown) {
  const answers = new Map();
  let current = null;      // question being read
  let capturing = false;   // inside its "Answer:" block

  const finish = () => {
    if (current) {
      current.answer = current.answerLines.join('\n').trim();
      delete current.answerLines;
      answers.set(current.id, current);
    }
    current = null;
    capturing = false;
  };

  for (const line of markdown.split(/\r?\n/)) {
    const q = line.match(QUESTION_LINE);
    if (q) {
      finish();
      current = { id: q[1], question: line.trim(), answerLines: [] };
      continue;
    }
    if (SECTION_BREAK.test(line)) {
      finish();
      continue;
    }
    if (!current) continue;

    const a = line.match(ANSWER_LINE);
    if (a && !capturing) {
      capturing = true;
      if (a[1]) current.answerLines.push(a[1]);
    } else if (capturing) {
      current.answerLines.push(line);
    }
  }
  finish();
  return answers;
}

/** Fetch WRITTEN_ANSWERS.md (no-cache, so edits show on reload) and parse it. */
export async function loadAnswers(url = 'WRITTEN_ANSWERS.md') {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Could not load ${url} (HTTP ${response.status}).`);
  }
  return parseAnswers(await response.text());
}
