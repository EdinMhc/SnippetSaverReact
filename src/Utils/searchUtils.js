export const filterSnippetsByName = (snippets, query) => {
    return snippets.filter(snippet => snippet.name.toLowerCase().includes(query.toLowerCase()));
};