# OCL Golf League Website

## Project Goal
A simple, static website for a golf league. Displays schedules, results, standings, and rules. 
No backend — all data driven from local files (CSV and Markdown).

## Stack
- Plain HTML, CSS, JavaScript only
- No frameworks, no libraries unless explicitly requested
- No build tools (no webpack, npm, node, etc.)
- Files should run directly in a browser without a build step

## File Structure
- /data/ — all data files
- /assets/images/ — images and icons (OCL Logo 1.jpg, OCL Logo 2.jpg)
- /pages/ — individual HTML pages
- /css/ — stylesheets
- /js/ — javascript files

## Data Files

### Sched26.csv
Schedule and results for the 2026 season. Columns:
- MatchID: unique identifier for each match
- Date: match date in M/D/YYYY format
- Day: Sat or Sun
- Time: match time in H:MM AM/PM format
- Home: home team code (see Teams.MD)
- Away: away team code (see Teams.MD)
- HomePoints: total game points earned by home team (0-18, empty if unplayed)
- AwayPoints: total game points earned by away team (0-18, empty if unplayed)

> HomePoints + AwayPoints always = 18 for a completed match.
> Match winner is determined by points > 9. A 9-9 split is a tie.

### Teams.MD
Lookup table mapping team codes to full team names. 9 teams in the league:
BR, CGC, DYC, HCC, MCC, PCC, SCC, TL, WGC

### Standings.MD
Defines the structure of the standings page. Columns:
- Team: full team name
- Wins / Ties / Losses: match record
- Points: calculated as (Wins × 2) + (Ties × 1)
- Total Match Points: sum of all HomePoints or AwayPoints earned across all matches

> Standings are derived from Sched26.csv — do not hardcode them.
> Sort by Points descending.

### Results.MD
Defines the structure of the results page:
- Lists full schedule in chronological order
- Shows results for completed matches, blank for unplayed
- Columns: Date, Time, Home Team (full name), Away Team (full name), Home Points, Away Points
- Team codes must be translated to full names using Teams.MD

### Rules.MD
League rules. Each rule is numbered with a heading and description.

### Games.MD
Descriptions of games played at OCL clubs.

## Standings Calculation Logic
Derive standings dynamically from Sched26.csv:
- A match is complete when HomePoints and AwayPoints are not empty
- Home team wins if HomePoints > 9 → +2 points in standings
- Away team wins if AwayPoints > 9 → +2 points in standings
- If HomePoints = AwayPoints = 9 → both teams get +1 point (tie)
- Total Match Points = cumulative sum of all game points earned

## Coding Conventions
- Mobile friendly / responsive design
- Semantic HTML
- Keep CSS in external files, not inline
- Keep JS in external files, not inline
- Comment code clearly — this is a learning project
- Use full team names from Teams.MD anywhere a team is displayed to the user

## What NOT to Do
- Do not install packages or suggest npm
- Do not use frameworks (React, Vue, etc.) unless asked
- Do not combine all code into one file
- Do not skip explaining what you did and why
- Do not hardcode standings or results — always derive from Sched26.csv

## Context
- This is a learning project — explain all decisions
- I am the only developer
- Data is maintained manually by updating Sched26.csv after each match
- The site is for a private golf league — clean, simple presentation is the goal
