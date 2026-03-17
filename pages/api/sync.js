import { Pool } from 'pg';

// 创建数据库连接池
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 确保表存在
async function ensureTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sync_data (
                id SERIAL PRIMARY KEY,
                device_id VARCHAR(255) NOT NULL,
                data JSONB NOT NULL,
                timestamp BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_sync_data_device_timestamp
            ON sync_data(device_id, timestamp DESC);
        `);
    } catch (error) {
        console.error('确保表存在失败:', error);
    }
}

ensureTableExists();

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 验证token（简单实现）
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
        res.status(401).json({ error: '未授权' });
        return;
    }

    try {
        if (req.method === 'POST') {
            // 处理同步数据
            const { deviceId, data, timestamp } = req.body;

            if (!deviceId || !data) {
                res.status(400).json({ error: '缺少必要参数' });
                return;
            }

            // 查询现有数据
            const existingQuery = await pool.query(
                'SELECT * FROM sync_data WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1',
                [deviceId]
            );

            let result;
            if (existingQuery.rows.length > 0) {
                // 存在现有数据，检查时间戳
                const existingData = existingQuery.rows[0];
                const existingTimestamp = parseInt(existingData.timestamp) || 0;
                const newTimestamp = parseInt(timestamp) || 0;

                if (newTimestamp >= existingTimestamp) {
                    // 新数据更新，执行更新
                    result = await pool.query(
                        'UPDATE sync_data SET data = $1, timestamp = $2, created_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
                        [JSON.stringify(data), timestamp, existingData.id]
                    );
                } else {
                    // 旧数据，返回现有数据
                    res.status(200).json({
                        success: true,
                        conflict: true,
                        data: JSON.parse(existingData.data)
                    });
                    return;
                }
            } else {
                // 新设备，插入数据
                result = await pool.query(
                    'INSERT INTO sync_data (device_id, data, timestamp) VALUES ($1, $2, $3) RETURNING *',
                    [deviceId, JSON.stringify(data), timestamp]
                );
            }

            res.status(200).json({
                success: true,
                data: data
            });

        } else if (req.method === 'GET') {
            // 获取同步数据
            const { deviceId } = req.query;

            if (!deviceId) {
                res.status(400).json({ error: '缺少deviceId参数' });
                return;
            }

            const result = await pool.query(
                'SELECT * FROM sync_data WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1',
                [deviceId]
            );

            if (result.rows.length > 0) {
                res.status(200).json(JSON.parse(result.rows[0].data));
            } else {
                res.status(200).json(null);
            }

        } else {
            res.status(405).json({ error: '方法不允许' });
        }

    } catch (error) {
        console.error('同步API错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
}