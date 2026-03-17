import BaseView from './BaseView.js';

// 四象限视图
class QuadrantView extends BaseView {
    render(container) {
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

        this.taskManager.items.forEach(item => {
            const quadrant = this.taskManager.calculateQuadrant(item);
            const quadrantElement = container.querySelector(`[data-quadrant="${quadrant}"]`);
            if (quadrantElement) {
                quadrantElement.innerHTML += this.taskManager.renderTodoItem(item);
            }
        });
    }
}

export default QuadrantView;