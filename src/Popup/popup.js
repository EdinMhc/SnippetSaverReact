/* global chrome */
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../Styles/popup.css';
import { applyNameChange, saveSnippet, toggleFavoriteStatus, copySnippet, deleteSnippet, getHandleAddingName, getHandleAddingContent, getToggleSnippetsVisibility, saveSnippetOrder, toggleEdit, editName } from '../Utils/snippetActions';
import { SnippetActionBar } from '../Utils/snippetActionBar';

function Popup() {
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

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(snippets);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSnippets(items);
        saveSnippetOrder(items);
    };

    const handleInputChange = (e) => {
        setEditingValue(e.target.value);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query) {
            setFilteredSnippets(snippets);
        } else {
            const filtered = snippets.filter(snippet =>
                snippet.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredSnippets(filtered);
        }
    };
    
    const applySorting = (snippetsToSort, sortMode) => {    
        let sortedSnippets = [...snippetsToSort];

        switch (sortMode) {
            case 'a-z':
                sortedSnippets.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'z-a':
                sortedSnippets.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'non-favorites':
                sortedSnippets.sort((a, b) => a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? 1 : -1);
                break;
            case 'original':
                sortedSnippets.sort((a, b) => a.originalOrder - b.originalOrder);
                break;
            case 'last-added':
                sortedSnippets = [...snippetsToSort].sort((a, b) => b.id - a.id);
                break;
        }
    
        setFilteredSnippets(sortedSnippets);
    };

    const getNextSortMode = (currentMode) => {
        switch (currentMode) {
            case 'original': return 'a-z';
            case 'a-z': return 'z-a';
            case 'z-a': return 'non-favorites';
            case 'non-favorites': return 'last-added';
            case 'last-added': return 'original';
            default: return 'original';
        }
    };

    const handleSort = () => {
        const nextMode = getNextSortMode(sortMode);
        setSortMode(nextMode);
        applySorting(snippets, nextMode);
    };
    
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
                <input
                    id="saveSnippet"
                    type="submit"
                    value="Save snippet"
                    onClick={() => saveSnippet(setSnippets, snippetName, snippetContent, setSnippetName, setSnippetContent, setError)}
                />
                <input
                    id="loadSnippets"
                    type="submit"
                    value="Load snippets"
                    onClick={toggleSnippetsVisibility}
                />
            </div>
    
            {snippetsVisible && (
    <DragDropContext onDragEnd={onDragEnd}>
        <SnippetActionBar onSearch={handleSearch} onSort={handleSort} />
        <Droppable droppableId="snippetsDroppable">
            {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} id="snippetContainer">
                    {(searchQuery.length > 0 || sortMode !== 'original' ? filteredSnippets : snippets).map((snippet, index) => (
                        <Draggable key={snippet.id.toString()} draggableId={snippet.id.toString()} index={index} isDragDisabled={sortMode !== 'original'}>
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`snippet-item ${snippet.isEditing ? 'editing' : ''}`}>
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
                                    <div className="action-buttons">
                                        {snippet.isEditing ? (
                                            <span className={`apply-button material-icons ${checkmarkError ? 'checkmark-error' : ''}`} onClick={() => editName(editingId, editingValue, snippets, setSnippets, setCheckmarkError)}>
                                                check
                                            </span>
                                        ) : (
                                            <>
                                                <span className="favorite-button material-icons action-button" onClick={() => toggleFavoriteStatus(snippet.name, snippets, setSnippets)}>
                                                    {snippet.isFavorite ? 'favorite' : 'favorite_border'}
                                                </span>
                                                <span className="edit-button material-icons action-button" onClick={() => toggleEdit(snippet.id, snippets, setEditingValue, setEditingId, setSnippets, setOriginalName)}>
                                                    edit
                                                </span>
                                                <span className="copy-button material-icons action-button" onClick={() => copySnippet(snippet.content)}>
                                                    content_copy
                                                </span>
                                                <span className="delete-button material-icons action-button" onClick={() => deleteSnippet(snippet.name, snippets, setSnippets)}>
                                                    delete
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    </DragDropContext>
)}
    </div>
    );
}

export default Popup;