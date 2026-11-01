import { Link, NavLink } from 'react-router-dom';
import { GAME_FORM_URL, PHOTO_FORM_URL, NEW_TAB } from '../links';

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
          <a className="btn-gold btn-sm" href={GAME_FORM_URL} {...NEW_TAB}>Submit a game ↗</a>
          <a className="btn-outline-gold btn-sm" href={PHOTO_FORM_URL} {...NEW_TAB}>Submit a player photo ↗</a>
        </div>
      </nav>
    </header>
  );
}
