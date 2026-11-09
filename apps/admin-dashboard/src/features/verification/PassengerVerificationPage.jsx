import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";
import { canReviewPassengerVerification } from "../auth/admin-access";
import "./verification.css";

function Document({ endpoint, label, onState }) {
  const { request } = useAuth();
  const [url, setUrl] = useState(null), [error, setError] = useState("");
  useEffect(() => {
    let active = true, objectUrl;
    setUrl(null); setError(""); onState(label, "loading");
    request(endpoint, { responseType: "blob" }).then(blob => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => { if (active) { setError("Unable to retrieve this protected document. Refresh and retry."); onState(label, "error"); } });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [endpoint, request, label, onState]);
  return <section className="card"><h3>{label}</h3>{error ? <p role="alert">{error}</p> : url ? <img className="verification-document" src={url} alt={`Submitted ${label}`} referrerPolicy="no-referrer"
    onLoad={() => onState(label, "ready")} onError={() => { setError("Unable to display this document."); onState(label, "error"); }} /> : <p role="status">Loading document...</p>}</section>;
}
export default function PassengerVerificationPage() {
  const { admin, request } = useAuth(), { userId } = useParams();
  const allowed = canReviewPassengerVerification(admin);
  const [data, setData] = useState(null), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [page, setPage] = useState(1), [reason, setReason] = useState(""), [busy, setBusy] = useState(false), [blocked, setBlocked] = useState(false);
  const [documents, setDocuments] = useState({}); const sequence = useRef(0);
  const load = useCallback(async () => {
    const version = ++sequence.current; setData(null); setError(""); setDocuments({}); setBlocked(false);
    try {
      const result = await request(`/admin/passenger-verifications${userId ? `/${userId}` : ""}`, userId ? {} : { query: { page } });
      if (version === sequence.current) setData(result);
    } catch (error) { if (version === sequence.current) setError(error.message); }
  }, [request, userId, page]);
  useEffect(() => { if (allowed) void load(); return () => { sequence.current++; }; }, [load, allowed]);
  const documentState = useCallback((key, status) => setDocuments(previous => ({ ...previous, [key]: status })), []);
  const decide = async decision => {
    if (busy || blocked) return;
    if (decision !== "approved" && reason.trim().length < 2) { setError("Enter a rejection or reverification reason (2–500 characters)."); return; }
    if (!window.confirm(`Current decision: ${data.verification.status}. Record ${decision.replaceAll("_", " ")}?`)) return;
    const version = sequence.current; setBusy(true); setError(""); setNotice("");
    try {
      const result = await request(`/admin/passenger-verifications/${userId}/review`, { method: "POST", body: { revision: data.verification.revision, submissionId: data.verification.submissionId, decision, ...(reason.trim() ? { reason: reason.trim() } : {}) } });
      if (version !== sequence.current) return;
      setData(previous => ({ ...previous, verification: result.verification })); setNotice("Decision saved. Refresh to see the updated review history."); setBlocked(true); setReason("");
    } catch (error) { if (version === sequence.current) { setError(`${error.message} Refresh the record before trying again.`); setBlocked(true); } }
    finally { if (version === sequence.current) setBusy(false); }
  };
  if (!allowed) return <div className="page"><h1>Passenger identity review</h1><p role="alert">Only Full Access Admins explicitly granted verifyPassengers may perform Passenger identity verification.</p><Link to="/users">Back to Passengers</Link></div>;
  const verification = data?.verification;
  const imagesReady = verification?.documents.length >= 2 && verification.documents.every(doc => documents[doc.key] === "ready");
  return <div className="page verification-page">
    <Link className="link" to={userId ? "/passenger-verifications" : "/users"}>{userId ? "Back to pending queue" : "Back to Passengers"}</Link>
    <header className="page-header"><div><h1>Passenger identity review</h1><p className="muted">Manual review of protected CNIC and selfie submissions.</p></div><button className="btn" onClick={load} disabled={busy}>Refresh verification records</button></header>
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {!data && !error && <p role="status">Loading verification records...</p>}
    {data && !userId && <section className="card"><h2>Pending Review</h2>{data.submissions.length ? <ul>{data.submissions.map(row => <li key={row.userId}><Link className="link" to={`/passenger-verifications/${row.userId}`}>{row.fullName || "Passenger"}</Link> — {row.email}</li>)}</ul> : <p>No submissions awaiting review on this page.</p>}
      <div className="verification-actions"><button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous page</button><span>Page {page}</span><button className="btn" disabled={!data.hasMore} onClick={() => setPage(p => p + 1)}>Next page</button></div></section>}
    {verification && <>
      <section className="card"><h2>{data.passenger.fullName || "Passenger"}</h2><p>{data.passenger.email}</p><p><strong>Current decision:</strong> {verification.status.replaceAll("_", " ")}</p><p>Revision: {verification.revision}</p>{verification.rejectionReason && <p>Rejection reason: {verification.rejectionReason}</p>}{verification.reverificationReason && <p>Reverification reason: {verification.reverificationReason}</p>}</section>
      <div className="verification-documents">{verification.documents.map(doc => <Document key={`${verification.submissionId}-${doc.key}`} label={doc.key} endpoint={`/admin/passenger-verifications/${userId}/documents/${doc.key}`} onState={documentState} />)}</div>
      <section className="card"><h2>Record a decision</h2><p className="muted">View all required images before deciding. A conflict requires refreshing and reviewing the current decision.</p>
        <label className="field"><span>Rejection / reverification reason</span><textarea aria-label="Review reason" value={reason} maxLength={500} onChange={event => setReason(event.target.value)} disabled={busy} /></label>
        <div className="verification-actions">{verification.status === "pending_review" ? <><button className="btn" disabled={busy || blocked || !imagesReady} onClick={() => decide("approved")}>Approve Passenger</button><button className="btn" disabled={busy || blocked || !imagesReady} onClick={() => decide("rejected")}>Reject Passenger</button></>
          : ["approved", "rejected"].includes(verification.status) && <button className="btn" disabled={busy || blocked || !imagesReady} onClick={() => decide("reverification_requested")}>Request reverification</button>}</div>
      </section>
      <section className="card"><h2>Decision history</h2>{data.history.length ? <ul>{data.history.map(row => <li key={row.revision}>{row.decision.replaceAll("_", " ")} — {new Date(row.decidedAt).toLocaleString()} — Admin {row.adminId}{row.reason ? ` — ${row.reason}` : ""}</li>)}</ul> : <p>No recorded decisions.</p>}</section>
    </>}
  </div>;
}
