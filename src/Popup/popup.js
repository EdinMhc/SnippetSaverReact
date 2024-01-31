/* global chrome */
import React, { useState } from 'react';
import '../Styles/popup.css'; // Adjust the path to your CSS file

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
        const newSnippet = { name: snippetName, content: snippetContent };
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
            </div>
            <input
            id="loadSnippets"
            type="submit"
            value="Load snippets"
            onClick={loadSnippets}
            />
        <div id="snippetContainer">
            {snippets.map((snippet, index) => (
                <div key={index} draggable={true}>
                    <div>{snippet.name}</div>
                </div>
            ))}
        </div>
        </div>
    );
}

export default Popup;
