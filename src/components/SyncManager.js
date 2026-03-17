// 同步管理器
class SyncManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.deviceId = this.getDeviceId();
        this.syncKey = 'todo_sync_data';
        this.apiUrl = this.getApiUrl();
        this.init();
    }

    init() {
        this.initCrossTabSync();
        setInterval(() => this.sync(), 30000);
        window.addEventListener('online', () => this.sync());
        window.addEventListener('offline', () => this.handleOffline());
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
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3000/api/sync';
        }
        return '/api/sync';
    }

    initCrossTabSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'todoItems' || e.key === 'todoLists' || e.key === 'todoTags') {
                this.taskManager.loadFromStorage();
                this.taskManager.renderTodoList();
            }
        });
    }

    async sync() {
        if (!navigator.onLine) return;

        try {
            const currentData = this.getSyncData();
            const lastSyncData = localStorage.getItem(this.syncKey);

            if (lastSyncData) {
                const parsed = JSON.parse(lastSyncData);
                if (this.hasDataChanged(currentData, parsed)) {
                    await this.syncToCloud(currentData);
                }
            }

            await this.syncFromCloud();
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
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    deviceId: this.deviceId,
                    data: data,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                console.log('数据上传到云端成功');
                return true;
            }
            throw new Error('同步失败');
        } catch (error) {
            console.error('同步到云端失败:', error);
            this.storeFailedSync(data);
            return false;
        }
    }

    async syncFromCloud() {
        try {
            const response = await fetch(`${this.apiUrl}?deviceId=${this.deviceId}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                const remoteData = result?.data || result;

                if (remoteData && typeof remoteData === 'object') {
                    const mergedData = this.mergeData(this.getSyncData(), remoteData);
                    this.applySyncData(mergedData);
                }
            }
        } catch (error) {
            console.error('从云端下载失败:', error);
        }
    }

    mergeData(local, remote) {
        if (!remote) return local;

        const localTime = parseInt(local.lastModified) || 0;
        const remoteTime = parseInt(remote.lastModified) || 0;

        if (localTime >= remoteTime) {
            return local;
        } else {
            return remote;
        }
    }

    applySyncData(data) {
        if (data.lists) localStorage.setItem('todoLists', data.lists);
        if (data.items) localStorage.setItem('todoItems', data.items);
        if (data.tags) localStorage.setItem('todoTags', data.tags);
        if (data.lastModified) localStorage.setItem('lastModified', data.lastModified);

        this.taskManager.loadFromStorage();
        this.taskManager.renderTodoList();
    }

    getAuthToken() {
        return localStorage.getItem('authToken') || 'anonymous';
    }

    storeFailedSync(data) {
        const failedSyncs = JSON.parse(localStorage.getItem('failedSyncs') || '[]');
        failedSyncs.push({
            data: data,
            timestamp: Date.now()
        });
        localStorage.setItem('failedSyncs', JSON.stringify(failedSyncs));
    }

    async retryFailedSyncs() {
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
        console.log('离线模式，暂停同步');
    }

    async initializeDevice() {
        try {
            await this.syncFromCloud();
        } catch (error) {
            console.error('设备初始化失败:', error);
        }
    }
}

export default SyncManager;