// 搜索管理器
class SearchManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
    }

    search(query) {
        if (!query) return this.taskManager.items;

        const lowerQuery = query.toLowerCase();
        return this.taskManager.items.filter(item => {
            return item.content.toLowerCase().includes(lowerQuery) ||
                   item.notes.toLowerCase().includes(lowerQuery) ||
                   item.assignee.toLowerCase().includes(lowerQuery) ||
                   item.creator.toLowerCase().includes(lowerQuery);
        });
    }

    addSearchListener() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const results = this.search(e.target.value);
                this.renderSearchResults(results);
            });
        }
    }

    renderSearchResults(results) {
        const container = document.getElementById('todoList');
        if (container) {
            container.innerHTML = results.map(item => this.taskManager.renderTodoItem(item)).join('');
        }
    }
}

export default SearchManager;