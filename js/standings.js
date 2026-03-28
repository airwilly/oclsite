/* ============================================================
   js/standings.js
   Reads Sched26.csv and Teams.MD, calculates standings from
   completed matches only, and builds the standings table on
   pages/standings.html.

   Standings logic (from CLAUDE.md):
     - A match is complete when HomePoints and AwayPoints are both non-empty
     - Home team wins  if HomePoints > 9  → home +2 pts, away +0 pts
     - Away team wins  if AwayPoints > 9  → away +2 pts, home +0 pts
     - Tie             if both equal 9    → each team +1 pt
     - Total Match Points = sum of all game points earned across all matches
     - Sort: Points descending; tie-break on Total Match Points descending

   NOTE: fetch() requires a web server. Use VS Code Live Server —
   opening the file directly via file:// will not work.
   ============================================================ */

const CSV_PATH   = '../data/Sched26.csv';
const TEAMS_PATH = '../data/Teams.MD';


/* ------------------------------------------------------------
   init()
   Fetches both data files in parallel, then calculates and
   renders the standings table.
   ------------------------------------------------------------ */
async function init() {
  try {
    const [csvText, teamsText] = await Promise.all([
      fetch(CSV_PATH).then(res => res.text()),
      fetch(TEAMS_PATH).then(res => res.text())
    ]);

    const teams   = parseTeams(teamsText);   // { BR: "Blackrock CC", ... }
    const matches = parseCSV(csvText);       // array of row objects
    const rows    = calculateStandings(matches, teams);

    buildTable(rows);

  } catch (err) {
    showError(err);
  }
}


/* ------------------------------------------------------------
   parseTeams(markdown)
   Reads the markdown table in Teams.MD and returns a lookup
   object mapping team codes to full names.

   Input line example:  | BR | Blackrock CC |
   Output:              { BR: "Blackrock CC", ... }
   ------------------------------------------------------------ */
function parseTeams(markdown) {
  const lookup = {};

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();

    /* Skip blank lines and separator rows (|---|) */
    if (!trimmed || trimmed.includes('---')) continue;

    /* Split on pipe, trim each cell, remove empty strings from
       the leading and trailing pipes. */
    const cells = trimmed.split('|').map(s => s.trim()).filter(Boolean);

    /* Need two cells: code and name. Skip the header row. */
    if (cells.length < 2 || cells[0] === 'Team Code') continue;

    lookup[cells[0]] = cells[1];
  }

  return lookup;
}


/* ------------------------------------------------------------
   parseCSV(text)
   Parses a CSV string into an array of objects keyed by the
   header row. All values are trimmed (handles the stray space
   in the "35, 5/31/2026" row).

   Example output row:
     { MatchID: "1", Date: "5/2/2026", Day: "Sat",
       Time: "10:00 AM", Home: "TL", Away: "MCC",
       HomePoints: "", AwayPoints: "" }
   ------------------------------------------------------------ */
function parseCSV(text) {
  const lines   = text.trim().split('\n');
  const headers = lines[0].split(',').map(s => s.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(s => s.trim());
    const row    = {};
    headers.forEach((header, i) => {
      row[header] = values[i] !== undefined ? values[i] : '';
    });
    return row;
  });
}


/* ------------------------------------------------------------
   calculateStandings(matches, teams)
   Builds a standings record for every team that appears in
   the schedule, then populates it using completed matches only.

   Returns an array of standing objects sorted by Points
   descending, with Total Match Points as the tie-breaker.

   Each standing object:
     { name, wins, ties, losses, points, totalMatchPoints }
   ------------------------------------------------------------ */
function calculateStandings(matches, teams) {

  /* Step 1 — Seed an entry for every team found in the schedule.
     We derive the team list from the CSV rather than Teams.MD so
     that the table always reflects what's actually in the schedule,
     even if the two files ever fall out of sync. */
  const table = {};

  for (const match of matches) {
    for (const code of [match.Home, match.Away]) {
      if (code && !table[code]) {
        table[code] = {
          name:             teams[code] || code, /* fall back to code if lookup missing */
          wins:             0,
          ties:             0,
          losses:           0,
          totalMatchPoints: 0
        };
      }
    }
  }

  /* Step 2 — Walk through every completed match and update records.
     A match is complete when both HomePoints and AwayPoints are non-empty. */
  for (const match of matches) {
    if (match.HomePoints === '' || match.AwayPoints === '') continue;

    const hp   = Number(match.HomePoints);
    const ap   = Number(match.AwayPoints);
    const home = table[match.Home];
    const away = table[match.Away];

    /* Accumulate raw game points regardless of win/loss */
    home.totalMatchPoints += hp;
    away.totalMatchPoints += ap;

    /* Determine outcome using the spec threshold of 9 points.
       Because hp + ap = 18, only three cases are possible:
         hp > 9  →  home wins (ap < 9)
         ap > 9  →  away wins (hp < 9)
         hp = ap →  9-9 tie  */
    if (hp > 9) {
      home.wins++;
      away.losses++;
    } else if (ap > 9) {
      away.wins++;
      home.losses++;
    } else {
      /* Both teams scored exactly 9 — a tie */
      home.ties++;
      away.ties++;
    }
  }

  /* Step 3 — Compute standings points and sort.
     Points = (Wins × 2) + (Ties × 1)
     Tie-breaker: Total Match Points descending (per league rules). */
  return Object.values(table)
    .map(team => ({
      ...team,
      points: (team.wins * 2) + team.ties
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.totalMatchPoints - a.totalMatchPoints;
    });
}


/* ------------------------------------------------------------
   buildTable(rows)
   Inserts one <tr> per team into the #standings-body element.
   ------------------------------------------------------------ */
function buildTable(rows) {
  const tbody = document.getElementById('standings-body');

  for (const row of rows) {
    const tr = document.createElement('tr');

    /* Helper: create a <td> with optional CSS class */
    function cell(text, className) {
      const td = document.createElement('td');
      td.textContent = text;
      if (className) td.className = className;
      return td;
    }

    tr.appendChild(cell(row.name));                          /* Team            */
    tr.appendChild(cell(row.wins,             'points'));    /* W               */
    tr.appendChild(cell(row.ties,             'points'));    /* T               */
    tr.appendChild(cell(row.losses,           'points'));    /* L               */
    tr.appendChild(cell(row.points,           'points'));    /* Pts             */
    tr.appendChild(cell(row.totalMatchPoints, 'points'));    /* Match Pts       */

    tbody.appendChild(tr);
  }
}


/* ------------------------------------------------------------
   showError(err)
   Replaces the table container with a readable error message
   when the fetch fails (most commonly via file://).
   ------------------------------------------------------------ */
function showError(err) {
  const container = document.getElementById('standings-container');
  container.innerHTML =
    '<p class="error-message">' +
      'Could not load standings data. ' +
      'Open this page through a local web server ' +
      '(e.g. VS Code <strong>Live Server</strong>) ' +
      'rather than directly from the file system.' +
    '</p>';
  console.error('Standings load error:', err);
}


document.addEventListener('DOMContentLoaded', init);
