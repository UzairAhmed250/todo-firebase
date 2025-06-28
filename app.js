import { addDoc, collection, db, getDocs, deleteDoc, doc, updateDoc } from "./firebase/config.js";

const mytodo = document.getElementById("addtodobutton");
const todoList = document.getElementById("todo-list");
const mainInput = document.getElementById("todo");
let loader = false;
let editingDocId = null;

const addtodo = async (e) => {
  const value = mainInput.value.trim();

  if (!value) {
    alert("Please enter a todo");
    return;
  }

  if (editingDocId) {
    await handleUpdateTodo();
    return;
  }

  loader = true;
  mytodo.innerText = "Adding...";

  try {
    await addDoc(collection(db, "todos"), {
      task: value,
      createdAt: new Date(),
      completed: false
    });

    console.log("Todo added successfully");
    mainInput.value = "";
    loadTodos();
  } catch (error) {
    console.error("Error Adding Todo:", error);
    alert("Error adding todo: " + error.message);
  } finally {
    loader = false;
    mytodo.innerText = "Add Todo";
  }
};

const loadTodos = async () => {
  const loadingDiv = document.getElementById("loading");
  const emptyStateDiv = document.getElementById("empty-state");
  
  try {
    loadingDiv.classList.remove("hidden");
    emptyStateDiv.classList.add("hidden");
    
    const querySnapshot = await getDocs(collection(db, "todos"));
    todoList.innerHTML = "";

    if (querySnapshot.empty) {
      emptyStateDiv.classList.remove("hidden");
      loadingDiv.classList.add("hidden");
      return;
    }

    querySnapshot.forEach((doc) => {
      const todoData = doc.data();
      const li = document.createElement("li");
      li.className = "flex justify-between items-center p-3 border-b border-gray-200 bg-white rounded-lg shadow-sm mb-2";
      li.innerHTML = `
        <div class="flex items-center gap-3 flex-1">
          <input 
            type="checkbox" 
            ${todoData.completed ? 'checked' : ''} 
            data-doc-id="${doc.id}"
            data-completed="${todoData.completed}"
            class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          >
          <span class="task-text ${todoData.completed ? 'line-through text-gray-500' : 'text-gray-800'} flex-1" id="task-${doc.id}">
            ${todoData.task}
          </span>
        </div>
        <div class="flex gap-2">
          <button 
            class="edit-btn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm transition-colors duration-200"
            data-doc-id="${doc.id}"
            data-task="${todoData.task}"
          >
            Edit
          </button>
          <button 
            class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm transition-colors duration-200"
            data-doc-id="${doc.id}"
          >
            Delete
          </button>
        </div>
      `;
      console.log("todoData", todoData)
      
      const checkbox = li.querySelector('input[type="checkbox"]');
      const editBtn = li.querySelector('.edit-btn');
      const deleteBtn = li.querySelector('.delete-btn');
      
      checkbox.addEventListener('change', handleToggleComplete);
      editBtn.addEventListener('click', handleEditTodo);
      deleteBtn.addEventListener('click', handleDeleteTodo);
      
      todoList.appendChild(li);
    });
    
    loadingDiv.classList.add("hidden");
  } catch (error) {
    console.error("Error loading todos:", error);
    loadingDiv.classList.add("hidden");
    emptyStateDiv.innerHTML = "Error loading todos. Please try again.";
    emptyStateDiv.classList.remove("hidden");
  }
};

const handleDeleteTodo = async (event) => {
  const docId = event.target.dataset.docId;
  
  if (confirm("Are you sure you want to delete this todo?")) {
    try {
      await deleteDoc(doc(db, "todos", docId));
      console.log("Todo deleted successfully");
      loadTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Error deleting todo: " + error.message);
    }
  }
};

const handleEditTodo = (event) => {
  const docId = event.target.dataset.docId;
  const currentTask = event.target.dataset.task;
  
  editingDocId = docId;
  mainInput.value = currentTask;
  mainInput.focus();
  mainInput.select();
  
  mytodo.innerText = "Update Todo";
  mytodo.className = "border rounded-lg px-6 py-3 bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 font-medium";
  
  if (!document.getElementById("cancel-edit")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancel-edit";
    cancelBtn.className = "border rounded-lg px-6 py-3 bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-200 font-medium ml-2";
    cancelBtn.innerText = "Cancel";
    cancelBtn.addEventListener("click", handleCancelEdit);
    mytodo.parentNode.appendChild(cancelBtn);
  }
};

const handleUpdateTodo = async () => {
  const newTask = mainInput.value.trim();
  
  if (!newTask) {
    alert("Please enter a todo");
    return;
  }
  
  try {
    await updateDoc(doc(db, "todos", editingDocId), {
      task: newTask,
      updatedAt: new Date()
    });
    console.log("Todo updated successfully");
    
    resetToAddMode();
    loadTodos();
  } catch (error) {
    console.error("Error updating todo:", error);
    alert("Error updating todo: " + error.message);
  }
};

const handleCancelEdit = () => {
  resetToAddMode();
  loadTodos();
};

const resetToAddMode = () => {
  editingDocId = null;
  mainInput.value = "";
  mytodo.innerText = "Add Todo";
  mytodo.className = "border rounded-lg px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 font-medium";
  
  const cancelBtn = document.getElementById("cancel-edit");
  if (cancelBtn) {
    cancelBtn.remove();
  }
};

const handleToggleComplete = async (event) => {
  const docId = event.target.dataset.docId;
  const completed = event.target.checked;
  
  try {
    await updateDoc(doc(db, "todos", docId), {
      completed: completed,
      updatedAt: new Date()
    });
    console.log("Todo status updated");
    loadTodos();
  } catch (error) {
    console.error("Error updating todo status:", error);
    alert("Error updating todo status: " + error.message);
  }
};

mytodo.addEventListener("click", addtodo);

document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
});

mainInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addtodo();
  }
});
