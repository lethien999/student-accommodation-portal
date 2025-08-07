import React, { useEffect, useState } from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaSearch, FaHome, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa';
import AdvertisementDisplay from '../components/AdvertisementDisplay';
import './Home.css'; // Custom styles for Home page
import AccommodationCard from '../components/AccommodationCard';
import accommodationService from '../services/accommodationService';
import { useTranslation } from 'react-i18next';

const features = [
  {
    title: 'Tìm kiếm dễ dàng',
    description: 'Tìm kiếm nhà trọ phù hợp với nhu cầu của bạn một cách nhanh chóng và hiệu quả.',
    icon: <FaSearch size={40} />
  },
  {
    title: 'Đa dạng lựa chọn',
    description: 'Hàng nghìn phòng trọ chất lượng với đầy đủ tiện nghi cho bạn lựa chọn.',
    icon: <FaHome size={40} />
  },
  {
    title: 'An toàn và đáng tin cậy',
    description: 'Thông tin chính xác, minh bạch và được xác thực bởi đội ngũ quản lý.',
    icon: <FaShieldAlt size={40} />
  },
  {
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn.',
    icon: <FaQuestionCircle size={40} />
  }
];

const HomePage = () => {
  const { t } = useTranslation();
  const [latestAccommodations, setLatestAccommodations] = useState([]);
  const [loadingAccommodations, setLoadingAccommodations] = useState(true);
  const [errorAccommodations, setErrorAccommodations] = useState('');

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoadingAccommodations(true);
        const data = await accommodationService.searchAccommodations({ limit: 6, page: 1 });
        setLatestAccommodations(data.accommodations || []);
      } catch (err) {
        setErrorAccommodations('Không thể tải danh sách nhà trọ mới nhất.');
      } finally {
        setLoadingAccommodations(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <>
      <Helmet>
        <title>Tìm nhà trọ phù hợp - Student Accommodation Portal</title>
        <meta name="description" content="Tìm kiếm hàng nghìn phòng trọ chất lượng, an toàn và đáng tin cậy. Đặt cọc, thanh toán dễ dàng, hỗ trợ 24/7." />
        <meta property="og:title" content="Tìm nhà trọ phù hợp - Student Accommodation Portal" />
        <meta property="og:description" content="Tìm kiếm hàng nghìn phòng trọ chất lượng, an toàn và đáng tin cậy." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <div className="hero-section text-center text-white py-5">
        <Container>
          <h1 className="display-4">{t('Welcome')}</h1>
          <p className="lead">
            {t('Find your ideal boarding house quickly and easily!')}
          </p>
          <Button as={Link} to="/accommodations" variant="primary" size="lg" className="mt-3">
            {t('Search')}
          </Button>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center section-title">{t('Why choose us?')}</h2>
        <Row>
          {features.map((feature, index) => (
            <Col md={6} lg={3} key={index} className="mb-4">
              <div className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p className="text-muted">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Advertisement Display Section */}
      <Container className="py-5">
        <AdvertisementDisplay />
      </Container>

      {/* How It Works Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center section-title">{t('How it works')}</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center how-it-works-card">
                <Card.Body>
                  <Card.Title as="h3" className="mb-3">1. {t('Search')}</Card.Title>
                  <Card.Text>
                    Sử dụng bộ lọc thông minh để tìm phòng trọ phù hợp với nhu cầu của bạn.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center how-it-works-card">
                <Card.Body>
                  <Card.Title as="h3" className="mb-3">2. {t('Contact')}</Card.Title>
                  <Card.Text>
                    Liên hệ trực tiếp với chủ trọ thông qua hệ thống tin nhắn an toàn của chúng tôi.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center how-it-works-card">
                <Card.Body>
                  <Card.Title as="h3" className="mb-3">3. {t('Book')}</Card.Title>
                  <Card.Text>
                    Đặt phòng và thanh toán một cách an toàn và tiện lợi ngay trên nền tảng.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Latest Accommodations Section */}
      <Container className="py-5">
        <h2 className="text-center section-title">{t('Latest accommodations')}</h2>
        {loadingAccommodations ? (
          <div className="text-center py-4">
            <div className="loading-spinner"></div>
            <p className="mt-3 text-muted">{t('Loading accommodations...')}</p>
          </div>
        ) : errorAccommodations ? (
          <div className="text-center text-danger">
            <p>{errorAccommodations}</p>
            <Button variant="outline-primary" onClick={() => window.location.reload()}>
              {t('Try again')}
            </Button>
          </div>
        ) : latestAccommodations.length === 0 ? (
          <div className="text-center text-muted">
            <p>{t('No accommodations found.')}</p>
            <Button as={Link} to="/accommodations" variant="primary">
              {t('View all accommodations')}
            </Button>
          </div>
        ) : (
          <>
            <Row>
              {latestAccommodations.map(acc => (
                <Col key={acc.id} md={4} className="mb-4">
                  <AccommodationCard accommodation={acc} />
                </Col>
              ))}
            </Row>
            <div className="text-center mt-4">
              <Button as={Link} to="/accommodations" variant="outline-primary" size="lg">
                {t('View all accommodations')}
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default HomePage;