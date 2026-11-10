import Icon from '../ui/Icon.jsx'
import './AppPreviews.css'

// Data-free overview composition: dashes mean omitted statistics, never live counts.
export default function AdminDashboardPreview() {
  const metrics = ['Passengers', 'Drivers', 'Pending verifications']
  return <div className="app-preview-admin-frame" role="img" aria-label="Faithful reproduction of the Admin Dashboard overview, with statistics and private records omitted">
    <div className="app-preview-browser"><i /><i /><i /><span>Admin Dashboard · UI reproduction</span></div>
    <div className="app-preview-admin">
      <div className="app-preview-sidebar">
        <div className="app-preview-admin-brand">Saheli Safar<small>Admin Panel</small></div>
        {['Overview', 'Drivers', 'Passengers', 'Settings'].map((label, i) => <div key={label} className={i === 0 ? 'is-active' : ''}><Icon name={['home', 'steering', 'users', 'lock'][i]} size="1.1em" />{label}</div>)}
        <p>Account details omitted</p>
      </div>
      <div className="app-preview-admin-main">
        <div className="app-preview-admin-topbar"><span>Overview</span><span>Search dashboard</span></div>
        <div className="app-preview-admin-content">
          <p className="app-preview-admin-title">Overview</p>
          <p className="app-preview-admin-muted">An overview of passenger and driver operations.</p>
          <div className="app-preview-admin-metrics">{metrics.map(label => <div key={label}><span>{label}</span><strong>—</strong></div>)}</div>
          <div className="app-preview-admin-statuses">{['Approved drivers', 'Rejected drivers', 'Suspended accounts'].map(label => <span key={label}>{label}<b>—</b></span>)}</div>
          <div className="app-preview-admin-queue"><p>Drivers awaiting verification</p><span>Review pending applications before drivers can get on the road.</span><div>Private application records omitted</div></div>
          <p className="app-preview-admin-disclaimer">UI reproduction · No operational data displayed</p>
        </div>
      </div>
    </div>
  </div>
}
