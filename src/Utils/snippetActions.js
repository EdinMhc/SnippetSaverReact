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

export const saveSnippetOrder = (snippets) => {
    chrome.storage.local.set({ snippets: snippets });
};

export const saveSnippet = (setSnippets, snippetName, snippetContent, setSnippetName, setSnippetContent, setError) => {
    chrome.storage.local.get({ snippets: [] }, (result) => {
        const messageDuration = 2000;
        const animationTimeBeforeItCanBePlayed = 100;
        
        const allSnippets = result.snippets;

        if (allSnippets.some(snippet => snippet.name === snippetName)) {
            setError({ hasError: false, message: "" });

            setTimeout(() => {
                setError({ hasError: true, message: "Snippet name already exists." });

                setTimeout(() => {
                    setError({ hasError: false, message: "" });
                }, messageDuration);
            }, animationTimeBeforeItCanBePlayed);

            return;
        }
    
        setError({ hasError: false, message: "" });
        const maxId = allSnippets.reduce((max, snippet) => Math.max(max, snippet.id), 0);
        const newId = maxId + 1;
    
        const newSnippet = { id: newId, name: snippetName, content: snippetContent, isFavorite: false };
        chrome.storage.local.get({ snippets: [] }, (result) => {
            const updatedSnippets = [...allSnippets, newSnippet];
            chrome.storage.local.set({ snippets: updatedSnippets }, () => {
                setSnippets(updatedSnippets);
                setSnippetName('');
                setSnippetContent('');
            });
        });
    });
};

export const loadSnippets = (setSnippets) => {
    chrome.storage.local.get({ snippets: [] }, (result) => {
        let loadedSnippets = result.snippets;

        let favoriteSnippets = loadedSnippets.filter(snippet => snippet.isFavorite);
        let nonFavoriteSnippets = loadedSnippets.filter(snippet => !snippet.isFavorite);

        let sortedSnippets = [...favoriteSnippets, ...nonFavoriteSnippets];

        setSnippets(sortedSnippets);
    });
};

export const toggleFavoriteStatus = (snippetName, snippets, setSnippets) => {
    const updatedSnippets = snippets.map(snippet => {
        if (snippet.name === snippetName) {
            return { ...snippet, isFavorite: !snippet.isFavorite };
        }
        return snippet;
    });

    let favoriteSnippets = updatedSnippets.filter(snippet => snippet.isFavorite);
    let nonFavoriteSnippets = updatedSnippets.filter(snippet => !snippet.isFavorite);

    let sortedSnippets = [...favoriteSnippets, ...nonFavoriteSnippets];

    setSnippets(sortedSnippets);
    chrome.storage.local.set({ snippets: sortedSnippets });
};


export const copySnippet = (snippetContent) => {
    navigator.clipboard.writeText(snippetContent)
        .then()
        .catch(err => {
            console.error('Failed to copy snippet: ', err);
        });
};

export  const deleteSnippet = (snippetName, snippets, setSnippets) => {
    const updatedSnippets = snippets.filter(snippet => snippet.name !== snippetName);
    chrome.storage.local.set({ snippets: updatedSnippets }, () => {
        setSnippets(updatedSnippets);
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

export const toggleEdit = (snippetId, snippets, setEditingValue, setEditingId, setSnippets) => {
    const updatedSnippets = snippets.map(snippet => {
        if (snippet.id === snippetId) {
            if (!snippet.isEditing) {
                setEditingValue(snippet.name);
                setEditingId(snippetId);
            }
            return { ...snippet, isEditing: !snippet.isEditing };
        }
        return snippet;
    });
    setSnippets(updatedSnippets);
};

export const applyNameChange = (snippets, setSnippets, setEditingValue, setEditingId, editingId, editingValue) => {
    const updatedSnippets = snippets.map(snippet => {
        if (snippet.id === editingId) {
            return { ...snippet, name: editingValue, isEditing: false };
        }
        return snippet;
    });
    setSnippets(updatedSnippets);
    chrome.storage.local.set({ snippets: updatedSnippets });
    setEditingValue("");
    setEditingId(null);
};