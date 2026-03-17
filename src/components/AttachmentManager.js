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

    setupUploadListener() {
        const fileInput = document.getElementById('attachments');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
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
        }
    }
}

export default AttachmentManager;