/* global chrome */
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
