import { useEffect, useState } from 'react'

// Must match the key the inline script in index.html reads before first paint.
const KEY = 'weather-theme'
const QUERY = '(prefers-color-scheme: dark)'

const read = () => {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

/*
  Three states, one of which is the absence of a choice:

    null      follow the OS. No data-theme attribute, so the
              prefers-color-scheme media query decides.
    'light'   the user forced light, beating the OS.
    'dark'    the user forced dark, beating the OS.

  Returns the *effective* mode, because that is what the button needs to
  describe: it always offers the mode you are not in.
*/
export default function useTheme() {
  const [choice, setChoice] = useState(read)
  const [osDark, setOsDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  // While no choice is stored we are following the OS, so we have to notice
  // when the OS flips — otherwise the stamp keeps offering the mode we are
  // already in.
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = (event) => setOsDark(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (choice) {
      root.dataset.theme = choice
    } else {
      delete root.dataset.theme
    }
    try {
      if (choice) localStorage.setItem(KEY, choice)
      else localStorage.removeItem(KEY)
    } catch {
      /* the attribute is already set; persistence is the only thing lost */
    }
  }, [choice])

  const dark = choice ? choice === 'dark' : osDark

  return [dark, () => setChoice(dark ? 'light' : 'dark')]
}
