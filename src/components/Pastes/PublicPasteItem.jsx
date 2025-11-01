import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const trimContent = (text, maxLength = 80) => {
  if (!text) return "";
  return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
};

const PublicPasteItem = ({ paste, onSelect }) => {
  return (
    <div className="public-paste-item p-2 mb-2 rounded custom-border" style={{ cursor: "pointer" }} onClick={() => onSelect(paste.paste_key)}>
      <h5 className="m-0">{paste.title}</h5>
      <p className="m-0 text-truncate">{trimContent(paste.content, 100)}</p>
      <small className="custom-text-muted">
        {new Date(paste.created_at).toLocaleString()}
      </small>
    </div>
  );
};

PublicPasteItem.propTypes = {
  paste: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
};

export default PublicPasteItem;
