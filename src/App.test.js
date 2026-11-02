import { fireEvent, render, screen } from '@testing-library/react';
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
  expect(screen.getByText('Current Standings')).toBeInTheDocument();
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
  expect(screen.getAllByText('Best win %').length).toBeGreaterThan(0);
});

test('clicking a player on the standings shows their cards', () => {
  renderAt('/Standings', <Standings />);
  const first = screen.getAllByRole('button', { expanded: false })[0];
  fireEvent.click(first);
  expect(screen.getAllByRole('button', { expanded: true }).length).toBe(1);
  expect(document.querySelector('.player-expand .card')).not.toBeNull();
});
