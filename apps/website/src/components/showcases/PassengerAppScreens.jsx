// Source-referenced Passenger UI reproductions with no personal data.
import Icon from '../ui/Icon.jsx'
import passengerLogin from '../../assets/app-previews/passenger-login.svg'
import passengerOtp from '../../assets/app-previews/passenger-otp.svg'
import { Screen, Field, Action, Header } from './AppPreview.jsx'

export function OtpScreen() {
  return <Screen>
    <div className="app-preview-progress"><span>‹</span><span>━━ ━━ ━━</span><span>STEP 2 OF 3</span></div>
    <img className="app-preview-art" src={passengerOtp} alt="" loading="lazy" />
    <p className="app-preview-eyebrow">PRIVATE. PERSONAL. PROTECTED.</p>
    <p className="app-preview-title">Just one more <span>Step.</span></p>
    <p className="app-preview-copy">Enter the six-digit code sent to your email. Check your inbox and spam folder.</p>
    <p className="app-preview-email">Your email address <span>Edit ↗</span></p>
    <div className="app-preview-otp">{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div>
    <p className="app-preview-small">Never share your verification code.</p>
    <p className="app-preview-small">Didn't get the code? <span className="app-preview-accent">Resend code</span></p>
    <Action muted>Verify &amp; Continue <span>→</span></Action>
  </Screen>
}

export function VerificationScreen() {
  return <Screen>
    <Header>Identity Verification</Header>
    <div className="app-preview-verification-status">
      <p><Icon name="shield" size="1.2em" /> Not Submitted</p>
    </div>
    <p className="app-preview-small">Identity review is separate from email verification.</p>
    <div className="app-preview-document-section">
      <div className="app-preview-card-heading"><p>CNIC images</p><span>0 / 2 selected</span></div>
      <p className="app-preview-copy">One or two JPEG/PNG images. Up to 5 MiB and 12 megapixels each.</p>
      <div className="app-preview-options"><span>Select image</span><span>Use camera</span></div>
    </div>
    <div className="app-preview-document-section">
      <div className="app-preview-card-heading"><p>Selfie</p><span>Required</span></div>
      <p className="app-preview-copy">A clear photo of your face in good lighting. JPEG/PNG, up to 5 MiB.</p>
      <div className="app-preview-options"><span>Select image</span><span>Use camera</span></div>
    </div>
    <p className="app-preview-small">By submitting, you consent to protected storage for identity review by authorized administrators.</p>
    <Action>Submit for Verification</Action>
  </Screen>
}

export function EmergencyScreen() {
  return <Screen>
    <Header>Emergency Contact</Header>
    <div className="app-preview-card app-preview-contact-editor">
      <p className="app-preview-subheading">Emergency contact</p>
      <Field label="Contact name" />
      <Field label="Contact phone" />
      <Field label="Relationship" />
      <Action>Save</Action>
      <p className="app-preview-cancel">Cancel</p>
    </div>
    <p className="app-preview-small">Saving a contact does not call or notify them.</p>
  </Screen>
}

export function SignInScreen() {
  return <Screen>
    <img className="app-preview-art" src={passengerLogin} alt="" loading="lazy" />
    <p className="app-preview-eyebrow">YOUR JOURNEY AWAITS</p>
    <p className="app-preview-title">Welcome <span>back.</span></p>
    <p className="app-preview-copy">Your familiar place, your next journey. Sign in and pick up where you left off.</p>
    <Field label="EMAIL OR MOBILE NUMBER" placeholder="you@example.com or 0300 1234567" />
    <div className="app-preview-password-label"><span>PASSWORD</span><span>Forgot password?</span></div>
    <Field label="" placeholder="Enter your password" password />
    <Action muted>Log In <span>→</span></Action>
    <p className="app-preview-small app-preview-center">New to Saheli Safar? <span className="app-preview-accent">Create an account</span></p>
  </Screen>
}
