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

export default BaseView;