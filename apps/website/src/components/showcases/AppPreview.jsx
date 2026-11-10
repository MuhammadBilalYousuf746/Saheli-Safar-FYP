// Shared static screen primitives. These do not execute the mobile apps.
import './AppPreviews.css'

function StatusBar() {
  return <div className="app-preview-status"><span>9:41</span><span aria-hidden="true">••• ▰</span></div>
}

export function Screen({ children, driver = false }) {
  return <div className={`app-preview ${driver ? 'app-preview-driver' : 'app-preview-passenger'}`}>
    <StatusBar />
    <div className="app-preview-body">{children}</div>
  </div>
}

export function Field({ label, placeholder = '', password = false }) {
  return <div className="app-preview-field">
    <p>{label}</p>
    <div className="app-preview-input"><span>{placeholder || '\u00a0'}</span>{password && <span>Show</span>}</div>
  </div>
}

export function Action({ children, muted = false }) {
  return <div className={`app-preview-action${muted ? ' app-preview-action-muted' : ''}`}>{children}</div>
}

export function Header({ children }) {
  return <div className="app-preview-header"><svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg><p>{children}</p><svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2 7M20 4v7h-7" /></svg></div>
}
