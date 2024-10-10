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

export const updateSnippetColor = (snippetId, newColor, snippets, setSnippets) => {
    const updatedSnippets = snippets.map(snippet => {
        if (snippet.id === snippetId) {
            return { ...snippet, color: newColor };
        }
        return snippet;
    });

    setSnippets(updatedSnippets);
    chrome.storage.local.set({ snippets: updatedSnippets });
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
    
        const newSnippet = { 
            id: newId, 
            name: snippetName, 
            content: snippetContent, 
            isFavorite: false,
            color: '#ffffff'
        };
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
        let loadedSnippets = result.snippets.map((snippet, index) => ({
            ...snippet,
            originalOrder: index
        }));

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

export const toggleEdit = (snippetId, snippets, setEditingValue, setEditingId, setSnippets, setOriginalName) => {
    const updatedSnippets = snippets.map(snippet => {
        if (snippet.id === snippetId) {
            if (!snippet.isEditing) {
                setEditingValue(snippet.name);
                setEditingId(snippetId);
                setOriginalName(snippet.name);
                return { ...snippet, isEditing: true };
            } else {
                return { ...snippet, isEditing: false };
            }
        } else {
            return { ...snippet, isEditing: false };
        }
    });

    setSnippets(updatedSnippets);
};


export const applyNameChange = (snippetId, originalName, newName, snippets, setSnippets, setEditingValue, setEditingId, setCheckmarkError) => {
    setCheckmarkError(false);

    const isDuplicate = snippets.some(snippet => snippet.name === newName && snippet.id !== snippetId);
    const updatedName = isDuplicate ? originalName : newName;

    const updatedSnippets = snippets.map(snippet => {
        if (snippet.id === snippetId) {
            return { ...snippet, name: updatedName, isEditing: false };
        }
        return snippet;
    });

    setSnippets(updatedSnippets);
    chrome.storage.local.set({ snippets: updatedSnippets });

    setEditingValue("");
    setEditingId(null);

    if (isDuplicate) {
        setCheckmarkError(true);
        setTimeout(() => setCheckmarkError(false), 2000);
    }
};



export const editName = (snippetId, newName, snippets, setSnippets, setCheckmarkError) => {
    if (snippets.some(snippet => snippet.name === newName && snippet.id !== snippetId)) {
        setCheckmarkError(true);
        setTimeout(() => setCheckmarkError(false), 2000);
        return;
    }

    const updatedSnippets = snippets.map(snippet => {
        if (snippet.id === snippetId) {
            return { ...snippet, name: newName, isEditing: false };
        }
        return snippet;
    });

    setSnippets(updatedSnippets);
    chrome.storage.local.set({ snippets: updatedSnippets });
    setCheckmarkError(false);

};
