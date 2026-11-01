import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Standings from './pages/Standings';
import History from './pages/History';

function renderAt(path, page) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<App />}>
          <Route path={path} element={page} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

beforeAll(() => {
  window.scrollTo = () => {};
});

test('home page shows the hero and the app section', () => {
  renderAt('/', <Home />);
  expect(screen.getByText(/One Belt\./)).toBeInTheDocument();
  expect(screen.getByText('Top of the Table')).toBeInTheDocument();
  expect(screen.getByText('Online and Offline Play')).toBeInTheDocument();
});

test('standings page lists players', () => {
  renderAt('/Standings', <Standings />);
  expect(screen.getByRole('heading', { name: 'Standings' })).toBeInTheDocument();
  expect(screen.getAllByRole('row').length).toBeGreaterThan(2);
});

test('history page shows every season', () => {
  renderAt('/History', <History />);
  expect(screen.getByText('Season by Season')).toBeInTheDocument();
  expect(screen.getByText('League founded')).toBeInTheDocument();
});
