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
        // 不允许删除默认清单
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
}

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
        // 为已有任务添加listId字段
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

    init() {
        this.renderTodoList();
        this.checkOverdueItems();
        this.autoCarryForwardYesterdayItems();
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
            // 验证必填字段
            if (!itemData.content || itemData.content.trim().length === 0) {
                throw new Error('事项内容不能为空');
            }
            if (!itemData.ddl) {
                throw new Error('DDL不能为空');
            }

            // 验证DDL格式
            const ddlDate = new Date(itemData.ddl);
            if (isNaN(ddlDate.getTime())) {
                throw new Error('DDL格式不正确，请使用正确的日期时间格式');
            }

            // 验证DDL不是过去时间（可选，根据需求调整）
            const now = new Date();
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            if (ddlDate < todayStart) {
                console.warn('警告：DDL设置为过去时间');
            }

            // 验证循环依赖
            const dependencies = itemData.dependencies || [];
            if (this.detectCircularDependency(this.currentId, dependencies)) {
                throw new Error('检测到循环依赖，无法添加此事项');
            }

            // 获取当前清单ID
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
                importance: itemData.importance || false, // true=重要, false=不重要
                urgency: itemData.urgency || false, // true=紧急, false=不紧急
                repeatRule: itemData.repeatRule || null,
                attachments: itemData.attachments || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                completedAt: null
            };

            this.items.push(newItem);
            this.saveToStorage();
            this.processRepeatRules(newItem);
            this.renderTodoList();
            this.showNotification('事项添加成功！', 'success');
            return newItem;
        } catch (error) {
            this.showNotification(`添加事项失败：${error.message}`, 'error');
            console.error('添加事项错误:', error);
            throw error;
        }
    }

    processRepeatRules(item) {
        if (!item.repeatRule || !item.ddl) return;

        const repeatConfig = this.parseRepeatRule(item.repeatRule);
        if (!repeatConfig) return;

        // 根据重复规则生成新任务
        this.generateRepeatTasks(item, repeatConfig);
    }

    parseRepeatRule(rule) {
        // 简单的重复规则解析
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

        // 生成未来12个月的任务
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

            // 如果新日期在未来，创建任务
            if (newDate > now) {
                const newTask = {
                    ...originalItem,
                    id: this.currentId++,
                    content: `${originalItem.content} (${this.formatRepeatDate(newDate)})`,
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

    formatRepeatDate(date) {
        return date.toLocaleDateString('zh-CN');
    }

    getTasksByList(listId) {
        return this.items.filter(item => item.listId === listId);
    }

    updateItem(id, updates) {
        try {
            const item = this.items.find(item => item.id === id);
            if (!item) {
                throw new Error(`找不到ID为 ${id} 的事项`);
            }

            // 验证更新数据
            if (updates.content !== undefined && (!updates.content || updates.content.trim().length === 0)) {
                throw new Error('事项内容不能为空');
            }
            if (updates.ddl !== undefined) {
                const ddlDate = new Date(updates.ddl);
                if (isNaN(ddlDate.getTime())) {
                    throw new Error('DDL格式不正确');
                }
            }

            // 处理前置条件状态
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
            this.renderTodoList();
            this.updatePrerequisiteStates(); // Update prerequisite states after changes
            this.showNotification('事项更新成功！', 'success');
        } catch (error) {
            this.showNotification(`更新事项失败：${error.message}`, 'error');
            console.error('更新事项错误:', error);
            throw error;
        }
    }

    updateItem(id, updates) {
        try {
            const item = this.items.find(item => item.id === id);
            if (!item) {
                throw new Error(`找不到ID为 ${id} 的事项`);
            }

            // 验证更新数据
            if (updates.content !== undefined && (!updates.content || updates.content.trim().length === 0)) {
                throw new Error('事项内容不能为空');
            }
            if (updates.ddl !== undefined) {
                const ddlDate = new Date(updates.ddl);
                if (isNaN(ddlDate.getTime())) {
                    throw new Error('DDL格式不正确');
                }
            }

            // 处理前置条件状态
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
            this.renderTodoList();
            this.updatePrerequisiteStates(); // Update prerequisite states after changes
            this.showNotification('事项更新成功！', 'success');
        } catch (error) {
            this.showNotification(`更新事项失败：${error.message}`, 'error');
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

            const item = this.items[itemIndex];
            const confirmMessage = `确定要删除事项 "${item.content}" 吗？`;

            if (confirm(confirmMessage)) {
                this.items = this.items.filter(item => item.id !== id);
                this.saveToStorage();
                this.renderTodoList();
                this.showNotification('事项已删除', 'success');
            }
        } catch (error) {
            this.showNotification(`删除事项失败：${error.message}`, 'error');
            console.error('删除事项错误:', error);
        }
    }

    toggleComplete(id) {
        try {
            const item = this.items.find(item => item.id === id);
            if (!item) {
                throw new Error(`找不到ID为 ${id} 的事项`);
            }

            // 检查前置条件
            if (item.prerequisites && item.prerequisites.length > 0 && item.status !== 'completed') {
                const canComplete = item.prerequisites.every(prereq => prereq.completed);
                if (!canComplete) {
                    this.showNotification('请完成所有前置条件后再完成此事项！', 'warning');
                    return;
                }
            }

            const newStatus = item.status === 'completed' ? 'pending' : 'completed';
            this.updateItem(id, { status: newStatus });
        } catch (error) {
            this.showNotification(`切换完成状态失败：${error.message}`, 'error');
            console.error('切换完成状态错误:', error);
        }
    }

    cycleStatus(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            // 如果有未满足的前置条件，不能直接完成
            const prerequisites = item.prerequisites || [];
            if (prerequisites.length > 0 && item.status !== 'completed') {
                const canComplete = prerequisites.every(prereq => prereq.completed);
                if (!canComplete) {
                    this.showNotification('请完成所有前置条件后再完成此事项！', 'warning');
                    return;
                }
            }

            const statusFlow = ['pending', 'in-progress', 'completed'];
            const currentIndex = statusFlow.indexOf(item.status);
            const nextIndex = (currentIndex + 1) % statusFlow.length;
            this.updateItem(id, { status: statusFlow[nextIndex] });
        }
    }

    togglePrerequisite(itemId, prereqIndex) {
        const item = this.items.find(item => item.id === itemId);
        if (item && item.prerequisites[prereqIndex]) {
            item.prerequisites[prereqIndex].completed = !item.prerequisites[prereqIndex].completed;
            item.updatedAt = new Date().toISOString();
            this.saveToStorage();
            this.renderTodoList();
        }
    }

    canCompleteItem(item) {
        const prerequisites = item.prerequisites || [];
        if (prerequisites.length > 0) {
            return prerequisites.every(prereq => prereq.completed);
        }
        return true;
    }

    renderTodoList() {
        const todoList = document.getElementById('todoList');
        const viewMode = document.getElementById('viewMode').value;

        // 四象限视图特殊处理
        if (viewMode === 'quadrant') {
            this.renderQuadrantView();
            return;
        }

        let filteredItems = this.items;

        // 根据视图模式过滤
        if (viewMode === 'day') {
            const today = new Date().toDateString();
            filteredItems = this.items.filter(item => {
                const itemDate = new Date(item.ddl).toDateString();
                return itemDate === today ||
                       (new Date(item.ddl) < new Date() && item.status !== 'completed');
            });
        } else if (viewMode === 'week') {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);

            filteredItems = this.items.filter(item => {
                const itemDate = new Date(item.ddl);
                return itemDate >= weekStart && itemDate < weekEnd ||
                       (itemDate < today && item.status !== 'completed');
            });
        }

        // 按DDL排序
        filteredItems.sort((a, b) => new Date(a.ddl) - new Date(b.ddl));

        todoList.innerHTML = filteredItems.map(item => this.renderTodoItem(item)).join('');
    }

    updateFilterOptions() {
        // 更新责任人筛选选项
        const assigneeFilter = document.getElementById('assigneeFilter');
        const tagFilter = document.getElementById('tagFilter');

        // 获取所有独特的责任人
        const assignees = [...new Set(this.items.map(item => item.assignee).filter(assignee => assignee))];
        assigneeFilter.innerHTML = '<option value="">全部</option>' +
            assignees.map(assignee => `<option value="${assignee}">${this.escapeHtml(assignee)}</option>`).join('');

        // 获取所有标签
        const tags = this.tags;
        tagFilter.innerHTML = '<option value="">全部</option>' +
            tags.map(tag => `<option value="${tag.id}">${this.escapeHtml(tag.name)}</option>`).join('');
    }

    applyFilters() {
        const assigneeFilter = document.getElementById('assigneeFilter').value;
        const ddlFilter = document.getElementById('ddlFilter').value;
        const tagFilter = document.getElementById('tagFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        let filteredItems = this.items;

        // 按责任人筛选
        if (assigneeFilter) {
            filteredItems = filteredItems.filter(item => item.assignee === assigneeFilter);
        }

        // 按DDL筛选
        if (ddlFilter) {
            const today = new Date();
            const todayStr = today.toDateString();
            switch (ddlFilter) {
                case 'overdue':
                    filteredItems = filteredItems.filter(item => new Date(item.ddl) < today && item.status !== 'completed');
                    break;
                case 'today':
                    filteredItems = filteredItems.filter(item => new Date(item.ddl).toDateString() === todayStr);
                    break;
                case 'week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 7);
                    filteredItems = filteredItems.filter(item => {
                        const itemDate = new Date(item.ddl);
                        return itemDate >= weekStart && itemDate < weekEnd;
                    });
                    break;
                case 'future':
                    filteredItems = filteredItems.filter(item => new Date(item.ddl) >= today);
                    break;
            }
        }

        // 按标签筛选
        if (tagFilter) {
            filteredItems = filteredItems.filter(item => item.tags && item.tags.includes(parseInt(tagFilter)));
        }

        // 按状态筛选
        if (statusFilter) {
            if (statusFilter === 'blocked') {
                filteredItems = filteredItems.filter(item => {
                    if (item.status === 'completed') return false;
                    if (item.prerequisites && item.prerequisites.length > 0) {
                        return !item.prerequisites.every(prereq => prereq.completed);
                    }
                    return false;
                });
            } else {
                filteredItems = filteredItems.filter(item => item.status === statusFilter);
            }
        }

        // 根据视图模式进一步过滤
        const viewMode = document.getElementById('viewMode').value;
        if (viewMode === 'day') {
            const today = new Date().toDateString();
            filteredItems = filteredItems.filter(item => {
                const itemDate = new Date(item.ddl).toDateString();
                return itemDate === today ||
                       (new Date(item.ddl) < new Date() && item.status !== 'completed');
            });
        } else if (viewMode === 'week') {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);

            filteredItems = filteredItems.filter(item => {
                const itemDate = new Date(item.ddl);
                return itemDate >= weekStart && itemDate < weekEnd ||
                       (itemDate < today && item.status !== 'completed');
            });
        }

        // 按DDL排序
        filteredItems.sort((a, b) => new Date(a.ddl) - new Date(b.ddl));

        const todoList = document.getElementById('todoList');
        todoList.innerHTML = filteredItems.map(item => this.renderTodoItem(item)).join('');
    }

    renderTodoItem(item) {
        const isOverdue = new Date(item.ddl) < new Date() && item.status !== 'completed';
        const isCompleted = item.status === 'completed';
        const hasUnmetPrerequisites = item.prerequisites && item.prerequisites.length > 0 && !this.canCompleteItem(item);

        // 如果有未满足的前置条件，且事项不是已完成状态，则应用特殊样式
        const hasBlockingPrerequisites = !isCompleted && item.prerequisites && item.prerequisites.some(prereq => !prereq.completed);

        return `
            <div class="todo-item ${isOverdue ? 'overdue' : ''} ${isCompleted ? 'completed' : ''} ${hasBlockingPrerequisites ? 'blocked' : ''}" data-id="${item.id}">
                <div class="todo-item-header">
                    <div class="todo-item-title">
                        ${this.renderDependencyArrows(item)}
                        ${this.escapeHtml(item.content)}
                    </div>
                    <div class="todo-item-status status-${item.status}" onclick="todoApp.cycleStatus(${item.id})" title="点击切换状态">${this.getStatusText(item.status)}</div>
                </div>

                ${item.tags && item.tags.length > 0 ? `
                    <div class="todo-item-tags">
                        ${item.tags.map(tagId => {
                            const tag = this.tags.find(t => t.id === tagId);
                            return tag ? `<span class="tag ${tag.color}">${this.escapeHtml(tag.name)}</span>` : '';
                        }).join('')}
                    </div>
                ` : ''}

                <div class="todo-item-details">
                    <div class="todo-item-detail">
                        <strong>📅 DDL:</strong> ${this.formatDateTime(item.ddl)}
                    </div>
                    ${item.creator ? `<div class="todo-item-detail"><strong>👤 提出人:</strong> ${this.escapeHtml(item.creator)}</div>` : ''}
                    ${item.assignee ? `<div class="todo-item-detail"><strong>🎯 责任人:</strong> ${this.escapeHtml(item.assignee)}</div>` : ''}
                </div>

                ${item.dependencies && item.dependencies.length > 0 ? `
                    <div class="todo-item-dependencies">
                        <strong>🔗 依赖事项:</strong>
                        ${item.dependencies.map(depId => {
                            const depItem = this.items.find(i => i.id === depId);
                            return depItem ? `<span class="dependency-item">${this.escapeHtml(depItem.content)}</span>` : '';
                        }).join('')}
                    </div>
                ` : ''}

                ${item.prerequisites && item.prerequisites.length > 0 ? `
                    <div class="prerequisites-section">
                        <strong>⏰ 前置条件:</strong>
                        <div class="prerequisites-list">
                            ${item.prerequisites.map((prereq, index) => `
                                <div class="prerequisite-item ${prereq.completed ? 'completed' : ''}" onclick="todoApp.togglePrerequisite(${item.id}, ${index})">
                                    <input type="checkbox" ${prereq.completed ? 'checked' : ''} readonly>
                                    <span>${this.escapeHtml(prereq.text)}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${!this.canCompleteItem(item) ? '<div class="prerequisite-warning">⚠️ 请完成所有前置条件后再完成此事项</div>' : ''}
                    </div>
                ` : ''}

                ${item.progressText ? `
                    <div class="progress-description">
                        <strong>📝 进展描述:</strong> ${this.escapeHtml(item.progressText)}
                    </div>
                ` : ''}

                ${item.notes ? `
                    <div class="progress-description" style="border-left-color: #95a5a6;">
                        <strong>📋 备注:</strong> ${this.escapeHtml(item.notes)}
                    </div>
                ` : ''}

                <div class="todo-item-actions">
                    <button class="btn-edit" onclick="todoApp.editItem(${item.id})">✏️ 编辑</button>
                    <button class="btn-complete" onclick="todoApp.toggleComplete(${item.id})" ${hasBlockingPrerequisites ? 'disabled' : ''}>
                        ${isCompleted ? '⏮️ 标记未完成' : '✅ 标记完成'}
                    </button>
                    <button class="btn-delete" onclick="todoApp.deleteItem(${item.id})">🗑️ 删除</button>
                </div>
            </div>
        `;
    }

    renderDependencyArrows(item) {
        if (!item.dependencies || item.dependencies.length === 0) return '';

        // 检查是否处于渲染过程中（DOM可能尚未完全就绪）
        const todoList = document.getElementById('todoList');
        if (!todoList) return '';

        const arrows = item.dependencies.map(depId => {
            const depItem = this.items.find(i => i.id === depId);
            if (!depItem) return '';

            try {
                const depElement = document.querySelector(`[data-id="${depItem.id}"]`);
                if (!depElement || !depElement.parentNode) return '';

                const currentElement = document.querySelector(`[data-id="${item.id}"]`);
                if (!currentElement || !currentElement.parentNode) return '';

                const depIndex = Array.from(depElement.parentNode.children).indexOf(depElement);
                const currentIndex = Array.from(currentElement.parentNode.children).indexOf(currentElement);

                // 只有在两者都在同一列表中时才显示箭头
                if (depElement.parentNode === currentElement.parentNode) {
                    if (currentIndex > depIndex) {
                        return `<span class="dependency-arrow">⬇️</span>`;
                    } else if (currentIndex < depIndex) {
                        return `<span class="dependency-arrow">⬆️</span>`;
                    }
                }
                return '';
            } catch (error) {
                console.warn('渲染依赖箭头时出错:', error);
                return '';
            }
        }).filter(arrow => arrow !== '').join('');

        return arrows ? `<span class="dependency-arrows">${arrows}</span>` : '';
    }

    editItem(id) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;

        document.getElementById('modalTitle').textContent = '编辑事项';
        document.getElementById('itemId').value = item.id;
        document.getElementById('content').value = item.content;
        document.getElementById('ddl').value = this.formatDateTimeForInput(item.ddl);
        document.getElementById('creator').value = item.creator;
        document.getElementById('assignee').value = item.assignee;
        document.getElementById('notes').value = item.notes;
        document.getElementById('progressText').value = item.progressText || '';
        document.getElementById('status').value = item.status;

        // 加载标签和依赖选项
        this.loadTagOptions();
        this.loadDependencyOptions(id);

        // 设置已选中的标签和依赖
        setTimeout(() => {
            // 设置选中的标签
            item.tags && item.tags.forEach(tagId => {
                const checkbox = document.querySelector(`#tag-${tagId}`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.closest('.tag-checkbox-item').classList.add('selected');
                }
            });

            // 设置选中的依赖
            const dependenciesSelect = document.getElementById('dependencies');
            Array.from(dependenciesSelect.options).forEach(option => {
                if (item.dependencies.includes(parseInt(option.value))) {
                    option.selected = true;
                }
            });

            // 设置重要性和紧急性
            document.getElementById('importance').value = item.importance ? 'true' : 'false';
            document.getElementById('urgency').value = item.urgency ? 'true' : 'false';

            // 渲染前置条件
            renderPrerequisitesList(item.prerequisites);

            // 加载清单选项
            loadListOptions(item.listId);
        }, 100);

        document.getElementById('modal').style.display = 'block';
    }

    loadTagOptions() {
        const tagCheckboxes = document.getElementById('tagCheckboxes');
        if (!tagCheckboxes) return;

        tagCheckboxes.innerHTML = this.tags.map(tag =>
            `<div class="tag-checkbox-item" data-tag-id="${tag.id}">
                <input type="checkbox" id="tag-${tag.id}" value="${tag.id}">
                <label for="tag-${tag.id}" class="tag ${tag.color}">${this.escapeHtml(tag.name)}</label>
            </div>`
        ).join('');

        // 添加复选框点击事件
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
                    `<option value="${item.id}">${this.escapeHtml(item.content.substring(0, 100))}</option>`
                ).join('');
        }
    }

    loadDependencyOptions(currentItemId) {
        const dependenciesSelect = document.getElementById('dependencies');
        const incompleteItems = this.items.filter(item =>
            item.id !== currentItemId &&
            item.status !== 'completed' &&
            item.content &&
            item.content.trim().length > 0
        );

        if (incompleteItems.length === 0) {
            dependenciesSelect.innerHTML = '<option value="">无依赖事项</option>';
        } else {
            dependenciesSelect.innerHTML = '<option value="">选择依赖事项</option>' +
                incompleteItems.map(item =>
                    `<option value="${item.id}">${this.escapeHtml(item.content.substring(0, 100))}</option>`
                ).join('');
        }
    }

    checkOverdueItems() {
        const overdueItems = this.items.filter(item =>
            new Date(item.ddl) < new Date() && item.status !== 'completed'
        );

        if (overdueItems.length > 0) {
            const shouldProcess = confirm(`发现 ${overdueItems.length} 个过期事项，是否要处理这些事项？`);
            if (shouldProcess) {
                this.processOverdueItems(overdueItems);
            }
        }
    }

    processOverdueItems(overdueItems) {
        overdueItems.forEach(item => {
            const action = prompt(
                `事项 "${item.content}" 已过期，请选择操作：\n` +
                `1. 删除事项\n` +
                `2. 更新DDL\n` +
                `3. 顺延到今天\n` +
                `其他键：跳过`
            );

            switch (action) {
                case '1':
                    this.deleteItem(item.id);
                    break;
                case '2':
                    const newDdl = prompt('请输入新的DDL (格式：YYYY-MM-DDTHH:MM)：');
                    if (newDdl) {
                        this.updateItem(item.id, { ddl: newDdl });
                    }
                    break;
                case '3':
                    const today = new Date();
                    today.setHours(23, 59, 0, 0);
                    this.updateItem(item.id, { ddl: today.toISOString() });
                    break;
            }
        });
    }

    autoCarryForwardYesterdayItems() {
        const today = new Date().toDateString();
        const yesterdayItems = this.items.filter(item => {
            const itemDate = new Date(item.ddl).toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return itemDate === yesterday.toDateString() && item.status !== 'completed';
        });

        if (yesterdayItems.length > 0) {
            const shouldCarry = confirm(`发现 ${yesterdayItems.length} 个昨天未完成的事项，是否自动顺延到今天？`);
            if (shouldCarry) {
                yesterdayItems.forEach(item => {
                    const today = new Date();
                    today.setHours(23, 59, 0, 0);
                    this.updateItem(item.id, { ddl: today.toISOString() });
                });
            }
        }
    }

    generateDailySummary() {
        const today = new Date().toDateString();
        const todayItems = this.items.filter(item => {
            const itemDate = new Date(item.ddl).toDateString();
            return itemDate === today;
        });

        const completedItems = todayItems.filter(item => item.status === 'completed');
        const inProgressItems = todayItems.filter(item => item.status === 'in-progress');
        const pendingItems = todayItems.filter(item => item.status === 'pending');

        // 查找今天有更新的事项（今天修改过的）
        const updatedItems = this.items.filter(item => {
            const updatedDate = new Date(item.updatedAt).toDateString();
            return updatedDate === today &&
                   item.status !== 'completed' &&
                   new Date(item.ddl).toDateString() !== today;
        });

        let summaryHTML = `
            <div class="summary-card">
                <h3>今日完成情况</h3>
                <div class="summary-item">
                    <span>完成事项数量</span>
                    <strong>${completedItems.length} / ${todayItems.length}</strong>
                </div>
                <div class="summary-item">
                    <span>完成率</span>
                    <strong>${todayItems.length > 0 ? Math.round((completedItems.length / todayItems.length) * 100) : 0}%</strong>
                </div>
            </div>
        `;

        if (completedItems.length > 0) {
            summaryHTML += `
                <div class="summary-card">
                    <h3>✅ 今日完成事项</h3>
                    ${completedItems.map(item => `<div class="summary-item">${this.escapeHtml(item.content)}</div>`).join('')}
                </div>
            `;
        }

        if (inProgressItems.length > 0 || updatedItems.length > 0) {
            summaryHTML += `
                <div class="summary-card">
                    <h3>🔄 有进展事项</h3>
                    ${inProgressItems.map(item => `<div class="summary-item">${this.escapeHtml(item.content)} (状态: 进行中)</div>`).join('')}
                    ${updatedItems.map(item => `<div class="summary-item">${this.escapeHtml(item.content)} (已更新)</div>`).join('')}
                </div>
            `;
        }

        if (pendingItems.length > 0) {
            summaryHTML += `
                <div class="summary-card">
                    <h3>⏳ 待处理事项</h3>
                    ${pendingItems.map(item => `<div class="summary-item">${this.escapeHtml(item.content)}</div>`).join('')}
                </div>
            `;
        }

        // 明日计划：今天未完成且未过期的事项
        const tomorrowItems = todayItems.filter(item =>
            item.status !== 'completed' && new Date(item.ddl) >= new Date()
        );

        if (tomorrowItems.length > 0) {
            summaryHTML += `
                <div class="summary-card">
                    <h3>📅 明日计划</h3>
                    <p>以下事项将顺延至明天：</p>
                    ${tomorrowItems.map(item => `<div class="summary-item">${this.escapeHtml(item.content)}</div>`).join('')}
                </div>
            `;
        }

        document.getElementById('dailySummary').innerHTML = summaryHTML;
        document.getElementById('summarySection').style.display = 'block';
    }

    changeViewMode() {
        this.renderTodoList();
        // 只有在非四象限视图中才更新筛选选项
        const viewMode = document.getElementById('viewMode').value;
        if (viewMode !== 'quadrant') {
            this.updateFilterOptions();
        }
    }
} // 结束TaskManager类

// 视图管理器
class ViewManager {
    constructor(taskManager, listManager) {
        this.taskManager = taskManager;
        this.listManager = listManager;
        this.views = new Map();
        this.currentView = null;
        this.initViews();
    }

    initViews() {
        // 注册所有视图
        this.views.set('day', new DayView(this.taskManager));
        this.views.set('week', new WeekView(this.taskManager));
        this.views.set('quadrant', new QuadrantView(this.taskManager));
        this.views.set('board', new BoardView(this.taskManager));
        this.views.set('timeline', new TimelineView(this.taskManager));
    }

    renderView(viewMode) {
        const view = this.views.get(viewMode);
        if (!view) {
            console.error(`视图 ${viewMode} 不存在`);
            return;
        }

        this.currentView = view;
        const container = document.getElementById('todoList');
        if (container) {
            view.render(container);
        }
    }

    getCurrentView() {
        return this.currentView;
    }

    getAvailableViews() {
        return Array.from(this.views.keys());
    }
}

// 基础视图类
class BaseView {
    constructor(taskManager) {
        this.taskManager = taskManager;
    }

    render(container) {
        throw new Error('render方法必须被实现');
    }

    filterTasks(tasks) {
        return tasks;
    }

    sortTasks(tasks) {
        return tasks;
    }
}

// 日视图
class DayView extends BaseView {
    render(container) {
        const filteredItems = this.filterTasks(this.taskManager.items);
        const sortedItems = this.sortTasks(filteredItems);

        container.innerHTML = sortedItems.map(item => this.taskManager.renderTodoItem(item)).join('');
    }

    filterTasks(tasks) {
        const today = new Date().toDateString();
        return tasks.filter(item => {
            const itemDate = new Date(item.ddl).toDateString();
            return itemDate === today ||
                   (new Date(item.ddl) < new Date() && item.status !== 'completed');
        });
    }

    sortTasks(tasks) {
        return tasks.sort((a, b) => new Date(a.ddl) - new Date(b.ddl));
    }
}

// 周视图
class WeekView extends BaseView {
    render(container) {
        const filteredItems = this.filterTasks(this.taskManager.items);
        const sortedItems = this.sortTasks(filteredItems);

        container.innerHTML = sortedItems.map(item => this.taskManager.renderTodoItem(item)).join('');
    }

    filterTasks(tasks) {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        return tasks.filter(item => {
            const itemDate = new Date(item.ddl);
            return itemDate >= weekStart && itemDate < weekEnd ||
                   (itemDate < today && item.status !== 'completed');
        });
    }

    sortTasks(tasks) {
        return tasks.sort((a, b) => new Date(a.ddl) - new Date(b.ddl));
    }
}

// 四象限视图（保持原有逻辑）
class QuadrantView extends BaseView {
    render(container) {
        // 创建四象限HTML结构
        container.innerHTML = `
            <div class="quadrant-container">
                <div class="quadrant quadrant-1">
                    <h3>🔥 重要且紧急</h3>
                    <p>立即处理</p>
                    <div class="quadrant-items" data-quadrant="1"></div>
                </div>
                <div class="quadrant quadrant-2">
                    <h3>📋 重要不紧急</h3>
                    <p>计划处理</p>
                    <div class="quadrant-items" data-quadrant="2"></div>
                </div>
                <div class="quadrant quadrant-3">
                    <h3>⚡ 紧急不重要</h3>
                    <p>委托他人</p>
                    <div class="quadrant-items" data-quadrant="3"></div>
                </div>
                <div class="quadrant quadrant-4">
                    <h3>💤 不重要不紧急</h3>
                    <p>删除/搁置</p>
                    <div class="quadrant-items" data-quadrant="4"></div>
                </div>
            </div>
        `;

        // 分类并渲染任务到对应象限
        this.taskManager.items.forEach(item => {
            const quadrant = this.taskManager.calculateQuadrant(item);
            const quadrantElement = container.querySelector(`[data-quadrant="${quadrant}"]`);
            if (quadrantElement) {
                quadrantElement.innerHTML += this.taskManager.renderTodoItem(item);
            }
        });
    }
}

// 看板视图
class BoardView extends BaseView {
    render(container) {
        const statuses = ['pending', 'in-progress', 'completed'];
        const statusLabels = ['⏳ 待处理', '🔄 进行中', '✅ 已完成'];

        container.innerHTML = `
            <div class="board-container">
                ${statuses.map((status, index) => `
                    <div class="board-column" data-status="${status}">
                        <h3>${statusLabels[index]}</h3>
                        <div class="board-column-items"></div>
                    </div>
                `).join('')}
            </div>
        `;

        // 将任务分配到对应状态列
        statuses.forEach(status => {
            const column = container.querySelector(`[data-status="${status}"] .board-column-items`);
            if (column) {
                const tasks = this.taskManager.items.filter(item => item.status === status);
                column.innerHTML = tasks.map(item => this.taskManager.renderTodoItem(item)).join('');
            }
        });
    }
}

// 时间线视图
class TimelineView extends BaseView {
    render(container) {
        const tasks = this.filterTasks(this.taskManager.items).sort((a, b) => new Date(a.ddl) - new Date(b.ddl));

        container.innerHTML = `
            <div class="timeline-container">
                <h3>时间线视图</h3>
                <div class="timeline">
                    ${tasks.map((item, index) => `
                        <div class="timeline-item" style="margin-left: ${index * 20}px;">
                            <div class="timeline-date">${this.formatDateTime(item.ddl)}</div>
                            <div class="timeline-content">${this.escapeHtml(item.content)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('zh-CN');
    }

    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 增强同步管理器（支持跨设备同步）
class SyncManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.syncKey = 'todo_sync_data';
        this.deviceId = this.getDeviceId();
        this.syncServer = 'https://sync.todolist.example.com'; // 同步服务器地址
        this.init();
    }

    init() {
        // 初始化跨标签页同步
        this.initCrossTabSync();

        // 定期同步（每30秒）
        setInterval(() => this.sync(), 30000);

        // 监听网络状态
        window.addEventListener('online', () => {
            this.taskManager.showNotification('网络已连接，开始同步...', 'info');
            this.sync();
        });
        window.addEventListener('offline', () => this.handleOffline());

        // 页面可见性变化时同步
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.sync();
        });
    }

    getDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    getApiUrl() {
        // Vercel部署时使用相对路径
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3000/api/sync';
        }
        return '/api/sync';
    }

    initCrossTabSync() {
        // 监听同一设备的其他标签页
        window.addEventListener('storage', (e) => {
            if (e.key === 'todoItems' || e.key === 'todoLists' || e.key === 'todoTags') {
                console.log('检测到数据变化，重新加载...');
                this.taskManager.loadFromStorage();
                this.taskManager.renderTodoList();
                this.taskManager.showNotification('数据已从其他标签页同步', 'info');
            }
        });
    }

    async sync() {
        if (!navigator.onLine) return;

        try {
            const currentData = this.getSyncData();
            const lastSyncData = localStorage.getItem(this.syncKey);

            // 检查数据是否有变化
            if (lastSyncData) {
                const parsed = JSON.parse(lastSyncData);
                if (this.hasDataChanged(currentData, parsed)) {
                    // 上传变化到云端
                    await this.syncToCloud(currentData);
                }
            }

            // 从云端下载最新数据
            await this.syncFromCloud();

            // 更新本地同步数据
            localStorage.setItem(this.syncKey, JSON.stringify(currentData));
            localStorage.setItem('lastSyncTime', Date.now());

        } catch (error) {
            console.error('同步失败:', error);
        }
    }

    getSyncData() {
        return {
            deviceId: this.deviceId,
            lists: localStorage.getItem('todoLists'),
            items: localStorage.getItem('todoItems'),
            tags: localStorage.getItem('todoTags'),
            lastModified: localStorage.getItem('lastModified') || Date.now()
        };
    }

    hasDataChanged(current, last) {
        return JSON.stringify(current) !== JSON.stringify(last);
    }

    async syncToCloud(data) {
        // 同步到Vercel Serverless Functions
        try {
            const response = await fetch(this.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    deviceId: this.deviceId,
                    data: data,
                    timestamp: Date.now(),
                    type: 'sync'
                })
            });

            if (response.ok) {
                console.log('数据上传到Vercel成功');
                return true;
            } else {
                throw new Error('Vercel同步失败');
            }
        } catch (error) {
            console.error('上传到Vercel失败:', error);
            // 失败时存储到本地，下次重试
            this.storeFailedSync(data);
            return false;
        }
    }

    async syncFromCloud() {
        // 从Vercel Serverless Functions下载数据
        try {
            const response = await fetch(`${this.getApiUrl()}?deviceId=${this.deviceId}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                const remoteData = result?.data || result; // 处理不同响应格式

                if (remoteData && typeof remoteData === 'object') {
                    // 合并数据
                    const mergedData = this.mergeData(this.getSyncData(), remoteData);

                    // 应用合并后的数据
                    this.applySyncData(mergedData);

                    console.log('数据从Vercel下载成功');
                }
            }
        } catch (error) {
            console.error('从Vercel下载失败:', error);
        }
    }

    mergeData(local, remote) {
        if (!remote) return local;

        // 基于时间戳的冲突解决
        const localTime = parseInt(local.lastModified) || 0;
        const remoteTime = parseInt(remote.lastModified) || 0;

        if (localTime >= remoteTime) {
            // 本地数据更新，使用本地数据
            return local;
        } else {
            // 云端数据更新，使用云端数据
            return remote;
        }
    }

    applySyncData(data) {
        if (data.lists) localStorage.setItem('todoLists', data.lists);
        if (data.items) localStorage.setItem('todoItems', data.items);
        if (data.tags) localStorage.setItem('todoTags', data.tags);
        if (data.lastModified) localStorage.setItem('lastModified', data.lastModified);

        // 重新加载数据
        this.taskManager.loadFromStorage();
        this.taskManager.renderTodoList();
    }

    getAuthToken() {
        // 获取认证token（实际项目中应该实现真实的认证）
        return localStorage.getItem('authToken') || 'anonymous';
    }

    storeFailedSync(data) {
        // 存储失败的同步数据
        const failedSyncs = JSON.parse(localStorage.getItem('failedSyncs') || '[]');
        failedSyncs.push({
            data: data,
            timestamp: Date.now()
        });
        localStorage.setItem('failedSyncs', JSON.stringify(failedSyncs));
    }

    async retryFailedSyncs() {
        // 重试失败的同步
        const failedSyncs = JSON.parse(localStorage.getItem('failedSyncs') || '[]');
        if (failedSyncs.length > 0) {
            for (const syncData of failedSyncs) {
                try {
                    await this.syncToCloud(syncData.data);
                } catch (error) {
                    console.error('重试同步失败:', error);
                }
            }
            localStorage.removeItem('failedSyncs');
        }
    }

    handleOffline() {
        this.taskManager.showNotification('网络已断开，数据将在重新连接后同步', 'warning');
    }

    // 初始化设备（新设备首次使用）
    async initializeDevice() {
        try {
            // 从云端恢复数据
            await this.syncFromCloud();
            this.taskManager.showNotification('设备初始化完成，数据已从云端恢复', 'success');
        } catch (error) {
            console.error('设备初始化失败:', error);
            this.taskManager.showNotification('设备初始化失败，将使用本地数据', 'warning');
        }
    }
}

// 主应用管理器（整合所有模块）
class TodoApp {
    constructor() {
        this.listManager = new ListManager();
        this.taskManager = new TaskManager(this.listManager);
        this.viewManager = new ViewManager(this.taskManager, this.listManager);
        this.searchManager = new SearchManager(this.taskManager);
        this.attachmentManager = new AttachmentManager(this.taskManager);
        this.syncManager = new SyncManager(this.taskManager); // 添加同步管理器
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCurrentView();
    }

    setupEventListeners() {
        // 视图切换监听
        document.getElementById('viewMode').addEventListener('change', (e) => {
            this.renderCurrentView();
        });

        // 清单切换监听
        document.getElementById('listSelector').addEventListener('change', (e) => {
            this.listManager.setCurrentList(e.target.value);
            this.renderCurrentView();
        });
    }

    renderCurrentView() {
        const viewMode = document.getElementById('viewMode').value;
        this.viewManager.renderView(viewMode);
    }

    showNotification(message, type = 'info', duration = 3000) {
        // 创建通知容器（如果不存在）
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

        // 创建通知元素
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

        // 添加动画样式
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

        // 自动移除通知
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

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
                // 触发搜索结果渲染
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

// 附件管理器
class AttachmentManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.supportedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    }

    addAttachment(taskId, file) {
        if (!this.supportedTypes.includes(file.type)) {
            throw new Error('不支持的文件类型');
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const task = this.taskManager.items.find(item => item.id === taskId);
            if (task) {
                if (!task.attachments) task.attachments = [];
                task.attachments.push(e.target.result);
                this.taskManager.saveToStorage();
                this.renderTodoList();
            }
        };
        reader.readAsDataURL(file);
    }

    removeAttachment(taskId, attachmentIndex) {
        const task = this.taskManager.items.find(item => item.id === taskId);
        if (task && task.attachments && task.attachments[attachmentIndex]) {
            task.attachments.splice(attachmentIndex, 1);
            this.taskManager.saveToStorage();
            this.renderTodoList();
        }
    }

    renderAttachments(task) {
        if (!task.attachments || task.attachments.length === 0) return '';

        return `
            <div class="attachments-section">
                <strong>📎 附件:</strong>
                <div class="attachments-list">
                    ${task.attachments.map((attachment, index) => `
                        <div class="attachment-item">
                            <img src="${attachment}" alt="附件 ${index + 1}" class="attachment-preview">
                            <button onclick="todoApp.attachmentManager.removeAttachment(${task.id}, ${index})">删除</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

    toggleSummary() {
        const summarySection = document.getElementById('summarySection');
        if (summarySection.style.display === 'none') {
            summarySection.style.display = 'block';
        } else {
            summarySection.style.display = 'none';
        }
    }

    // 标签管理方法
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
        // 删除标签后，移除事项中对应的标签引用
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

    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 通知系统
    showNotification(message, type = 'info', duration = 3000) {
        // 创建通知容器（如果不存在）
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

        // 创建通知元素
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

        // 添加动画样式
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

        // 自动移除通知
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // 辅助方法
    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDateTime(dateTimeString) {
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) {
                console.warn('无效的日期格式:', dateTimeString);
                return '无效日期';
            }
            return date.toLocaleString('zh-CN');
        } catch (error) {
            console.error('格式化日期错误:', error);
            return '日期错误';
        }
    }

    formatDateTimeForInput(dateTimeString) {
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) {
                return '';
            }
            return date.toISOString().slice(0, 16);
        } catch (error) {
            console.error('格式化输入日期错误:', error);
            return '';
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

    updatePrerequisiteStates() {
        // 更新所有事项的前置条件状态
        this.items.forEach(item => {
            if (item.prerequisites && item.prerequisites.length > 0) {
                let hasChanges = false;
                item.prerequisites.forEach(prereq => {
                    if (prereq.type === 'dependency' && prereq.itemId) {
                        const dependencyItem = this.items.find(i => i.id === prereq.itemId);
                        if (dependencyItem) {
                            const newCompletedState = dependencyItem.status === 'completed';
                            if (prereq.completed !== newCompletedState) {
                                prereq.completed = newCompletedState;
                                hasChanges = true;
                            }
                        }
                    }
                });
                if (hasChanges) {
                    item.updatedAt = new Date().toISOString();
                }
            }
        });
        this.saveToStorage();
        this.renderTodoList();
    }

    detectCircularDependency(itemId, dependencies, items = null) {
        const itemsList = items || this.items;
        const visited = new Set();

        function check(currentId, path = []) {
            if (visited.has(currentId)) return false; // 已检查过，无循环
            if (path.includes(currentId)) return true; // 发现循环

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

    /**
     * 计算任务属于哪个象限
     * @param {Object} item - 任务对象
     * @returns {number} 象限编号 (1, 2, 3, 4)
     */
    calculateQuadrant(item) {
        // 基于重要性和紧急性判断
        const isImportant = item.importance === true;
        const isUrgent = item.urgency === true;

        if (isImportant && isUrgent) return 1;      // 重要且紧急
        if (isImportant && !isUrgent) return 2;     // 重要不紧急
        if (!isImportant && isUrgent) return 3;     // 紧急不重要
        return 4;                                   // 不重要不紧急
    }

    /**
     * 渲染四象限视图
     */
    renderQuadrantView() {
        const container = document.getElementById('todoList');

        // 创建四象限HTML结构
        container.innerHTML = `
            <div class="quadrant-container">
                <div class="quadrant quadrant-1">
                    <h3>🔥 重要且紧急</h3>
                    <p>立即处理</p>
                    <div class="quadrant-items" data-quadrant="1"></div>
                </div>
                <div class="quadrant quadrant-2">
                    <h3>📋 重要不紧急</h3>
                    <p>计划处理</p>
                    <div class="quadrant-items" data-quadrant="2"></div>
                </div>
                <div class="quadrant quadrant-3">
                    <h3>⚡ 紧急不重要</h3>
                    <p>委托他人</p>
                    <div class="quadrant-items" data-quadrant="3"></div>
                </div>
                <div class="quadrant quadrant-4">
                    <h3>💤 不重要不紧急</h3>
                    <p>删除/搁置</p>
                    <div class="quadrant-items" data-quadrant="4"></div>
                </div>
            </div>
        `;

        // 分类并渲染任务到对应象限
        this.items.forEach(item => {
            const quadrant = this.calculateQuadrant(item);
            const quadrantElement = container.querySelector(`[data-quadrant="${quadrant}"]`);
            if (quadrantElement) {
                quadrantElement.innerHTML += this.renderTodoItem(item);
            }
        });
    }
}

// 清单管理函数
function showListManager() {
    const modal = document.getElementById('listModal');
    if (!modal) {
        createListModal();
    }
    renderListManager();
    document.getElementById('listModal').style.display = 'block';
}

function createListModal() {
    const modalHTML = `
        <div id="listModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeListModal()">&times;</span>
                <h2>📋 清单管理</h2>
                <div class="list-manager">
                    <div class="list-input-section">
                        <input type="text" id="newListName" placeholder="输入新清单名称">
                        <button onclick="createNewList()">创建清单</button>
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

function closeListModal() {
    const modal = document.getElementById('listModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function createNewList() {
    const nameInput = document.getElementById('newListName');
    const name = nameInput.value.trim();
    if (name) {
        todoApp.listManager.createList({ name });
        renderListManager();
        loadListOptions();
        nameInput.value = '';
    }
}

function renderListManager() {
    const container = document.getElementById('listManagerList');
    if (!container) return;

    const lists = todoApp.listManager.getAllLists();
    container.innerHTML = lists.map(list => `
        <div class="list-item">
            <span>${list.icon} ${todoApp.listManager.escapeHtml(list.name)}</span>
            <div class="list-actions">
                <button onclick="selectList('${list.id}')">选择</button>
                ${list.id !== 'default' ? `<button onclick="deleteList('${list.id}')">删除</button>` : ''}
            </div>
        </div>
    `).join('');
}

function deleteList(listId) {
    if (confirm('确定要删除这个清单吗？该清单下的所有任务将被移动到默认清单。')) {
        // 将任务移动到默认清单
        const defaultListId = 'default';
        todoApp.taskManager.items.forEach(item => {
            if (item.listId === listId) {
                item.listId = defaultListId;
            }
        });
        todoApp.taskManager.saveToStorage();

        // 删除清单
        todoApp.listManager.deleteList(listId);
        renderListManager();
        loadListOptions();
    }
}

function selectList(listId) {
    todoApp.listManager.setCurrentList(listId);
    closeListModal();
    loadListOptions();
    todoApp.renderCurrentView();
}

function loadListOptions(selectedListId = null) {
    const selector = document.getElementById('listSelector');
    if (!selector) return;

    const lists = todoApp.listManager.getAllLists();
    const currentListId = selectedListId || todoApp.listManager.getCurrentList().id;

    selector.innerHTML = lists.map(list => `
        <option value="${list.id}">${list.icon} ${todoApp.listManager.escapeHtml(list.name)}</option>
    `).join('');

    selector.value = currentListId;
}

// 全局函数
function showAddModal() {
    document.getElementById('modalTitle').textContent = '添加事项';
    document.getElementById('todoForm').reset();
    todoApp.taskManager.loadTagOptions();
    todoApp.taskManager.loadDependencyOptions();
    renderPrerequisitesList([]);
    loadListOptions();
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function showTagManager() {
    renderTagList();
    document.getElementById('tagModal').style.display = 'block';
}

function closeTagModal() {
    document.getElementById('tagModal').style.display = 'none';
}

function addNewTag() {
    const tagInput = document.getElementById('tagInput');
    const tagName = tagInput.value.trim();
    if (tagName) {
        todoApp.addTag(tagName);
        renderTagList();
        tagInput.value = '';
    }
}

function renderTagList() {
    const tagList = document.getElementById('tagList');
    tagList.innerHTML = todoApp.tags.map(tag => `
        <div class="tag-item">
            <span class="tag ${tag.color}">${todoApp.escapeHtml(tag.name)}</span>
            <button onclick="deleteTag(${tag.id})">删除</button>
        </div>
    `).join('');
}

function deleteTag(id) {
    if (confirm('确定要删除这个标签吗？')) {
        todoApp.deleteTag(id);
        renderTagList();
    }
}

function addPrerequisite() {
    const input = document.getElementById('newPrerequisite');
    const text = input.value.trim();
    if (text) {
        const itemId = document.getElementById('itemId').value;
        const currentItem = itemId ? todoApp.items.find(item => item.id === parseInt(itemId)) : null;
        const prerequisites = currentItem ? [...(currentItem.prerequisites || [])] : [];

        prerequisites.push({
            type: 'custom',
            text: text,
            completed: false
        });

        renderPrerequisitesList(prerequisites);
        input.value = '';
    }
}

function renderPrerequisitesList(prerequisites) {
    const container = document.getElementById('prerequisitesList');
    container.innerHTML = prerequisites.map((prereq, index) => `
        <div class="prerequisite-item ${prereq.completed ? 'completed' : ''}" onclick="togglePrerequisite(${index})">
            <input type="checkbox" ${prereq.completed ? 'checked' : ''} readonly>
            <span>${todoApp.escapeHtml(prereq.text)}</span>
            <button type="button" class="remove-prereq" onclick="removePrerequisite(${index}); event.stopPropagation();">✕</button>
        </div>
    `).join('');
}

function togglePrerequisite(index) {
    const itemId = document.getElementById('itemId').value;
    const currentItem = itemId ? todoApp.items.find(item => item.id === parseInt(itemId)) : null;
    if (currentItem && currentItem.prerequisites[index]) {
        currentItem.prerequisites[index].completed = !currentItem.prerequisites[index].completed;
        renderPrerequisitesList(currentItem.prerequisites);
    }
}

function removePrerequisite(index) {
    const itemId = document.getElementById('itemId').value;
    const currentItem = itemId ? todoApp.items.find(item => item.id === parseInt(itemId)) : null;
    if (currentItem && currentItem.prerequisites && currentItem.prerequisites[index]) {
        currentItem.prerequisites.splice(index, 1);
        currentItem.updatedAt = new Date().toISOString();
        todoApp.saveToStorage();
        renderPrerequisitesList(currentItem.prerequisites);
    }
}

function generateDailySummary() {
    todoApp.generateDailySummary();
}

function changeViewMode() {
    todoApp.changeViewMode();
}

// 图片上传处理
document.getElementById('attachments')?.addEventListener('change', function(e) {
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
                    <button type="button" onclick="removePreviewImage(${index})">✕</button>
                `;
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        }
    });
});

function removePreviewImage(index) {
    const previewContainer = document.getElementById('attachmentPreview');
    const previewItems = previewContainer.querySelectorAll('.attachment-preview-item');
    if (previewItems[index]) {
        previewItems[index].remove();
    }
}

// 表单提交处理
document.getElementById('todoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    try {
        const itemId = document.getElementById('itemId').value;
        const currentItem = itemId ? todoApp.items.find(item => item.id === parseInt(itemId)) : null;

        // 获取选中的标签
        const selectedTags = [];
        document.querySelectorAll('#tagCheckboxes input[type="checkbox"]:checked').forEach(checkbox => {
            selectedTags.push(parseInt(checkbox.value));
        });

        // 获取选中的清单
        const selectedList = document.getElementById('listSelector').value;

        // 获取预览的图片
        const previewContainer = document.getElementById('attachmentPreview');
        const previewImages = previewContainer ? previewContainer.querySelectorAll('img') : [];
        const attachments = Array.from(previewImages).map(img => img.src);

        const formData = {
            content: document.getElementById('content').value,
            ddl: document.getElementById('ddl').value,
            listId: selectedList,
            tags: selectedTags,
            creator: document.getElementById('creator').value,
            assignee: document.getElementById('assignee').value,
            dependencies: Array.from(document.getElementById('dependencies').selectedOptions).map(option => parseInt(option.value)),
            notes: document.getElementById('notes').value,
            progressText: document.getElementById('progressText').value,
            prerequisites: currentItem && currentItem.prerequisites ? currentItem.prerequisites : [],
            status: document.getElementById('status').value,
            importance: document.getElementById('importance').value === 'true',
            urgency: document.getElementById('urgency').value === 'true',
            repeatRule: document.getElementById('repeatRule').value || null,
            attachments: attachments
        };

        if (itemId) {
            todoApp.updateItem(parseInt(itemId), formData);
        } else {
            todoApp.addItem(formData);
        }

        closeModal();
    } catch (error) {
        console.error('表单提交错误:', error);
        todoApp.showNotification(`操作失败：${error.message}`, 'error');
    }
});

function clearFilters() {
    document.getElementById('assigneeFilter').value = '';
    document.getElementById('ddlFilter').value = '';
    document.getElementById('tagFilter').value = '';
    document.getElementById('statusFilter').value = '';
    todoApp.applyFilters();
}

// 搜索功能集成
document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    const results = todoApp.searchManager.search(query);

    // 获取当前视图并渲染搜索结果
    const currentView = todoApp.viewManager.getCurrentView();
    const container = document.getElementById('todoList');

    if (currentView && container) {
        container.innerHTML = results.map(item => todoApp.taskManager.renderTodoItem(item)).join('');
    }
});

// 新标签输入处理
document.getElementById('newTag').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const tagName = this.value.trim();
        if (tagName) {
            const newTag = todoApp.addTag(tagName);
            todoApp.loadTagOptions();
            this.value = '';

            // 选中新添加的标签
            setTimeout(() => {
                const checkbox = document.querySelector(`#tag-${newTag.id}`);
                if (checkbox) {
                    checkbox.checked = true;
                    checkbox.closest('.tag-checkbox-item').classList.add('selected');
                }
            }, 50);
        }
    }
});

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    const tagModal = document.getElementById('tagModal');
    if (event.target === modal) {
        closeModal();
    }
    if (event.target === tagModal) {
        closeTagModal();
    }
}

// 初始化应用
const todoManager = new TodoManager();