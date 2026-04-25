import { Link } from 'react-router-dom';

const ActionCard = ({ to, isExternal, icon, iconBg, title, description }) => {
  const cardContent = (
    <div className="action-card">
      <div className="action-card-icon" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <h2 className="action-card-title">{title}</h2>
      <p className="action-card-desc">{description}</p>
    </div>
  );

  if (isExternal) {
    return (
      <a href={to} className="action-card-link">
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={to} className="action-card-link">
      {cardContent}
    </Link>
  );
};
export default ActionCard;
