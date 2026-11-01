import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "./styles.css";
import React, { useState, useEffect } from "react";
import { list } from './playerStats.js';


function getImage(player) {
    return (
      process.env.PUBLIC_URL +
      '/images/profile_pics/' +
      player.Player + 
      ' ' + player['Fiscal Year'] +
       '.png'
    );
  }

function getBackgroundImage(player) {
    return (
      process.env.PUBLIC_URL +
      '/images/assets/card_back_' + player['Fiscal Year'] +
       '.png'
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

function PlayerCard({player}) {
    const playerName = player["Player"];
    const displayPlayerName = playerName.replace(/-/g, '&#8209;'); // Replace all standard hyphens with non-breaking ones
  return (
    <Container
    fluid
    className="card"
    style={{ backgroundImage: `url(${getBackgroundImage(player)}),
      url(${process.env.PUBLIC_URL}/images/assets/default.png)` }}
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
          <div className="player-name" dangerouslySetInnerHTML={{ __html: displayPlayerName }}></div>
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
            onError={(e) => { e.currentTarget.src = process.env.PUBLIC_URL + '/images/assets/unknown_flag.png';}}
            />
        </Col>
        <Col>
          <Image
            className="player-img"
            src={getImage(player)}
            alt={player.Player}
            onError={(e) => { e.currentTarget.src = process.env.PUBLIC_URL + '/images/profile_pics/default.png';}}
            />
        </Col>
      </Row>

      {/* Bottom Row: Flag + Stats Bar */}
      <Row className="bottom-bar text-center">
        <Col className="podium-col d-flex justify-content-center align-items-center gap-2">
          <Image
            className="podium-flag"
            src={process.env.PUBLIC_URL + '/images/assets/belt.png'}
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


  function CardLayout() {
    const playerListUpdated = list.map(player => ({
      ...player,
      win_pct: Math.round(player.win_pct * 100),
      avg_total_score: Math.round(player.avg_total_score)
  }));
    const [selectedYear, setSelectedYear] = useState("2026"); // State for filtering
    const [filteredPlayers, setFilteredPlayers] = useState(playerListUpdated); // Store filtered results

    useEffect(() => {
    if (!playerListUpdated?.length) return;

    if (selectedYear === "") {
      setFilteredPlayers(playerListUpdated);
    } else {
      setFilteredPlayers(
        playerListUpdated.filter(
          (player) => String(player["Fiscal Year"]) === selectedYear
        )
      );
    }
  }, [playerListUpdated, selectedYear]);

    // Handle filter change
    const handleFilterChange = (event) => {
      const year = event.target.value;
      setSelectedYear(year);

      if (year === "") {
        setFilteredPlayers(playerListUpdated); // Show all if no filter is selected
      } else {
        setFilteredPlayers(playerListUpdated.filter(player => String(player['Fiscal Year']) === year));
      }
    };

     return (
      <Container>
        {/* Filter Dropdown */}
        <select className="form-select mb-3" value={selectedYear} onChange={handleFilterChange}>
          <option value="">All Seasons</option>
          {[...new Set(playerListUpdated.map(player => player['Fiscal Year']))].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <Row className="player-grid">
          {filteredPlayers.map((player, index) => (
            <Col xs="auto" sm="auto" md="auto" key={index} className="player-card-wrapper">
              <PlayerCard 
              player={player}
              />
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

function Stats() {
    return (
        <div className="Stats">
          <CardLayout/>
        </div>
      );
  }
  
  export default Stats;