/* ============================================================
   nav.js — Hamburger menu toggle for inner pages.
   Used by schedule, standings, rules, and games pages.

   How it works:
   - The hamburger button (#nav-toggle) is visible only on mobile
     (shown via CSS media query in style.css).
   - Clicking it toggles the "nav-open" class on the link list
     (#nav-links), which CSS uses to show/hide the dropdown.
   - aria-expanded on the button is kept in sync so screen readers
     announce the menu state correctly.
   - Tapping any nav link closes the menu (good UX on mobile since
     the page may not fully reload if it's the current page).
   ============================================================ */

(function () {
  var toggle = document.getElementById('nav-toggle');
  var links  = document.getElementById('nav-links');

  /* Guard: if either element is missing, do nothing.
     This keeps the script safe if the markup changes. */
  if (!toggle || !links) return;

  /* Open / close the menu */
  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';

    /* Flip the state */
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', !isOpen ? 'Close navigation' : 'Open navigation');
    links.classList.toggle('nav-open', !isOpen);
  });

  /* Close the menu when any link is tapped.
     Useful when navigating to the current page (no full reload). */
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
      links.classList.remove('nav-open');
    });
  });
}());
