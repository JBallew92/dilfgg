import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../links', async (orig) => ({ ...(await orig()), SCAN_ENDPOINT: 'https://script.example/exec' }));
vi.mock('../scan/image', async (orig) => ({
  ...(await orig()),
  shrinkPhoto: async () => ({ dataUrl: 'data:image/jpeg;base64,AAAA', base64: 'AAAA', mimeType: 'image/jpeg' }),
  photoDate: async () => '2026-05-26',
}));

import Submit from './Submit';

const reading = {
  game_date: '',
  players: [
    { name_on_card: 'James', matched_name: 'James Ballew', rounds: [71, 21, 0, 0, 24, 0, 0, 9, 24, 0, 0, 6, 0],
      halftime_written: 116, total_written: 155, unsure: false },
    { name_on_card: 'Kat', matched_name: 'AMBIGUOUS', rounds: [], halftime_written: 129, total_written: 429, unsure: true },
  ],
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('dilf-league-code', 'dominoes');
  global.fetch = vi.fn(async (url, opts) => {
    const body = JSON.parse(opts.body);
    const data = body.action === 'names' ? { ok: true, names: [] }
      : body.action === 'scan' ? { ok: true, photoUrl: 'https://drive.example/card', reading }
        : { ok: true };
    return { json: async () => data };
  });
});

test('a scanned card fills the form and submits the scores', async () => {
  const { container } = render(<MemoryRouter><Submit /></MemoryRouter>);
  const file = new File(['x'], 'card.jpg', { type: 'image/jpeg' });
  fireEvent.change(container.querySelector('input[capture]'), { target: { files: [file] } });

  await screen.findByDisplayValue('James Ballew');
  expect(screen.getByLabelText('Game date')).toHaveValue('2026-05-26');
  expect(screen.getByLabelText('Player 2 name')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Kat Herzog' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Katie Herzog' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Kat Herzog' }));
  fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'james@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit Game' }));

  await screen.findByText('Game Saved');
  const submit = JSON.parse(global.fetch.mock.calls.at(-1)[1].body);
  expect(submit).toMatchObject({
    action: 'submit',
    code: 'dominoes',
    game: {
      date: '2026-05-26',
      email: 'james@example.com',
      photoUrl: 'https://drive.example/card',
      players: [{ name: 'James Ballew', half: 116, total: 155 }, { name: 'Kat Herzog', half: 129, total: 429 }],
    },
  });
  expect(localStorage.getItem('dilf-email')).toBe('james@example.com');
});

test('a missing name stops the submit', async () => {
  render(<MemoryRouter><Submit /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Type scores without a photo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit Game' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Player 1 needs a name.'));
  expect(screen.getByRole('alert')).toHaveTextContent('Enter your email address.');
  expect(global.fetch.mock.calls.every((c) => JSON.parse(c[1].body).action !== 'submit')).toBe(true);
});
