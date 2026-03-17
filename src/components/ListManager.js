// 清单管理器
class ListManager {
    constructor() {
        this.lists = this.loadListsFromStorage();
        this.currentListId = this.lists.length > 0 ? this.lists[0].id : null;
    }

    loadListsFromStorage() {
        try {
            const stored = localStorage.getItem('todoLists');
            const lists = stored ? JSON.parse(stored) : [
                {
                    id: 'default',
                    name: '默认清单',
                    icon: '📋',
                    color: '#4a90e2',
                    createdAt: new Date().toISOString()
                }
            ];
            return lists;
        } catch (e) {
            console.error('清单加载失败，重置为默认:', e);
            return [
                {
                    id: 'default',
                    name: '默认清单',
                    icon: '📋',
                    color: '#4a90e2',
                    createdAt: new Date().toISOString()
                }
            ];
        }
    }

    saveListsToStorage() {
        localStorage.setItem('todoLists', JSON.stringify(this.lists));
    }

    createList(listData) {
        const newList = {
            id: listData.id || this.generateListId(),
            name: listData.name || '新建清单',
            icon: listData.icon || '📋',
            color: listData.color || '#4a90e2',
            createdAt: new Date().toISOString()
        };
        this.lists.push(newList);
        this.saveListsToStorage();
        return newList;
    }

    updateList(id, updates) {
        const list = this.lists.find(l => l.id === id);
        if (list) {
            Object.assign(list, updates);
            this.saveListsToStorage();
        }
    }

    deleteList(id) {
        if (id === 'default') return false;

        this.lists = this.lists.filter(l => l.id !== id);
        this.saveListsToStorage();
        return true;
    }

    generateListId() {
        return 'list_' + Date.now();
    }

    getCurrentList() {
        return this.lists.find(l => l.id === this.currentListId) || this.lists[0];
    }

    setCurrentList(listId) {
        this.currentListId = listId;
    }

    getAllLists() {
        return this.lists;
    }

    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default ListManager;