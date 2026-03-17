import BaseView from './BaseView.js';

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

export default WeekView;