import '@/css/SearchToolbar.css';

const SearchToolbar = ({ searchTerm, onSearchChange }) => (
    <div className="search-toolbar">
        <input
            type="text"
            className="search-input"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
        />
    </div>
);

export default SearchToolbar;