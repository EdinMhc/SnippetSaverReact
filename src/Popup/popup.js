/* global chrome */
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../Styles/popup.css';
import {
    applyNameChange, saveSnippet, toggleFavoriteStatus, copySnippet, deleteSnippet,
    getHandleAddingName, getHandleAddingContent, getToggleSnippetsVisibility, saveSnippetOrder, toggleEdit, editName, 
    updateSnippetColor
} from '../Utils/snippetActions';
import { SnippetActionBar } from '../Utils/snippetActionBar';

const Popup = () => {
    const [snippetName, setSnippetName] = useState('');
    const [snippetContent, setSnippetContent] = useState('');
    const [snippets, setSnippets] = useState([]);
    const [snippetsVisible, setSnippetsVisible] = useState(false);
    const [editingValue, setEditingValue] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState({ hasError: false, message: "" });
    const [checkmarkError, setCheckmarkError] = useState(false);
    const [originalName, setOriginalName] = useState("");
    const [filteredSnippets, setFilteredSnippets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState('original');

    const handleAddingName = getHandleAddingName(setSnippetName);
    const handleAddingContent = getHandleAddingContent(setSnippetContent);
    const toggleSnippetsVisibility = getToggleSnippetsVisibility(snippetsVisible, setSnippetsVisible, setSnippets);

    const handleInputChange = (e) => setEditingValue(e.target.value);

    const handleSearch = (query) => {
        setSearchQuery(query);
        setFilteredSnippets(
            query ? snippets.filter(snippet => snippet.name.toLowerCase().includes(query.toLowerCase())) : snippets
        );
    };

    const applySorting = (snippetsToSort, sortMode) => {
        const sortedSnippets = [...snippetsToSort].sort((a, b) => {
            switch (sortMode) {
                case 'a-z': return a.name.localeCompare(b.name);
                case 'z-a': return b.name.localeCompare(a.name);
                case 'non-favorites': return a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? 1 : -1;
                default: return a.originalOrder - b.originalOrder;
            }
        });
        setFilteredSnippets(sortedSnippets);
    };

    const handleSort = () => {
        const nextMode = {
            original: 'a-z',
            'a-z': 'z-a',
            'z-a': 'non-favorites',
            'non-favorites': 'original'
        }[sortMode];
        setSortMode(nextMode);
        applySorting(snippets, nextMode);
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = [...snippets];
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSnippets(items);
        saveSnippetOrder(items);
    };

    const renderSnippet = (snippet, index) => (
        <Draggable 
        key={snippet.id.toString()} 
        draggableId={snippet.id.toString()} 
        index={index} 
        isDragDisabled={sortMode !== 'original'}
        >
            {(provided) => (
                <div ref={provided.innerRef} 
                {...provided.draggableProps} 
                {...provided.dragHandleProps} 
                className={`snippet-item ${snippet.isEditing ? 'editing' : ''}`}
                style={{
                    ...provided.draggableProps.style,
                    backgroundColor: snippet.color || '#333',
                }}
                >
                    {snippet.isEditing ? (
                        <input
                            type="text"
                            value={editingValue}
                            onChange={handleInputChange}
                            onBlur={() => applyNameChange(editingId, originalName, editingValue, snippets, setSnippets, setEditingValue, setEditingId, setCheckmarkError)}
                            autoFocus
                        />
                    ) : (
                        <div className="snippet-name">{snippet.name}</div>
                    )}
                    <SnippetActions snippet={snippet} />
                </div>
            )}
        </Draggable>
    );

    const SnippetActions = ({ snippet }) => (
        <div className="action-buttons">
            {snippet.isEditing ? (
                <span className={`apply-button material-icons ${checkmarkError ? 'checkmark-error' : ''}`} onClick={() => editName(editingId, editingValue, snippets, setSnippets, setCheckmarkError)}>
                    check
                </span>
            ) : (
                <>
                    <span className="favorite-button material-icons action-button" 
                    onClick={() => toggleFavoriteStatus(snippet.name, snippets, setSnippets)}
                    title="Favorite snippet"
                    >
                        {snippet.isFavorite ? 'favorite' : 'favorite_border'}
                    </span>
                    <span className="edit-button material-icons action-button" 
                    onClick={() => toggleEdit(snippet.id, snippets, setEditingValue, setEditingId, setSnippets, setOriginalName)}
                    title="Edit snippet"
                    >
                        edit
                    </span>
                    <span className="copy-button material-icons action-button" onClick={() => copySnippet(snippet.content)} title="Copy content">
                        content_copy
                    </span>
                    <span className="delete-button material-icons action-button" 
                        onClick={() => deleteSnippet(snippet.name, snippets, setSnippets)}
                        title="Delete snippet"
                        >
                        delete
                    </span>
                    <input
                    type="color"
                    value={snippet.color || '#333'}
                    onChange={(e) => updateSnippetColor(snippet.id, e.target.value, snippets, setSnippets)}
                    title="Change snippet color"
                    className="color-picker material-icons action-button"/>
                </>
            )}
        </div>
    );

    return (
        <div className="popup-container">
            <h1 id="header">Snippet Saver</h1>
            <p id="errorMessage">{error.hasError ? error.message : ""}</p>
            <input
                id="snippetName"
                type="text"
                placeholder="Name"
                value={snippetName}
                onChange={handleAddingName}
                className={error.hasError ? "input-error" : ""}
            />
            <textarea
                id="snippetContent"
                placeholder="Content"
                value={snippetContent}
                onChange={handleAddingContent}
            />
            <div className="button-container">
                <input id="saveSnippet" type="submit" value="Save snippet" onClick={() => saveSnippet(setSnippets, snippetName, snippetContent, setSnippetName, setSnippetContent, setError)} />
                <input id="loadSnippets" type="submit" value="Load snippets" onClick={toggleSnippetsVisibility} />
            </div>

            {snippetsVisible && (
                <DragDropContext onDragEnd={onDragEnd}>
                    <SnippetActionBar onSearch={handleSearch} onSort={handleSort} />
                    <Droppable droppableId="snippetsDroppable">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} id="snippetContainer">
                                {(searchQuery || sortMode !== 'original' ? filteredSnippets : snippets).map(renderSnippet)}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
};

export default Popup;