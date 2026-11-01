import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteNav from './components/SiteNav';
import SiteFooter from './components/SiteFooter';

// Scrolls to #sections (like /#app) and back to the top on page changes.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
 return (
  <div className="site">
    <ScrollManager />
    <SiteNav />
    <main>
      <Outlet />
    </main>
    <SiteFooter />
  </div>
 );
}

export default App;
