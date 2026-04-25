import { Link } from 'react-router-dom';

const ActionCard = ({ to, isExternal, icon, iconBg, title, description }) => {
  const cardContent = (
    <div style={styles.card}>
      <div style={{ ...styles.cardIconWrapper, backgroundColor: iconBg }}>
        {icon}
      </div>
      <h2 style={styles.cardTitle}>{title}</h2>
      <p style={styles.cardDesc}>{description}</p>
    </div>
  );

  if (isExternal) {
    return (
      <a href={to} style={styles.cardLink}>
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={to} style={styles.cardLink}>
      {cardContent}
    </Link>
  );
};

const styles = {
  cardLink: {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    width: '200px',
    boxShadow: '0 2px 12px rgba(59,111,212,0.07)',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    flex: 1,
  },
  cardIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  cardDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#888',
    textAlign: 'center',
    lineHeight: '1.5',
  },
};

export default ActionCard;
