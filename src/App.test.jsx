import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Standings from './pages/Standings';
import History from './pages/History';
import { seasonOf } from './league';

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

test('tapping a player in the phone list shows their stats', () => {
  renderAt('/Standings', <Standings />);
  expect(document.querySelector('.pl-stats')).toBeNull();
  const first = screen.getAllByRole('button', { expanded: false })[0];
  fireEvent.click(first);
  expect(screen.getAllByRole('button', { expanded: true }).length).toBe(1);
  expect(document.querySelector('.pl-stats')).not.toBeNull();
});

test('history shows the champion card for each season', () => {
  renderAt('/History', <History />);
  expect(screen.getAllByText(/^(DILF|Provisional) Champion$/).length).toBe(5);
  expect(document.querySelectorAll('.season-champ .card').length).toBe(5);
});

test('standings show places moved since last season', () => {
  renderAt('/Standings', <Standings />);
  expect(document.querySelectorAll('.move.up').length).toBeGreaterThan(0);
});

test('seasons run December to November', () => {
  expect(seasonOf(new Date(2026, 10, 30))).toBe(2026);
  expect(seasonOf(new Date(2026, 11, 1))).toBe(2027);
  expect(seasonOf(new Date(2027, 0, 15))).toBe(2027);
});
