import React from 'react';
import './FilterBar.css';

const RATINGS = [0, 4, 4.5, 4.7];
const RATING_LABELS = ['Любой', '4+', '4.5+', '4.7+'];

const SORT_OPTIONS = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Цена ↑' },
  { value: 'price-desc', label: 'Цена ↓' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'name', label: 'По названию' },
];

function FilterBar({ categories, filters, onFilterChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Поиск</label>
        <input
          type="text"
          className="search-input"
          placeholder="Название или описание..."
          value={filters.search}
          onChange={e => onFilterChange('search', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Категория</label>
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-tab ${filters.category === cat ? 'active' : ''}`}
              onClick={() => onFilterChange('category', cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Рейтинг</label>
        <div className="rating-tabs">
          {RATINGS.map((r, i) => (
            <button
              key={r}
              className={`rating-tab ${filters.minRating === r ? 'active' : ''}`}
              onClick={() => onFilterChange('minRating', r)}
            >
              {RATING_LABELS[i]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Сортировка</label>
        <select
          className="sort-select"
          value={filters.sortBy}
          onChange={e => onFilterChange('sortBy', e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FilterBar;
