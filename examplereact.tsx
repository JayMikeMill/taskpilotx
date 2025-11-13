// TaskDashboard.tsx
import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useMemo,
} from "react";

// ----------------------
// Type Definitions
// ----------------------
type Task = {
  title: string;
  completed: boolean;
  due: Date;
};

// ----------------------
// Context for global state (like Angular Services)
// ----------------------
const TaskContext = createContext<{
  tasks: Task[];
  toggleTask: (index: number) => void;
  addTask: (task: Task) => void;
}>({
  tasks: [],
  toggleTask: () => {},
  addTask: () => {},
});

// ----------------------
// Context Provider Component
// ----------------------
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    { title: "Initial Task", completed: false, due: new Date() },
  ]);

  // Toggle completion status of a task
  const toggleTask = (index: number) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, completed: !t.completed } : t))
    );
  };

  // Add a new task
  const addTask = (task: Task) => setTasks((prev) => [...prev, task]);

  return (
    <TaskContext.Provider value={{ tasks, toggleTask, addTask }}>
      {children}
    </TaskContext.Provider>
  );
};

// ----------------------
// Task Card Component
// ----------------------
export const TaskCard: React.FC<{ task: Task; index: number }> = ({
  task,
  index,
}) => {
  const { toggleTask } = useContext(TaskContext);

  // Local component state
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  // Memoized formatted due date
  const formattedDate = useMemo(
    () =>
      task.due.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    [task.due]
  );

  // Lifecycle hook equivalent
  useEffect(() => {
    console.log(`Rendered task: ${task.title}`);
    return () => console.log(`Unmounted task: ${task.title}`);
  }, [task.title]);

  // Dynamic styles
  const cardStyle = {
    backgroundColor: task.completed ? "#d4edda" : "#fff3cd",
    border: "1px solid #ccc",
    padding: "1rem",
    marginBottom: "0.5rem",
    borderRadius: "8px",
  };

  return (
    <div style={cardStyle}>
      {/* Editable title */}
      {editing ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <h3
          onClick={() => setEditing(true)}
          style={{ textDecoration: task.completed ? "line-through" : "none" }}
        >
          {title}
        </h3>
      )}

      <p>Due: {formattedDate}</p>

      {/* Button to toggle completion */}
      <button onClick={() => toggleTask(index)}>
        {task.completed ? "Undo" : "Complete"}
      </button>
    </div>
  );
};

// ----------------------
// Main Dashboard Component
// ----------------------
export const TaskDashboard: React.FC = () => {
  const { tasks, addTask } = useContext(TaskContext);
  const [newTitle, setNewTitle] = useState("");

  return (
    <div>
      <h1>React Task Dashboard</h1>

      {/* Add new task */}
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="New task title"
      />
      <button
        onClick={() => {
          addTask({ title: newTitle, completed: false, due: new Date() });
          setNewTitle("");
        }}
      >
        Add Task
      </button>

      {/* Task list */}
      {tasks.map((t, i) => (
        <TaskCard key={i} task={t} index={i} />
      ))}

      {/* Summary */}
      <p>Total tasks: {tasks.length}</p>
      <p>Completed: {tasks.filter((t) => t.completed).length}</p>
    </div>
  );
};
