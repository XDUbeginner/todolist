import BaseView from './BaseView.js';

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

export default DayView;