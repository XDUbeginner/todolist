import { escapeHtml } from '../utils/escapeHtml.js';
import { formatDate } from '../utils/formatDate.js';

// 任务管理器
class TaskManager {
    constructor(listManager) {
        this.listManager = listManager;
        this.items = this.loadFromStorage();
        this.tags = this.loadTagsFromStorage();
        this.currentId = this.items.length > 0 ? Math.max(...this.items.map(item => item.id)) + 1 : 1;
        this.init();
    }

    init() {
        this.migrateExistingData();
    }

    migrateExistingData() {
        if (this.items.length > 0) {
            let hasChanges = false;
            const defaultListId = this.listManager.getCurrentList().id;

            this.items.forEach(item => {
                if (!item.listId) {
                    item.listId = defaultListId;
                    hasChanges = true;
                }
                if (item.importance === undefined) {
                    item.importance = false;
                    hasChanges = true;
                }
                if (item.urgency === undefined) {
                    item.urgency = false;
                    hasChanges = true;
                }
                if (!item.repeatRule) {
                    item.repeatRule = null;
                    hasChanges = true;
                }
                if (!item.attachments) {
                    item.attachments = [];
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                this.saveToStorage();
            }
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('todoItems');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('数据加载失败，重置为空:', e);
            return [];
        }
    }

    saveToStorage() {
        localStorage.setItem('todoItems', JSON.stringify(this.items));
    }

    loadTagsFromStorage() {
        try {
            const stored = localStorage.getItem('todoTags');
            return stored ? JSON.parse(stored) : [
                { id: 1, name: '高优先级', color: 'high-priority' },
                { id: 2, name: '中优先级', color: 'medium-priority' },
                { id: 3, name: '低优先级', color: 'low-priority' },
                { id: 4, name: '紧急', color: 'urgent' },
                { id: 5, name: '版本1.0', color: 'version' },
                { id: 6, name: '版本2.0', color: 'version' },
                { id: 7, name: '工作', color: 'work' },
                { id: 8, name: '个人', color: 'personal' }
            ];
        } catch (e) {
            console.error('标签加载失败，重置为默认:', e);
            return [
                { id: 1, name: '高优先级', color: 'high-priority' },
                { id: 2, name: '中优先级', color: 'medium-priority' },
                { id: 3, name: '低优先级', color: 'low-priority' },
                { id: 4, name: '紧急', color: 'urgent' },
                { id: 5, name: '版本1.0', color: 'version' },
                { id: 6, name: '版本2.0', color: 'version' },
                { id: 7, name: '工作', color: 'work' },
                { id: 8, name: '个人', color: 'personal' }
            ];
        }
    }

    saveTagsToStorage() {
        localStorage.setItem('todoTags', JSON.stringify(this.tags));
    }

    addItem(itemData) {
        try {
            if (!itemData.content || itemData.content.trim().length === 0) {
                throw new Error('事项内容不能为空');
            }
            if (!itemData.ddl) {
                throw new Error('DDL不能为空');
            }

            const ddlDate = new Date(itemData.ddl);
            if (isNaN(ddlDate.getTime())) {
                throw new Error('DDL格式不正确，请使用正确的日期时间格式');
            }

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            if (ddlDate < todayStart) {
                console.warn('警告：DDL设置为过去时间');
            }

            const dependencies = itemData.dependencies || [];
            if (this.detectCircularDependency(this.currentId, dependencies)) {
                throw new Error('检测到循环依赖，无法添加此事项');
            }

            const listId = itemData.listId || this.listManager.getCurrentList().id;

            const prerequisites = itemData.prerequisites || [];
            prerequisites.forEach(prereq => {
                if (prereq.type === 'dependency' && prereq.itemId) {
                    prereq.completed = this.items.find(item => item.id === prereq.itemId)?.status === 'completed';
                }
            });

            const newItem = {
                id: this.currentId++,
                content: itemData.content.trim(),
                ddl: itemData.ddl,
                listId: listId,
                tags: itemData.tags || [],
                creator: itemData.creator || '',
                assignee: itemData.assignee || '',
                dependencies: itemData.dependencies || [],
                notes: itemData.notes || '',
                progressText: itemData.progressText || '',
                prerequisites: prerequisites,
                status: itemData.status || 'pending',
                importance: itemData.importance || false,
                urgency: itemData.urgency || false,
                repeatRule: itemData.repeatRule || null,
                attachments: itemData.attachments || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                completedAt: null
            };

            this.items.push(newItem);
            this.saveToStorage();
            this.processRepeatRules(newItem);
            return newItem;
        } catch (error) {
            console.error('添加事项错误:', error);
            throw error;
        }
    }

    updateItem(id, updates) {
        try {
            const item = this.items.find(item => item.id === id);
            if (!item) {
                throw new Error(`找不到ID为 ${id} 的事项`);
            }

            if (updates.content !== undefined && (!updates.content || updates.content.trim().length === 0)) {
                throw new Error('事项内容不能为空');
            }
            if (updates.ddl !== undefined) {
                const ddlDate = new Date(updates.ddl);
                if (isNaN(ddlDate.getTime())) {
                    throw new Error('DDL格式不正确');
                }
            }

            if (updates.prerequisites) {
                updates.prerequisites.forEach(prereq => {
                    if (prereq.type === 'dependency' && prereq.itemId) {
                        prereq.completed = this.items.find(item => item.id === prereq.itemId)?.status === 'completed';
                    }
                });
            }

            Object.assign(item, updates);
            item.updatedAt = new Date().toISOString();
            if (updates.status === 'completed') {
                item.completedAt = new Date().toISOString();
            }
            this.saveToStorage();
            return item;
        } catch (error) {
            console.error('更新事项错误:', error);
            throw error;
        }
    }

    deleteItem(id) {
        try {
            const itemIndex = this.items.findIndex(item => item.id === id);
            if (itemIndex === -1) {
                throw new Error(`找不到ID为 ${id} 的事项`);
            }

            this.items = this.items.filter(item => item.id !== id);
            this.saveToStorage();
        } catch (error) {
            console.error('删除事项错误:', error);
        }
    }

    getTasksByList(listId) {
        return this.items.filter(item => item.listId === listId);
    }

    loadTagOptions() {
        const tagCheckboxes = document.getElementById('tagCheckboxes');
        if (!tagCheckboxes) return;

        tagCheckboxes.innerHTML = this.tags.map(tag =>
            `<div class="tag-checkbox-item" data-tag-id="${tag.id}">
                <input type="checkbox" id="tag-${tag.id}" value="${tag.id}">
                <label for="tag-${tag.id}" class="tag ${tag.color}">${escapeHtml(tag.name)}</label>
            </div>`
        ).join('');

        document.querySelectorAll('.tag-checkbox-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    this.classList.toggle('selected', checkbox.checked);
                }
            });
        });
    }

    loadDependencyOptions(currentItemId = null) {
        const dependenciesSelect = document.getElementById('dependencies');
        if (!dependenciesSelect) return;

        const incompleteItems = this.items.filter(item =>
            item.id !== (currentItemId ? parseInt(currentItemId) : null) &&
            item.status !== 'completed' &&
            item.content &&
            item.content.trim().length > 0
        );

        if (incompleteItems.length === 0) {
            dependenciesSelect.innerHTML = '<option value="">无依赖事项</option>';
        } else {
            dependenciesSelect.innerHTML = '<option value="">选择依赖事项</option>' +
                incompleteItems.map(item =>
                    `<option value="${item.id}">${escapeHtml(item.content.substring(0, 100))}</option>`
                ).join('');
        }
    }

    calculateQuadrant(item) {
        const isImportant = item.importance === true;
        const isUrgent = item.urgency === true;

        if (isImportant && isUrgent) return 1;
        if (isImportant && !isUrgent) return 2;
        if (!isImportant && isUrgent) return 3;
        return 4;
    }

    detectCircularDependency(itemId, dependencies, items = null) {
        const itemsList = items || this.items;
        const visited = new Set();

        function check(currentId, path = []) {
            if (visited.has(currentId)) return false;
            if (path.includes(currentId)) return true;

            visited.add(currentId);
            const currentItem = itemsList.find(i => i.id === currentId);

            if (currentItem?.dependencies?.length > 0) {
                for (const depId of currentItem.dependencies) {
                    if (check(depId, [...path, currentId])) {
                        return true;
                    }
                }
            }

            return false;
        }

        return dependencies.some(depId => check(depId, [itemId]));
    }

    processRepeatRules(item) {
        if (!item.repeatRule || !item.ddl) return;

        const repeatConfig = this.parseRepeatRule(item.repeatRule);
        if (!repeatConfig) return;

        this.generateRepeatTasks(item, repeatConfig);
    }

    parseRepeatRule(rule) {
        const parts = rule.split('|');
        if (parts.length !== 2) return null;

        const type = parts[0];
        const interval = parseInt(parts[1]);

        return { type, interval };
    }

    generateRepeatTasks(originalItem, repeatConfig) {
        const tasks = [];
        const originalDate = new Date(originalItem.ddl);
        const now = new Date();

        for (let i = 1; i <= 12; i++) {
            let newDate = new Date(originalDate);

            switch (repeatConfig.type) {
                case 'daily':
                    newDate.setDate(originalDate.getDate() + (i * repeatConfig.interval));
                    break;
                case 'weekly':
                    newDate.setDate(originalDate.getDate() + (i * repeatConfig.interval * 7));
                    break;
                case 'monthly':
                    newDate.setMonth(originalDate.getMonth() + (i * repeatConfig.interval));
                    break;
                case 'yearly':
                    newDate.setFullYear(originalDate.getFullYear() + (i * repeatConfig.interval));
                    break;
                default:
                    continue;
            }

            if (newDate > now) {
                const newTask = {
                    ...originalItem,
                    id: this.currentId++,
                    content: `${originalItem.content} (${formatDate(newDate)})`,
                    ddl: newDate.toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'pending',
                    completedAt: null
                };
                tasks.push(newTask);
            }
        }

        if (tasks.length > 0) {
            this.items.push(...tasks);
            this.saveToStorage();
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': '待处理',
            'in-progress': '进行中',
            'completed': '已完成'
        };
        return statusMap[status] || status;
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

    addTag(name, color = '') {
        const newTag = {
            id: this.tags.length > 0 ? Math.max(...this.tags.map(tag => tag.id)) + 1 : 1,
            name: name,
            color: color || this.generateTagColor()
        };
        this.tags.push(newTag);
        this.saveTagsToStorage();
        return newTag;
    }

    deleteTag(id) {
        this.tags = this.tags.filter(tag => tag.id !== id);
        this.items.forEach(item => {
            if (item.tags) {
                item.tags = item.tags.filter(tagId => tagId !== id);
            }
        });
        this.saveTagsToStorage();
        this.saveToStorage();
    }

    generateTagColor() {
        const colors = ['high-priority', 'medium-priority', 'low-priority', 'urgent', 'version', 'work', 'personal'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

export default TaskManager;