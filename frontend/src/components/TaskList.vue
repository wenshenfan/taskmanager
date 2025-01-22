<template>
  <div class="task-container">
    <h1>我ㄉ待辦清單</h1>

    <!-- 新增任務表單 -->
    <form @submit.prevent="addTask" class="task-form">
      <div class="form-group">
        <label for="title">標題:</label>
        <input
          type="text"
          id="title"
          v-model="newTask.title"
          required
          placeholder="輸入任務標題"
        />
      </div>
      <div class="form-group">
        <label for="description">描述:</label>
        <textarea
          id="description"
          v-model="newTask.description"
          placeholder="輸入任務描述"
        ></textarea>
      </div>
      <button type="submit" class="btn btn-primary">新增任務</button>
    </form>

    <!-- 任務列表 -->
    <transition-group name="task-list" tag="ul" class="task-list">
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-content">
          <h3>標題：{{ task.title }}</h3>
          <p>描述：{{ task.description }}</p>
          <p>建立時間：{{ new Date(task.created_at).toLocaleString() }}</p>
          <p>完成時間：{{ task.finish_at ? new Date(task.finish_at).toLocaleString() : '待辦' }}</p>

        </div>

        <!-- 標示完成/未完成的按鈕 -->
        <button
          @click="toggleCompletion(task.id)"
          :class="[
            'btn',
            task.status === 'completed' ? 'btn-success' : 'btn-secondary',
          ]"
        >
          {{ task.status === "completed" ? "完成" : "未完成" }}
        </button>

        <!-- 刪除按鈕 -->
        <button @click="deleteTask(task.id)" class="btn btn-danger">
          刪除
        </button>
      </li>
    </transition-group>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      newTask: {
        title: "",
        description: "",
        status: "pending",
      },
      tasks: [],
    };
  },
  created() {
    this.fetchTasks();
  },
  methods: {
    fetchTasks() {
      axios
        .get("http://localhost:3000/tasks")
        .then((response) => {
          this.tasks = response.data;
        })
        .catch((error) => console.error("獲取任務錯誤:", error));
    },
    addTask() {
   
      axios
        .post("http://localhost:3000/tasks", this.newTask)
        .then((response) => {
          // 新任務添加到最上面，使用 unshift
          this.tasks.unshift(response.data);
          this.newTask.title = "";
          this.newTask.description = "";
          this.newTask.status = "pending";
          this.newTask.finish_at = null;
        })
        .catch((error) => console.error("新增任務錯誤:", error));
    },

    toggleCompletion(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    task.status = task.status === "completed" ? "pending" : "completed";
    task.finish_at = task.status === "completed" ? new Date().toISOString() : null; // 設定完成時間

    axios
        .put(`http://localhost:3000/tasks/${taskId}`, task)
        .then((response) => {
            this.$set(task, 'finish_at', response.data.finish_at);  // 從後端回傳更新時間
        
        })
        .catch((error) => console.error("更新任務錯誤:", error));
    },
    deleteTask(taskId) {
      axios
        .delete(`http://localhost:3000/tasks/${taskId}`)
        .then(() => {
          this.tasks = this.tasks.filter((task) => task.id !== taskId);
        })
        .catch((error) => console.error("刪除任務錯誤:", error));
    },
  },
};
</script>

<style scoped>
/* 定義任務列表動畫效果 */
.task-list-enter-active,
.task-list-leave-active,
.task-list-move {
  transition: all 0.5s ease;
}

.task-list-enter {
  transform: translateY(-30px); 
  opacity: 0;
}

.task-list-leave-to {
  transform: translateX(30px); 
  opacity: 0;
}

/* 容器樣式 */
.task-container {
  width: 80%;
  margin: 0 auto;
  max-width: 900px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-success {
  background-color: #28a745; /* 自定義綠色 */
  color: white;
  padding: 8px 15px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-success:hover {
  background-color: #218838; /* 深一點的綠色，作為 hover 效果 */
}

/* 標題 */
h1 {
  text-align: center;
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
}

/* 表單樣式 */
.task-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #007bff;
  outline: none;
}

/* 任務列表樣式 */
.task-list {
  list-style: none;
  padding: 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-content {
  flex-grow: 1;
}

.task-content h3 {
  font-size: 1.2rem;
  color: #333;
}

.task-content p {
  margin: 5px 0;
  color: #666;
}

/* 按鈕樣式 */
.btn {
  padding: 8px 15px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 150px; /* 固定寬度 */
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn:hover {
  opacity: 0.8;
}
</style>
