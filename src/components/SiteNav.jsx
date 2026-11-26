import { Link, NavLink } from 'react-router-dom';
import { PHOTO_FORM_URL, NEW_TAB, NewTab } from '../links';

export default function SiteNav() {
  return (
    <header className="site-header">
      <nav aria-label="Main" className="wrap site-nav">
        <Link to="/" className="brand">DILF</Link>
        <div className="nav-links">
          <NavLink to="/Standings">Standings</NavLink>
          <NavLink to="/History">History</NavLink>
          <Link to="/#app">The App</Link>
        </div>
        <div className="nav-actions">
          <Link className="btn-gold btn-sm" to="/Submit">Submit a game</Link>
          <a className="btn-outline-gold btn-sm" href={PHOTO_FORM_URL} {...NEW_TAB}>Submit a player photo <NewTab /></a>
        </div>
      </nav>
    </header>
  );
}
