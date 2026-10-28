import { useEffect, useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import { hasFullAdminAccess } from "../../features/auth/admin-access";

const SECTIONS = [
  { label: "Overview", to: "/overview", fullAccess: true },
  { label: "Drivers", to: "/drivers" },
  { label: "Passengers", to: "/users" },
  { label: "Settings", to: "/settings" },
  { label: "My Account", to: "/settings/account" },
  { label: "Security", to: "/settings/security" },
  { label: "Admin Management", to: "/settings/admins", fullAccess: true },
];

const DashboardSearch = ({ admin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const results = SECTIONS.filter((section) =>
    (!section.fullAccess || hasFullAdminAccess(admin)) &&
    section.label.toLowerCase().includes(query.trim().toLowerCase())
  );
  const active = Math.min(selected, Math.max(0, results.length - 1));

  useEffect(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, [location.key]);

  const choose = (section) => {
    if (!section) return;
    setOpen(false);
    setQuery("");
    navigate(section.to);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setSelected(open ? (active + direction + results.length) % Math.max(1, results.length) : 0);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (open) choose(results[active]);
      else setOpen(true);
    }
  };

  return (
    <div className="dashboard-search" role="search"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <Search className="dashboard-search-icon" size={17} aria-hidden="true" />
      <input type="search" role="combobox" aria-label="Search dashboard sections"
        placeholder="Search dashboard sections..." autoComplete="off"
        aria-autocomplete="list" aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && results.length ? `${listId}-${active}` : undefined}
        value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); setOpen(true); }}
        onFocus={() => setOpen(true)} onKeyDown={handleKeyDown} />
      {open && (
        <div className="dashboard-search-results">
          <span className="dashboard-search-caption">Dashboard sections</span>
          <div id={listId} role="listbox" aria-label="Dashboard sections">
            {results.map((section, index) => (
              <button key={section.to} type="button" role="option" id={`${listId}-${index}`}
                aria-selected={index === active} tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setSelected(index)} onClick={() => choose(section)}>
                {section.label}
              </button>
            ))}
          </div>
          {!results.length && <p className="dashboard-search-empty" role="status">No matching sections.</p>}
        </div>
      )}
    </div>
  );
};

export default DashboardSearch;
