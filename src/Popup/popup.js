/* global chrome */
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../Styles/popup.css';

function Popup() {
    const [snippetName, setSnippetName] = useState('');
    const [snippetContent, setSnippetContent] = useState('');
    const [snippets, setSnippets] = useState([]);

    const handleNameChange = (event) => {
        setSnippetName(event.target.value);
    };

    const handleContentChange = (event) => {
        setSnippetContent(event.target.value);
    };

    const saveSnippet = () => {
        if (snippets.some(snippet => snippet.name === snippetName)) {
            console.error('Snippet name must be unique.');
            return;
        }
    
        const newSnippet = { id: snippetName, name: snippetName, content: snippetContent };
        chrome.storage.local.get({ snippets: [] }, (result) => {
            const updatedSnippets = [...result.snippets, newSnippet];
            chrome.storage.local.set({ snippets: updatedSnippets }, () => {
                console.log('Snippet saved');
                setSnippets(updatedSnippets);
                setSnippetName('');
                setSnippetContent('');
            });
        });
    };
    

    const loadSnippets = () => {
        chrome.storage.local.get({ snippets: [] }, (result) => {
            let loadedSnippets = result.snippets;
            loadedSnippets.sort((a, b) => a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1);
            console.log('Loaded snippets:', loadedSnippets);
            setSnippets(loadedSnippets);
        });
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
                    onClick={saveSnippet}
                />
                <input
                    id="loadSnippets"
                    type="submit"
                    value="Load snippets"
                    onClick={loadSnippets}
                />
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="snippetsDroppable">
                    {(provided) => (
                        <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                            id="snippetContainer"
                        >
                            {snippets.map((snippet, index) => (
                                <Draggable key={snippet.name} draggableId={snippet.name} index={index}>
                                    {(provided) => (
                                        <div 
                                            ref={provided.innerRef} 
                                            {...provided.draggableProps} 
                                            {...provided.dragHandleProps}
                                            className="snippet-item"
                                        >
                                            <div>{snippet.name}</div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

export default Popup;
