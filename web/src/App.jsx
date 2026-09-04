import { useState } from 'react'

// The server owns every user-facing error message (see the frozen API contract
// on issue #1), so we send even an empty ZIP and show back whatever it says.
// This string only covers the case where the request never arrived at all.
const UNREACHABLE = "Can't reach the weather service. Check that the server is running."

export default function App() {
  const [zip, setZip] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | delivered | failed
  const [card, setCard] = useState(null)
  const [error, setError] = useState('')

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

      <header className="masthead">
        <h1>Weather, delivered</h1>
        <p className="standfirst">
          Give us a US ZIP code and we&rsquo;ll send back the conditions there right now.
        </p>
      </header>

      <form className="addressblock" onSubmit={lookup} noValidate>
        <label className="fieldlabel" htmlFor="zip">
          ZIP code
        </label>
        <div className="fieldrow">
          <input
            id="zip"
            className="zipfield"
            name="zip"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="90210"
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

        {status === 'failed' && (
          <article className="undeliverable" role="alert">
            <p className="undeliverable-mark">Undeliverable</p>
            <p className="undeliverable-text">{error}</p>
          </article>
        )}
      </section>
    </main>
  )
}
