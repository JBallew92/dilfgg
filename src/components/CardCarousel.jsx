import { useEffect, useRef, useState } from 'react';
import PlayerCard from './PlayerCard';

const CARD = 340;
// Keep in step with .carousel-row / .carousel-arrow / .carousel-cards in theme.css.
const GAP = 12;
const ARROWS = 2 * 44 + 2 * 6;

// How many cards fit across the carousel's own width (up to 3).
function useCardsPerPage(ref) {
  const [perPage, setPerPage] = useState(3);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const fits = Math.floor((el.clientWidth - ARROWS + GAP) / (CARD + GAP));
      setPerPage(Math.max(1, Math.min(3, fits)));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return perPage;
}

// Trading cards shown a page at a time, with arrows beside them that hide
// at either end. `label(card, index)` is the text above each card, and
// `startAt` is the index of the first card shown.
export default function CardCarousel({ cards, label, itemName = 'cards', startAt = 0 }) {
  const ref = useRef(null);
  const perPage = useCardsPerPage(ref);
  const [start, setStart] = useState(startAt);
  const max = Math.max(0, cards.length - perPage);
  const first = Math.min(start, max);
  const visible = cards.slice(first, first + perPage);

  return (
    <div className="carousel-row" ref={ref}>
      <div className="carousel-arrow">
        {first > 0 && (
          <button type="button" className="round-btn" aria-label={`Previous ${itemName}`}
            onClick={() => setStart(Math.max(0, first - perPage))}>‹</button>
        )}
      </div>
      <div className="carousel-cards">
        {visible.map((p, i) => (
          <div className="ranked-card" key={p.name + ' ' + p.year}>
            <span className="rank">{label(p, first + i)}</span>
            <div className="card-scale"><PlayerCard player={p} /></div>
          </div>
        ))}
      </div>
      <div className="carousel-arrow">
        {first < max && (
          <button type="button" className="round-btn" aria-label={`Next ${itemName}`}
            onClick={() => setStart(Math.min(max, first + perPage))}>›</button>
        )}
      </div>
    </div>
  );
}
