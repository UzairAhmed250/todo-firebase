import { addDoc, collection, db, getDocs, getDoc, deleteDoc, doc, updateDoc, auth, query, where } from "./firebase/config.js";

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

  // Check if user is logged in
  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("Please log in to add todos");
    return;
  }

  loader = true;
  mytodo.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding...';

  try {
    await addDoc(collection(db, "todos"), {
      task: value,
      createdAt: new Date(),
      completed: false,
      userId: currentUser.uid
    });

    console.log("Todo added successfully");
    mainInput.value = "";
    loadTodos();
  } catch (error) {
    console.error("Error Adding Todo:", error);
    alert("Error adding todo: " + error.message);
  } finally {
    loader = false;
    mytodo.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Task';
  }
};

const loadTodos = async () => {
  const loadingDiv = document.getElementById("loading");
  const emptyStateDiv = document.getElementById("empty-state");
  
  try {
    loadingDiv.classList.remove("hidden");
    emptyStateDiv.classList.add("hidden");
    
    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      emptyStateDiv.classList.remove("hidden");
      loadingDiv.classList.add("hidden");
      return;
    }
    
    // Query todos for the current user only
    const q = query(collection(db, "todos"), where("userId", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    todoList.innerHTML = "";

    if (querySnapshot.empty) {
      emptyStateDiv.classList.remove("hidden");
      loadingDiv.classList.add("hidden");
      return;
    }

    querySnapshot.forEach((doc) => {
      const todoData = doc.data();
      const li = document.createElement("li");
      li.className = "bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]";
      li.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 flex-1">
            <div class="relative">
              <input 
                type="checkbox" 
                ${todoData.completed ? 'checked' : ''} 
                data-doc-id="${doc.id}"
                data-completed="${todoData.completed}"
                class="w-5 h-5 text-purple-600 rounded-lg focus:ring-purple-500 focus:ring-2 transition-all duration-200"
              >
              <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-200 pointer-events-none"></div>
            </div>
            <div class="flex-1">
              <span class="task-text ${todoData.completed ? 'line-through text-gray-400' : 'text-gray-800'} text-lg font-medium transition-all duration-300" id="task-${doc.id}">
                ${todoData.task}
              </span>
              <div class="text-xs text-gray-500 mt-1">
                <i class="fas fa-clock mr-1"></i>
                ${todoData.createdAt ? new Date(todoData.createdAt.toDate()).toLocaleDateString() : 'Just now'}
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              class="edit-btn bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium text-sm"
              data-doc-id="${doc.id}"
              data-task="${todoData.task}"
            >
              <i class="fas fa-edit mr-1"></i>Edit
            </button>
            <button 
              class="delete-btn bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium text-sm"
              data-doc-id="${doc.id}"
            >
              <i class="fas fa-trash mr-1"></i>Delete
            </button>
          </div>
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
    emptyStateDiv.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-2xl text-red-500"></i>
        </div>
        <h3 class="text-lg font-semibold text-red-600 mb-2">Error Loading Tasks</h3>
        <p class="text-gray-500">Please try again later.</p>
      </div>
    `;
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
  
  mytodo.innerHTML = '<i class="fas fa-save mr-2"></i>Update Task';
  mytodo.className = "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl";
  
  if (!document.getElementById("cancel-edit")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancel-edit";
    cancelBtn.className = "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ml-4";
    cancelBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Cancel';
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
  mytodo.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Task';
  mytodo.className = "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl";
  
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

let getUserName = async () => {
  let userName = document.getElementById("user-name");
  try {
    // Get the current user from Firebase Auth
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log("No user is currently logged in");
      if (userName) {
        userName.innerText = "Guest";
      }
      return;
    }
    
    // Get the specific user document using the current user's UID
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("Current user data:", userData);
      if (userName) {
        userName.innerText = userData.firstName || userData.displayName || currentUser.email || "User";
      }
    } else {
      console.log("User document not found");
      if (userName) {
        userName.innerText = currentUser.displayName || currentUser.email || "User";
      }
    }
  } catch (error) {
    console.error("Error getting user name:", error);
    if (userName) {
      userName.innerText = "User";
    }
  }
}

// Make getUserName available globally
window.getUserName = getUserName;

document.addEventListener("DOMContentLoaded", () => {
  getUserName();
})

