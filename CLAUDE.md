# OCL Golf League Website

## Project Goal
A simple, static website for a golf league. Displays schedules, results, standings, and rules. No backend — all data driven from local JSON files.

## Stack
- Plain HTML, CSS, JavaScript only
- No frameworks, no libraries unless explicitly requested
- No build tools (no webpack, npm, node, etc.)
- Files should run directly in a browser without a build step

## File Structure
- /data/ — all data files in JSON format (scores, schedule, standings, rules)
- /assets/images/ — images and icons
- /pages/ — individual HTML pages
- /css/ — stylesheets
- /js/ — javascript files

## Coding Conventions
- Mobile friendly / responsive design
- Semantic HTML
- Keep CSS in external files, not inline
- Keep JS in external files, not inline
- Comment code clearly — this is a learning project

## Data Descriptions
- Sched26.txt is a CSV file with the following columns
 ---MatchID: unique identifier for each match
 ---Date: the date of the match in M/D/YYYY
 ---Day: Day of match, Sat or Sun
 ---Time: Time of match in H:MM AM/PM
 ---Home: The Home Team code (see Teams.txt for translating code to team name)
 ---Away: The Away Team code (same format as above)
- Rules.MD is a list of rules for the league. Each rule starts with a #, and then has a title and description
- Games.MD is a list of games we play title and description
  
## What NOT to do
- Do not install packages or suggest npm
- Do not use frameworks (React, Vue, etc.) unless I ask
- Do not combine all code into one file
- Do not skip explaining what you did and why

## Context
- This is also a learning project for me — explain your decisions
- I am the only developer
- Data will be maintained manually via JSON files for now
