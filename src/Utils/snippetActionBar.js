import React, { useState, useRef } from 'react';
import '../Styles/snippetActionBar.css';

export const SnippetActionBar = ({ onSearch }) => {
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef(null);

    const handleSearchIconClick = () => {
        setIsSearching(true);
        setTimeout(() => {
            searchInputRef.current.focus();
        }, 0);
    };

    const handleSearchBlur = () => {
        setIsSearching(false);
    };

    return (
        <div className="snippet-action-bar">
            {isSearching && (
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    className="search-input"
                    onBlur={handleSearchBlur}
                    onChange={(e) => onSearch(e.target.value)}
                />
             )}
            <div className="action-icons">
                {!isSearching && (
                    <button className="search-icon" onClick={handleSearchIconClick}>
                        <span className="material-icons">search</span>
                    </button>
                )}
                <button className="folder-button">
                    <span className="material-icons">folder</span>
                </button>
                <button className="sort-button">
                    <span className="material-icons">sort</span>
                </button>
            </div>
        </div>
    );
};

export default SnippetActionBar;