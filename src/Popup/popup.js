/* global chrome */
import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../Styles/popup.css';
import { saveSnippet, toggleFavoriteStatus, copySnippet, deleteSnippet, getHandleAddingName, getHandleAddingContent, getToggleSnippetsVisibility } from '../Utils/snippetActions';

function Popup() {
    const [snippetName, setSnippetName] = useState('');
    const [snippetContent, setSnippetContent] = useState('');
    const [snippets, setSnippets] = useState([]);
    const [snippetsVisible, setSnippetsVisible] = useState(false);

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
    };

    return (
        <div className="popup-container">
            <h1 id="header">Snippet Saver</h1>
            <input
                id="snippetName"
                type="text"
                placeholder="Name"
                value={snippetName}
                onChange={handleAddingName}
            />
            <textarea
                id="snippetContent"
                placeholder="Content"
                value={snippetContent}
                onChange={handleAddingContent}
            />
            <p id="errorMessage"></p>
            <div className="button-container">
                <input
                    id="saveSnippet"
                    type="submit"
                    value="Save snippet"
                    onClick={() => saveSnippet(snippets, setSnippets, snippetName, snippetContent, setSnippetName, setSnippetContent)}
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
                                    <Draggable key={snippet.name} draggableId={snippet.name} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="snippet-item">
                                                <div>{snippet.name}</div>
                                                <span className="favorite-button material-icons" onClick={() => toggleFavoriteStatus(snippet.name, snippets, setSnippets)}>
                                                    {snippet.isFavorite ? 'favorite' : 'favorite_border'}
                                                </span>
                                                <span className="edit-button material-icons">
                                                    edit
                                                </span>
                                                <span className="copy-button material-icons" onClick={() => copySnippet(snippet.content)}>
                                                    content_copy
                                                </span>
                                                <span className="delete-button material-icons" onClick={() => deleteSnippet(snippet.name, snippets, setSnippets)}>
                                                    delete
                                                </span>
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
