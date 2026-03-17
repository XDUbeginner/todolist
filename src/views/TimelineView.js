import BaseView from './BaseView.js';

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

    filterTasks(tasks) {
        return tasks.filter(item => item.status !== 'completed');
    }
}

export default TimelineView;