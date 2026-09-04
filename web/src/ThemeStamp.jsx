/*
  The theme control, drawn as a postage stamp.

  Its accessible name says what pressing it does, not what mode you are in —
  "Switch to dark mode" — because a name that reports state leaves a
  screen-reader user guessing what the button will do. The glyph follows the
  same rule: it shows the destination, not the current mode.
*/

function Sun() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <line x1="12" y1="1.5" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22.5" y2="12" />
        <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
        <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
        <line x1="19.4" y1="4.6" x2="17.6" y2="6.4" />
        <line x1="6.4" y1="17.6" x2="4.6" y2="19.4" />
      </g>
    </svg>
  )
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M20.4 15.3A8.6 8.6 0 0 1 9.1 3.9a9.2 9.2 0 1 0 11.3 11.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function ThemeStamp({ dark, onToggle }) {
  return (
    <button
      className="stamp"
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  )
}
