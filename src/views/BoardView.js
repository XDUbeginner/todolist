import BaseView from './BaseView.js';

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

        statuses.forEach(status => {
            const column = container.querySelector(`[data-status="${status}"] .board-column-items`);
            if (column) {
                const tasks = this.taskManager.items.filter(item => item.status === status);
                column.innerHTML = tasks.map(item => this.taskManager.renderTodoItem(item)).join('');
            }
        });
    }
}

export default BoardView;