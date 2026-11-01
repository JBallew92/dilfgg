import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import { list } from './orgStats.js';

function getImage(name, year) {
    return (
      process.env.PUBLIC_URL +
      '/images/profile_pics/' +
      name + ' ' + year +
      '.png'
    );
}

function AboutUs() {
    return( 
     <Container>
        <Row className="org-stats"> 
            <Col xs={12} sm={12} md={6} lg={6} xl={6} order={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1}} className="org-stats-text d-flex">
            Dominoes International League Federation was founded in 2022 outside of Portland, Oregon. Our highly competitive family decided playing dominoes simply wasn't enough so we started tracking the stats!
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6} order={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2}} className="org-stats-picture p-0">
            <Image
                className="map"
                src={process.env.PUBLIC_URL + '/images/assets/portland.png'}
                alt="Portland, Oregon"
                fluid
                style={{ maxWidth: '100%', height: '100%' }}
            />
            </Col>
        </Row>
        <Row className="org-stats"> 
            <Col xs={12} sm={12} md={6} lg={6} xl={6} order={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2}} className="org-stats-text d-flex align-items-center justify-content-center text-center order-sm-1 order-md-2">
                Since 2022 DILF has grown to a total of {list[0]["Total Players"]} players, spanning {list[0]["Nations"]} nations, with {list[0]["Games Played"]} games under our BELT.
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6} order={{ xs: 2, sm: 2, md: 1, lg: 1, xl: 1}} className="org-stats-picture p-0 order-sm-2 order-md-1">
                <Image
                    className="map"
                    src={process.env.PUBLIC_URL + '/images/assets/Map-reduced.png'}
                    alt="Two Nations"
                    fluid
                    style={{ maxWidth: '100%', height: '100%' }}
                />
            </Col>
        </Row>
        <Row className="org-stats"> 
            <Col xs={12} sm={12} md={6} lg={6} xl={6} order={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1}} className="org-stats-text d-flex">
                Speaking of belt, {list[0]["Winners"]} players have earned the legendary and sought after belt after winning 13 hard fought rounds of Chickenfoot Dominoes.
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6} order={{ xs: 2, sm: 2, md: 2, lg: 2, xl: 2}} className="org-stats-picture p-0">
                <Image
                    className="map"
                    src={process.env.PUBLIC_URL + '/images/assets/belt.png'}
                    alt="Belt"
                    fluid
                    style={{ maxWidth: '100%', height: '100%' }}
                />
            </Col>
        </Row>
        <Row className="org-stats"> 
            <Col xs={12} sm={12} md={6} lg={6} xl={6} order={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2}} className="org-stats-text d-flex align-items-center justify-content-center text-center order-sm-1 order-md-2">
                And while we're all still striving for that perfect game, everyone is contributing to the communities all time score!
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6} order={{ xs: 2, sm: 2, md: 1, lg: 1, xl: 1}} className="org-stats-picture p-0 order-sm-2 order-md-1">
                <div class="high-score-container">
                    <span class="label">HIGH SCORE</span>
                    <span class="score">{list[0]["Total Score"].toLocaleString()}</span>
                </div>
            </Col>
        </Row>
        <Row className="mb-5">
            {[
                ["Aven-itza De Primavera", "2023", "Head of Marketing & Branding"],
                ["Dave Herzog", "2023", "Co-Founder"],
                ["Kristen Herzog", "2024", "Co-Founder"],
                ["James Ballew", "2023", "Co-Founder"],
                ["Zach Blaylock", "2024", "Chapter Lead - East Coast"],
                ["Judith Williams-Jones", "2024", "Chapter Lead - East Coast"]
            ].map(([name, year, title], idx) => (
                <Col key={idx} xs={6} md={4} className="text-center mb-4">
                <Image
                    src={getImage(name, year)}
                    alt={name}
                    roundedCircle
                    fluid
                />
                <div>{name}</div>
                <div><i>{title}</i></div>
                </Col>
            ))}
        </Row>
     </Container>);
   }
   
export default AboutUs;