/* global chrome */
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../Styles/popup.css';
import { saveSnippet, loadSnippets } from '../Utils/snippetActions';

function Popup() {
    const [snippetName, setSnippetName] = useState('');
    const [snippetContent, setSnippetContent] = useState('');
    const [snippets, setSnippets] = useState([]);
    const [snippetsVisible, setSnippetsVisible] = useState(false);

    const handleNameChange = (event) => {
        setSnippetName(event.target.value);
    };

    const handleContentChange = (event) => {
        setSnippetContent(event.target.value);
    };

    const toggleFavoriteStatus = (snippetName) => {
        const updatedSnippets = snippets.map(snippet => {
            if (snippet.name === snippetName) {
                return { ...snippet, isFavorite: !snippet.isFavorite };
            }
            return snippet;
        });
    
        setSnippets(updatedSnippets);
        chrome.storage.local.set({ snippets: updatedSnippets }, () => {
            console.log('Updated favorite status');
        });
    };
    
    const copySnippet = (snippetContent) => {
        navigator.clipboard.writeText(snippetContent)
            .then(() => {
                console.log('Snippet content copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy snippet: ', err);
            });
    };
    
    const toggleSnippetEditMode = (snippetName) => {
        // Implement the logic to enable editing mode for the snippet
    };
    
    const deleteSnippet = (snippetName) => {
        const updatedSnippets = snippets.filter(snippet => snippet.name !== snippetName);
        chrome.storage.local.set({ snippets: updatedSnippets }, () => {
            setSnippets(updatedSnippets);
            console.log('Snippet deleted');
        });
    };

    const toggleSnippetsVisibility = () => {
        if (!snippetsVisible) {
            loadSnippets(setSnippets);
        }
        setSnippetsVisible(!snippetsVisible);
    };

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
                onChange={handleNameChange}
            />
            <textarea
                id="snippetContent"
                placeholder="Content"
                value={snippetContent}
                onChange={handleContentChange}
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
                                                <span className="favorite-button material-icons" onClick={() => toggleFavoriteStatus(snippet.name)}>
                                                    {snippet.isFavorite ? 'favorite' : 'favorite_border'}
                                                </span>
                                                <span className="edit-button material-icons" onClick={() => toggleSnippetEditMode(snippet.name)}>
                                                    edit
                                                </span>
                                                <span className="copy-button material-icons" onClick={() => copySnippet(snippet.content)}>
                                                    content_copy
                                                </span>
                                                <span className="delete-button material-icons" onClick={() => deleteSnippet(snippet.name)}>
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
