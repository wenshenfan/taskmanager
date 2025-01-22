const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;



// 中間件設置
app.use(cors());
app.use(express.json()); // 用於解析 JSON 格式的請求正文

// 初始化 SQLite 資料庫
const db = new sqlite3.Database('task-manager.db', (err) => {
  if (err) {
    console.error('資料庫無法開啟:', err.message);
  } else {
    console.log('資料庫已開啟');
  }
});

// 創建任務資料表（如果尚未創建）
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// 取得所有任務
app.get('/tasks', (req, res) => {
  const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: '無法獲取任務資料' });
    }
    res.json(rows);
  });
});

// 取得單一任務
app.get('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM tasks WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: '無法獲取任務' });
    }
    if (!row) {
      return res.status(404).json({ message: '找不到此任務' });
    }
    res.json(row);
  });
});

// 新增任務
app.post('/tasks', (req, res) => {
    const { title, description, status } = req.body;
    const finish_at = null;
    if (!title) {
      return res.status(400).json({ message: '標題為必填欄位' });
    }
  
    // 取得當前時間 (使用 new Date()，會自動是當地時間)
    const createdAt = new Date().toISOString(); // 使用當地時間的 ISO 格式
  
    // 插入資料庫的 SQL 查詢
    const query = 'INSERT INTO tasks (title, description, status, created_at,finish_at) VALUES (?, ?, ?, ?,?)';
    db.run(query, [title, description || '', status || 'pending', createdAt,finish_at], function (err) {
      if (err) {
        return res.status(500).json({ message: '新增任務失敗' });
      }
      const newTask = {
        id: this.lastID,
        title,
        description: description || '',
        status: status || 'pending',
        created_at: createdAt,  // 使用當地時間
        finish_at: null,
      };
      res.status(201).json(newTask);  // 回傳所有欄位，包括描述和建立時間
    });
  });

// 更新任務
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  const finsh_at = status ==='completed' ? new Date().toISOString() : null;
  const query = 'UPDATE tasks SET title = ?, description = ?, status = ?, finish_at = ? WHERE id = ?';

  db.run(query, [title, description, status, finsh_at, id], function (err) {
    if (err) {
      return res.status(500).json({ message: '更新任務失敗' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '找不到此任務' });
    }
    res.status(200).json({ message: '任務更新成功' });
  });
});

// 刪除任務
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM tasks WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: '刪除任務失敗' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '找不到此任務' });
    }
    res.status(200).json({ message: '任務刪除成功' });
  });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`伺服器正在運行於 http://localhost:${port}`);
});
