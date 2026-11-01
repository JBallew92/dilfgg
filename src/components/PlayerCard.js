import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles.css';
import { getPlayerPhoto, DEFAULT_PHOTO } from '../photos.js';

// The DILF trading card. Expects one row from playerStats.js (with win_pct
// already turned into a whole-number percent).
function getBackgroundImage(player) {
    return (
      process.env.PUBLIC_URL +
      '/images/assets/card_back_' + player['Fiscal Year'] +
       '.webp'
    );
  }

function getFlagImage(player) {
    return (
      process.env.PUBLIC_URL +
      '/images/assets/' +
      player.nation +
       '.png'
    );
}

export default function PlayerCard({ player }) {
    // Swap hyphens for non-breaking hyphens so names like Williams-Jones stay on one line
    const displayPlayerName = player["Player"].replace(/-/g, '\u2011');
  return (
    <Container
    fluid
    className="card"
    style={{ backgroundImage: `url(${getBackgroundImage(player)}),
      url(${process.env.PUBLIC_URL}/images/assets/card_back_2023.webp)` }}
>
  <div className="watermark">{player["watermark"]}</div>
      {/* Top Row: Player Name + Header */}
      {/* 1. ABSOLUTELY POSITIONED HEADER CONTAINER */}
      <div className="header-label-container">
          <div className="header-label">DILF®</div>
          <div className="header-label-year">{player['Fiscal Year']}</div>
      </div>
      
      {/* 2. PLAYER NAME ROW (Now it won't push the header down) */}
      <Row className="align-items-start player-name-row">
        {/* We use Col-12 to ensure the name takes the full width */}
        <Col xs={12}> 
          {/* Note: Use your preferred font size solution here (clamp or static) */}
          <div className="player-name">{displayPlayerName}</div>
        </Col>
      </Row>

        {/* Stats Section - single vertical column */}
      <Row className="mt-3 stats">
        <Row xs={12} className="stat">
          <div className="label">WINS</div>
          <div className="value">{player["win_pct"]}%</div>
        </Row>
        <Row xs={12} className="stat">
          <div className="label">GAMES PLAYED</div>
          <div className="value">{player["games_played"]}</div>
        </Row>
        <Row xs={12} className="stat">
          <div className="label">AVG. SCORE</div>
          <div className="value">{player["avg_total_score"]}</div>
        </Row>
        <Row xs={12} className="stat">
          <div className="label">BEST SCORE</div>
          <div className="value">{player["min_total_score"]}</div>
        </Row>
        <Row xs={12} className="stat">
          <div className="label">BEST HALF</div>
          <div className="value">{player["min_half_time_score"]}</div>
        </Row>
      </Row>

      {/* Player Image & Watermark */}
      <Row style={{ flexGrow: 1 }}>
        <Col>
          <Image
            className="flag"
            src={getFlagImage(player)}
            alt={player.nation}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = process.env.PUBLIC_URL + '/images/assets/unknown_flag.png';}}
            />
        </Col>
        <Col>
          <Image
            className="player-img"
            src={getPlayerPhoto(player.Player, player['Fiscal Year'])}
            alt={player.Player}
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.src = DEFAULT_PHOTO;}}
            />
        </Col>
      </Row>

      {/* Bottom Row: Flag + Stats Bar */}
      <Row className="bottom-bar text-center">
        <Col className="podium-col d-flex justify-content-center align-items-center gap-2">
          <Image
            className="podium-flag"
            src={process.env.PUBLIC_URL + '/images/assets/belt-icon.webp'}
            alt="First Place"
          />
          <span className="podium-value">{player["first"]}</span>
        </Col>

        <Col className="podium-col d-flex justify-content-center align-items-center gap-2">
          <span className="podium-label">2<sup>nd</sup></span>
          <span className="podium-value">{player["second"]}</span>
        </Col>

        <Col className="podium-col d-flex justify-content-center align-items-center gap-2">
          <span className="podium-label">3<sup>rd</sup></span>
          <span className="podium-value">{player["third"]}</span>
        </Col>
      </Row>
    </Container>
  );
}
