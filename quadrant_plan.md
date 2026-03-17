# 四象限功能实现计划

## 🎯 需求分析
基于艾森豪威尔矩阵，将任务按「重要性 × 紧急性」分为四格：
- **第一象限**：重要且紧急 → 立即做
- **第二象限**：重要不紧急 → 计划做
- **第三象限**：紧急不重要 → 委托他人
- **第四象限**：不重要不紧急 → 删除/搁置

## 🔍 现有代码分析
- **视图系统**：已支持day/week两种视图模式
- **数据模型**：Item包含status、ddl、tags、priority等信息
- **标签系统**：支持高/中/低优先级标签
- **渲染方式**：基于过滤和排序的列表渲染

## 📐 技术方案设计

### 1. 数据模型扩展
在现有Item模型基础上增加两个核心属性：
```javascript
// 在newItem对象中添加
importance: itemData.importance || false,  // true=重要, false=不重要
urgency: itemData.urgency || false         // true=紧急, false=不紧急
```

或者基于现有标签系统自动计算：
- **重要性**：高优先级标签 → 重要
- **紧急性**：今日到期或已过期 → 紧急

### 2. 视图模式扩展
在现有viewMode基础上添加quadrant模式：

**HTML修改** (index.html:17-20):
```html
<select id="viewMode" onchange="changeViewMode()">
    <option value="day">📅 今日视图</option>
    <option value="week">📆 本周视图</option>
    <option value="quadrant">⚡ 四象限视图</option>
</select>
```

### 3. 四象限渲染实现

**CSS样式** (新增quadrant布局):
```css
.quadrant-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 20px;
    height: calc(100vh - 200px);
}

.quadrant {
    border: 2px solid #ddd;
    border-radius: 12px;
    padding: 20px;
    overflow-y: auto;
}

.quadrant-1 { background: #ffe6e6; border-color: #ff4444; } /* 重要紧急 - 红色系 */
.quadrant-2 { background: #e6f3ff; border-color: #4488ff; } /* 重要不紧急 - 蓝色系 */
.quadrant-3 { background: #fff3e6; border-color: #ffaa44; } /* 紧急不重要 - 橙色系 */
.quadrant-4 { background: #f0f0f0; border-color: #888; }   /* 不重要不紧急 - 灰色系 */
```

**JavaScript渲染逻辑**:
```javascript
renderQuadrantView() {
    const container = document.getElementById('todoList');
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

calculateQuadrant(item) {
    const isImportant = this.isImportant(item);  // 基于标签或优先级判断
    const isUrgent = this.isUrgent(item);        // 基于DDL判断

    if (isImportant && isUrgent) return 1;
    if (isImportant && !isUrgent) return 2;
    if (!isImportant && isUrgent) return 3;
    return 4; // !isImportant && !isUrgent
}
```

### 4. 重要性/紧急性判断逻辑

**重要性判断** (基于标签):
```javascript
isImportant(item) {
    const importantTags = ['high-priority', 'urgent']; // 高优先级和紧急标签
    return item.tags.some(tagId => {
        const tag = this.tags.find(t => t.id === tagId);
        return tag && importantTags.includes(tag.color);
    });
}
```

**紧急性判断** (基于DDL):
```javascript
isUrgent(item) {
    const itemDate = new Date(item.ddl);
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // 已过期或3天内到期视为紧急
    return itemDate < today || itemDate <= threeDaysFromNow;
}
```

### 5. 表单增强
在添加/编辑表单中增加重要性和紧急性选择：

```html
<div class="form-group">
    <label>重要程度</label>
    <select id="importance">
        <option value="false">不重要</option>
        <option value="true">重要</option>
    </select>
</div>

<div class="form-group">
    <label>紧急程度</label>
    <select id="urgency">
        <option value="false">不紧急</option>
        <option value="true">紧急</option>
    </select>
</div>
```

## ✅ 验收标准

1. **功能完整性**
   - 四象限视图正确显示
   - 任务正确分类到各象限
   - 各象限标题和描述准确

2. **用户体验**
   - 象限之间视觉区分明显
   - 任务卡片保持现有功能
   - 响应式布局适配不同屏幕

3. **数据一致性**
   - 与现有视图模式数据同步
   - 筛选器在四象限视图中正常工作
   - 数据持久化正确

## 🔧 实施步骤

**第一步**：扩展数据模型和表单
**第二步**：添加四象限视图模式选项
**第三步**：实现四象限渲染逻辑
**第四步**：添加重要性/紧急性判断逻辑
**第五步**：完善样式和交互体验
**第六步**：测试和优化

## 📝 注意事项

- 保持现有功能完整性
- 确保数据迁移平滑
- 考虑性能优化（大量任务时的渲染）
- 添加必要的动画效果提升用户体验