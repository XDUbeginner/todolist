import { DayView } from '../views/DayView.js';
import { WeekView } from '../views/WeekView.js';
import { QuadrantView } from '../views/QuadrantView.js';
import { BoardView } from '../views/BoardView.js';
import { TimelineView } from '../views/TimelineView.js';

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

export default ViewManager;