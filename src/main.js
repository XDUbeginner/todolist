import ListManager from './components/ListManager.js';
import TaskManager from './components/TaskManager.js';
import ViewManager from './components/ViewManager.js';
import SearchManager from './components/SearchManager.js';
import AttachmentManager from './components/AttachmentManager.js';
import SyncManager from './components/SyncManager.js';

// 主应用类
class TodoApp {
    constructor() {
        this.listManager = new ListManager();
        this.taskManager = new TaskManager(this.listManager);
        this.viewManager = new ViewManager(this.taskManager, this.listManager);
        this.searchManager = new SearchManager(this.taskManager);
        this.attachmentManager = new AttachmentManager(this.taskManager);
        this.syncManager = new SyncManager(this.taskManager);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCurrentView();
        this.loadListOptions();
        this.setupUploadListener();
        this.showNotification('应用初始化完成', 'success');
    }

    setupEventListeners() {
        // 视图切换
        document.getElementById('viewMode')?.addEventListener('change', (e) => {
            this.renderCurrentView();
        });

        // 清单切换
        document.getElementById('listSelector')?.addEventListener('change', (e) => {
            this.listManager.setCurrentList(e.target.value);
            this.renderCurrentView();
        });

        // 搜索功能
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            const results = this.searchManager.search(query);
            const currentView = this.viewManager.getCurrentView();
            const container = document.getElementById('todoList');

            if (currentView && container) {
                container.innerHTML = results.map(item => this.taskManager.renderTodoItem(item)).join('');
            }
        });
    }

    renderCurrentView() {
        const viewMode = document.getElementById('viewMode')?.value || 'day';
        this.viewManager.renderView(viewMode);
    }

    loadListOptions(selectedListId = null) {
        const selector = document.getElementById('listSelector');
        if (!selector) return;

        const lists = this.listManager.getAllLists();
        const currentListId = selectedListId || this.listManager.getCurrentList().id;

        selector.innerHTML = lists.map(list => `
            <option value="${list.id}">${list.icon} ${this.listManager.escapeHtml(list.name)}</option>
        `).join('');

        selector.value = currentListId;
    }

    setupUploadListener() {
        const fileInput = document.getElementById('attachments');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                const previewContainer = document.getElementById('attachmentPreview');
                if (!previewContainer) return;

                previewContainer.innerHTML = '';

                Array.from(files).forEach((file, index) => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const preview = document.createElement('div');
                            preview.className = 'attachment-preview-item';
                            preview.innerHTML = `
                                <img src="${e.target.result}" alt="预览 ${index + 1}">
                                <button type="button" onclick="todoApp.removePreviewImage(${index})">✕</button>
                            `;
                            previewContainer.appendChild(preview);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            });
        }
    }

    removePreviewImage(index) {
        const previewContainer = document.getElementById('attachmentPreview');
        const previewItems = previewContainer.querySelectorAll('.attachment-preview-item');
        if (previewItems[index]) {
            previewItems[index].remove();
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        let notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        notification.style.cssText = `
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;

        if (!document.getElementById('notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // 全局函数（保持与原有HTML的兼容性）
    showAddModal() {
        document.getElementById('modalTitle').textContent = '添加事项';
        document.getElementById('todoForm').reset();
        this.taskManager.loadTagOptions();
        this.taskManager.loadDependencyOptions();
        this.loadListOptions();
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    showTagManager() {
        this.renderTagList();
        document.getElementById('tagModal').style.display = 'block';
    }

    closeTagModal() {
        document.getElementById('tagModal').style.display = 'none';
    }

    generateDailySummary() {
        this.taskManager.generateDailySummary();
    }

    changeViewMode() {
        this.renderCurrentView();
    }

    renderTagList() {
        const tagList = document.getElementById('tagList');
        if (!tagList) return;

        tagList.innerHTML = this.taskManager.tags.map(tag => `
            <div class="tag-item">
                <span class="tag ${tag.color}">${this.listManager.escapeHtml(tag.name)}</span>
                <button onclick="todoApp.deleteTag(${tag.id})">删除</button>
            </div>
        `).join('');
    }

    deleteTag(id) {
        if (confirm('确定要删除这个标签吗？')) {
            this.taskManager.deleteTag(id);
            this.renderTagList();
        }
    }

    addTag(name) {
        if (name) {
            this.taskManager.addTag(name);
            this.renderTagList();
        }
    }

    showListManager() {
        const modal = document.getElementById('listModal');
        if (!modal) {
            this.createListModal();
        }
        this.renderListManager();
        document.getElementById('listModal').style.display = 'block';
    }

    closeListModal() {
        const modal = document.getElementById('listModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    createListModal() {
        const modalHTML = `
            <div id="listModal" class="modal">
                <div class="modal-content">
                    <span class="close" onclick="todoApp.closeListModal()">&times;</span>
                    <h2>📋 清单管理</h2>
                    <div class="list-manager">
                        <div class="list-input-section">
                            <input type="text" id="newListName" placeholder="输入新清单名称">
                            <button onclick="todoApp.createNewList()">创建清单</button>
                        </div>
                        <div id="listManagerList" class="list-manager-list">
                            <!-- 清单列表将在这里动态生成 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    createNewList() {
        const nameInput = document.getElementById('newListName');
        const name = nameInput.value.trim();
        if (name) {
            this.listManager.createList({ name });
            this.renderListManager();
            this.loadListOptions();
            nameInput.value = '';
        }
    }

    renderListManager() {
        const container = document.getElementById('listManagerList');
        if (!container) return;

        const lists = this.listManager.getAllLists();
        container.innerHTML = lists.map(list => `
            <div class="list-item">
                <span>${list.icon} ${this.listManager.escapeHtml(list.name)}</span>
                <div class="list-actions">
                    <button onclick="todoApp.selectList('${list.id}')">选择</button>
                    ${list.id !== 'default' ? `<button onclick="todoApp.deleteList('${list.id}')">删除</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    selectList(listId) {
        this.listManager.setCurrentList(listId);
        this.closeListModal();
        this.loadListOptions();
        this.renderCurrentView();
    }

    deleteList(listId) {
        if (confirm('确定要删除这个清单吗？该清单下的所有任务将被移动到默认清单。')) {
            const defaultListId = 'default';
            this.taskManager.items.forEach(item => {
                if (item.listId === listId) {
                    item.listId = defaultListId;
                }
            });
            this.taskManager.saveToStorage();

            this.listManager.deleteList(listId);
            this.renderListManager();
            this.loadListOptions();
        }
    }
}

// 初始化应用
const todoApp = new TodoApp();

// 全局函数（保持HTML兼容性）
function showAddModal() { todoApp.showAddModal(); }
function closeModal() { todoApp.closeModal(); }
function showTagManager() { todoApp.showTagManager(); }
function closeTagModal() { todoApp.closeTagModal(); }
function generateDailySummary() { todoApp.generateDailySummary(); }
function changeViewMode() { todoApp.changeViewMode(); }
function showListManager() { todoApp.showListManager(); }
function closeListModal() { todoApp.closeListModal(); }

// 全局变量（保持兼容性）
const todoManager = todoApp.taskManager;