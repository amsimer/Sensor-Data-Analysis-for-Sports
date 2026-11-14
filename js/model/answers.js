// Model: reads WRITTEN_ANSWERS.md and splits it into questions and answers.
// Pure functions only (no DOM). Questions are found by their bold id,
// e.g. "**1.2 Phone position:** ..." -> id "1.2".
// A question may have sub-items ("- Missing rows:" followed by "Answer:"),
// which become `parts`.

const QUESTION_LINE = /^\*\*(\d+\.\d+|Q\d+)\b/;   // **1.1 ...  /  **Q1.** ...
const PART_LINE = /^-\s+(.+?):\s*$/;                 // - Missing rows:
const ANSWER_LINE = /^\s*Answer:\s*(.*)$/;
const SECTION_BREAK = /^(#{1,6}\s|---\s*$)/;          // headings and rules end an answer

// Remove the common leading indentation, then trim blank lines.
function dedent(lines) {
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(cut)).join('\n').trim();
}

/**
 * Parse the markdown text into a Map: id -> { id, question, answer, parts }.
 * `question` is the question line (markdown); `answer` is the answer text
 * (markdown) or "" when empty; `parts` is [{ label, answer }] for questions
 * with sub-items (empty array otherwise).
 */
export function parseAnswers(markdown) {
  const answers = new Map();
  let current = null;   // question being read
  let target = null;    // the object whose "Answer:" block is being read (question or part)
  let capturing = false;

  const closeTarget = () => {
    if (target) target.answer = dedent(target.lines);
    target = null;
    capturing = false;
  };
  const finish = () => {
    closeTarget();
    if (current) {
      for (const p of current.parts) delete p.lines;
      delete current.lines;
      answers.set(current.id, current);
    }
    current = null;
  };

  for (const line of markdown.split(/\r?\n/)) {
    const q = line.match(QUESTION_LINE);
    if (q) {
      finish();
      current = { id: q[1], question: line.trim(), answer: '', parts: [], lines: [] };
      target = current;
      continue;
    }
    if (SECTION_BREAK.test(line)) {
      finish();
      continue;
    }
    if (!current) continue;

    const part = line.match(PART_LINE);
    if (part) {
      closeTarget();
      const p = { label: part[1], answer: '', lines: [] };
      current.parts.push(p);
      target = p;
      continue;
    }

    const a = line.match(ANSWER_LINE);
    if (a && !capturing) {
      capturing = true;
      if (a[1]) target.lines.push(a[1]);
    } else if (capturing) {
      target.lines.push(line);
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
