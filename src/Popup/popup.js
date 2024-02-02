/* global chrome */
import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../Styles/popup.css';
import { applyNameChange, saveSnippet, toggleFavoriteStatus, copySnippet, deleteSnippet, getHandleAddingName, getHandleAddingContent, getToggleSnippetsVisibility, saveSnippetOrder, toggleEdit } from '../Utils/snippetActions';

function Popup() {
    const [snippetName, setSnippetName] = useState('');
    const [snippetContent, setSnippetContent] = useState('');
    const [snippets, setSnippets] = useState([]);
    const [snippetsVisible, setSnippetsVisible] = useState(false);
    const [editingValue, setEditingValue] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState({ hasError: false, message: "" });

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
                <Droppable droppableId="snippetsDroppable">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} id="snippetContainer">
                            {snippets.map((snippet, index) => (
                                <Draggable key={snippet.id.toString()} draggableId={snippet.id.toString()} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`snippet-item ${snippet.isEditing ? 'editing' : ''}`}>
                                            {snippet.isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingValue}
                                                    onChange={handleInputChange}
                                                    onBlur={() => applyNameChange(snippets, setSnippets, setEditingValue, setEditingId, editingId, editingValue)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="snippet-name">{snippet.name}</div>
                                            )}
                                            <div className="action-buttons">
                                                {snippet.isEditing ? (
                                                    <span className="apply-button material-icons" onClick={() => applyNameChange(snippets, setSnippets, setEditingValue, setEditingId, editingId, editingValue)}>check</span>
                                                ) : (
                                                    <>
                                                        <span className="favorite-button material-icons action-button" onClick={() => toggleFavoriteStatus(snippet.name, snippets, setSnippets)}>
                                                            {snippet.isFavorite ? 'favorite' : 'favorite_border'}
                                                        </span>
                                                        <span className="edit-button material-icons action-button" onClick={() => toggleEdit(snippet.id, snippets, setEditingValue, setEditingId, setSnippets)}>
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
