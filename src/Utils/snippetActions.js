/* global chrome */

export const getHandleAddingName = (setSnippetName) => {
    return (event) => {
        setSnippetName(event.target.value);
    };
};

export const getHandleAddingContent = (setSnippetContent) => {
    return (event) => {
        setSnippetContent(event.target.value);
    };
};

export const saveSnippet = (snippets, setSnippets, snippetName, snippetContent, setSnippetName, setSnippetContent) => {
    if (snippets.some(snippet => snippet.name === snippetName)) {
        console.error('Snippet name must be unique.');
        return;
    }

    const newSnippet = { id: snippetName, name: snippetName, content: snippetContent, isFavorite: false };
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

export const loadSnippets = (setSnippets) => {
    chrome.storage.local.get({ snippets: [] }, (result) => {
        let loadedSnippets = result.snippets;
        loadedSnippets.sort((a, b) => a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1);
        console.log('Loaded snippets:', loadedSnippets);
        setSnippets(loadedSnippets);
    });
};

export const toggleFavoriteStatus = (snippetName, snippets, setSnippets) => {
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

export const copySnippet = (snippetContent) => {
    navigator.clipboard.writeText(snippetContent)
        .then(() => {
            console.log('Snippet content copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy snippet: ', err);
        });
};

export  const deleteSnippet = (snippetName, snippets, setSnippets) => {
    const updatedSnippets = snippets.filter(snippet => snippet.name !== snippetName);
    chrome.storage.local.set({ snippets: updatedSnippets }, () => {
        setSnippets(updatedSnippets);
        console.log('Snippet deleted');
    });
};

export const getToggleSnippetsVisibility = (snippetsVisible, setSnippetsVisible, setSnippets) => {
    return () => {
        if (!snippetsVisible) {
            loadSnippets(setSnippets);
        }
        setSnippetsVisible(!snippetsVisible);
    };
};