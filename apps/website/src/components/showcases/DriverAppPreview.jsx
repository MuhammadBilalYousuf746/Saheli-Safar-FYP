// Current Sky Drive identity/licence registration reproduction.
import driverReview from '../../assets/app-previews/driver-review.svg'
import { Screen, Field, Action } from './AppPreview.jsx'

export default function DriverAppPreview() {
  return <Screen driver>
    <div className="app-preview-driver-brand">
      <div><span className="app-preview-back">‹</span><span><strong>Saheli Safar</strong><small>Driver workspace</small></span></div>
      <span className="app-preview-language"><b>English</b><span lang="ur" dir="rtl">اردو</span></span>
    </div>
    <div className="app-preview-driver-step"><span>Identity &amp; licence</span><span>Step 3 of 5</span></div>
    <div className="app-preview-driver-progress">{[0, 1, 2, 3, 4].map(i => <span key={i} className={i < 3 ? 'is-complete' : ''} />)}</div>
    <img className="app-preview-art" src={driverReview} alt="" loading="lazy" />
    <p className="app-preview-title">Confidence, from the first mile.</p>
    <p className="app-preview-copy">Provide your CNIC and driving licence for admin review.</p>
    <Field label="CNIC number" placeholder="00000-0000000-0" />
    <Field label="Driving licence number" />
    <p className="app-preview-driver-notice">Identity details are used for verification. Your numbers stay masked on your profile.</p>
    <Action>Continue</Action>
    <p className="app-preview-small app-preview-center">Already have an account? <span className="app-preview-accent">Log in</span></p>
  </Screen>
}
