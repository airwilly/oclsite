/* ============================================================
   js/games.js
   Fetches data/Games.MD, parses it into HTML, and injects it
   into pages/games.html.

   Markdown features this parser handles:
     Block-level:
       # Heading 1    — skipped (page has its own heading)
       ## Heading 2   — rendered as <h3>
       ---            — <hr> separator
       | table |      — <table> with thead/tbody
       > blockquote   — <blockquote>
       - item         — <ul> unordered list
       1. item        — <ol> ordered list
       plain text     — <p> paragraph
     Inline:
       **bold**       — <strong>

   NOTE: fetch() requires a web server. Open via VS Code Live Server,
   not by double-clicking the HTML file (file:// won't work).
   ============================================================ */

const GAMES_PATH = '../data/Games.MD';


/* ------------------------------------------------------------
   init()
   Fetches the games file and triggers parsing and rendering.
   ------------------------------------------------------------ */
async function init() {
  try {
    const text = await fetch(GAMES_PATH).then(res => res.text());
    const html  = parseMarkdown(text);
    document.getElementById('games-content').innerHTML = html;
  } catch (err) {
    showError(err);
  }
}


/* ------------------------------------------------------------
   parseMarkdown(text)
   Converts a Markdown string to an HTML string by walking
   through each line and detecting what block type it begins.

   Most blocks are single lines (headings, hr, paragraphs).
   Multi-line blocks (tables, lists, blockquotes) consume lines
   until the pattern no longer matches, then continue from there.
   ------------------------------------------------------------ */
function parseMarkdown(text) {
  const lines = text.split('\n');
  let html = '';
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    /* ── Blank line: nothing to emit ── */
    if (!trimmed) {
      i++;
      continue;
    }

    /* ── H1 heading (#): skip — the page has its own title ── */
    if (/^#(?!#)/.test(trimmed)) {
      i++;
      continue;
    }

    /* ── H2 heading (##): render as <h3> ──
       The page's own section label is <h2>, so game titles sit
       one level below in the document outline at <h3>. */
    if (trimmed.startsWith('## ')) {
      html += `<h3>${parseInline(trimmed.slice(3))}</h3>`;
      i++;
      continue;
    }

    /* ── Horizontal rule (---) ── */
    if (trimmed === '---') {
      html += '<hr>';
      i++;
      continue;
    }

    /* ── Table: lines that start with | ──
       Collect all consecutive pipe-prefixed lines, then build
       a single table element from them. */
    if (trimmed.startsWith('|')) {
      const block = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        block.push(lines[i].trim());
        i++;
      }
      html += parseTable(block);
      continue;
    }

    /* ── Blockquote: lines that start with > ──
       Collect consecutive > lines into one <blockquote>. */
    if (trimmed.startsWith('> ')) {
      const parts = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        parts.push(lines[i].trim().slice(2)); /* strip the "> " prefix */
        i++;
      }
      html += `<blockquote><p>${parseInline(parts.join(' '))}</p></blockquote>`;
      continue;
    }

    /* ── Unordered list: lines that start with "- " ── */
    if (trimmed.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2)); /* strip the "- " prefix */
        i++;
      }
      html += '<ul>'
        + items.map(item => `<li>${parseInline(item)}</li>`).join('')
        + '</ul>';
      continue;
    }

    /* ── Ordered list: lines that start with "1. " etc. ── */
    if (/^\d+\.\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      html += '<ol>'
        + items.map(item => `<li>${parseInline(item)}</li>`).join('')
        + '</ol>';
      continue;
    }

    /* ── Paragraph: anything that didn't match above ── */
    html += `<p>${parseInline(trimmed)}</p>`;
    i++;
  }

  return html;
}


/* ------------------------------------------------------------
   parseTable(lines)
   Converts an array of pipe-delimited Markdown table lines
   into an HTML <table> wrapped in a scroll container.

   The first non-separator row becomes <thead>.
   Separator rows like |---|---| are detected and skipped.

   How the separator check works:
     Strip all whitespace from the line, then test if it matches
     the pattern: pipe, then one-or-more groups of (dashes/colons
     followed by a pipe). E.g. |---------|--------| passes.
   ------------------------------------------------------------ */
function parseTable(lines) {
  let html = '<div class="table-wrapper"><table class="rules-table">';
  let headerDone = false;

  for (const line of lines) {
    /* Detect separator rows (e.g. |---|---|) */
    if (/^\|([-:]+\|)+$/.test(line.replace(/\s/g, ''))) continue;

    /* Split on | and trim whitespace from each cell.
       slice(1, -1) removes the empty strings that result from
       the leading and trailing | characters. */
    const cells = line.split('|').slice(1, -1).map(c => c.trim());

    if (!headerDone) {
      html += '<thead><tr>'
        + cells.map(c => `<th>${parseInline(c)}</th>`).join('')
        + '</tr></thead><tbody>';
      headerDone = true;
    } else {
      html += '<tr>'
        + cells.map(c => `<td>${parseInline(c)}</td>`).join('')
        + '</tr>';
    }
  }

  html += '</tbody></table></div>';
  return html;
}


/* ------------------------------------------------------------
   parseInline(text)
   Applies inline Markdown formatting within a single text node.
   **bold** → <strong>bold</strong>
   ------------------------------------------------------------ */
function parseInline(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}


/* ------------------------------------------------------------
   showError(err)
   Replaces the content area with an error message when the
   fetch fails (most commonly when running via file://).
   ------------------------------------------------------------ */
function showError(err) {
  const el = document.getElementById('games-content');
  el.innerHTML =
    '<p class="error-message">' +
      'Could not load games data. ' +
      'Open this page through a local web server ' +
      '(e.g. VS Code <strong>Live Server</strong>) ' +
      'rather than directly from the file system.' +
    '</p>';
  console.error('Games load error:', err);
}


document.addEventListener('DOMContentLoaded', init);
