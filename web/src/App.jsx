import { useState } from 'react'
import ThemeStamp from './ThemeStamp.jsx'
import useTheme from './useTheme.js'

// The server owns every user-facing error message (see the frozen API contract
// on issue #1), so we send even an empty ZIP and show back whatever it says.
// This string only covers the case where the request never arrived at all.
const UNREACHABLE = "Can't reach the weather service. Check that the server is running."

export default function App() {
  const [zip, setZip] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | delivered | failed
  const [card, setCard] = useState(null)
  const [error, setError] = useState('')
  const [dark, toggleTheme] = useTheme()

  async function lookup(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    setCard(null)

    try {
      const response = await fetch(`/api/weather?zip=${encodeURIComponent(zip)}`)
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(body.error || UNREACHABLE)
        setStatus('failed')
        return
      }

      setCard(body)
      setStatus('delivered')
    } catch {
      setError(UNREACHABLE)
      setStatus('failed')
    }
  }

  const loading = status === 'loading'

  return (
    <main className="sheet">
      <div className="chevrons" aria-hidden="true" />

      <div className="topline">
        <header className="masthead">
          <h1>Weather, delivered</h1>
          <p className="standfirst">
            Give us a US ZIP code and we&rsquo;ll send back the conditions there right now.
          </p>
        </header>
        <ThemeStamp dark={dark} onToggle={toggleTheme} />
      </div>

      <form className="addressblock" onSubmit={lookup} noValidate>
        <label className="fieldlabel" htmlFor="zip">
          ZIP code
        </label>
        <p className="fieldhint" id="zip-hint">
          Five digits, like 90210.
        </p>
        <div className="fieldrow">
          <input
            id="zip"
            className="zipfield"
            name="zip"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            inputMode="numeric"
            autoComplete="postal-code"
            aria-describedby="zip-hint"
            maxLength={5}
          />
          <button className="postbutton" type="submit" disabled={loading}>
            {loading ? 'Getting weather' : 'Get weather'}
          </button>
        </div>
      </form>

      <section className="tray" aria-live="polite">
        {status === 'delivered' && card && (
          <article className="postcard">
            <div className="postmark">
              <span className="postmark-zip">{card.zip}</span>
              <span className="postmark-word">delivered</span>
            </div>
            <p className="city">{card.city}</p>
            <p className="temp">
              {Math.round(card.tempF)}
              <span className="degree">&deg;F</span>
            </p>
            <p className="conditions">{card.conditions}</p>
          </article>
        )}

        {/*
          No role="alert" here. The tray above is already a polite live region
          and it is the one that persists across renders, so it is the one that
          announces reliably. An assertive region nested inside a polite one
          makes some screen readers read the error twice.
        */}
        {status === 'failed' && (
          <article className="undeliverable">
            <p className="undeliverable-mark">Undeliverable</p>
            <p className="undeliverable-text">{error}</p>
          </article>
        )}
      </section>
    </main>
  )
}
