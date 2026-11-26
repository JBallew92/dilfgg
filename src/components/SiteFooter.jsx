import { Link } from 'react-router-dom';
import { PHOTO_FORM_URL, NEW_TAB, NewTab } from '../links';
import { lastUpdated } from '../league';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>Stats update nightly · Last updated {lastUpdated}</span>
        <div className="footer-links">
          <Link to="/Submit">Submit a game</Link>
          <a href={PHOTO_FORM_URL} {...NEW_TAB}>Submit a photo <NewTab /></a>
          <span>© {new Date().getFullYear()} DILF</span>
        </div>
      </div>
    </footer>
  );
}
