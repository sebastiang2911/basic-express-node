document.documentElement.classList.add("js-ready");

const apiUrl = "/api/mysql/users";
const userForm = document.querySelector("#mysql-user-form");
const userId = document.querySelector("#mysql-user-id");
const userName = document.querySelector("#mysql-user-name");
const userEmail = document.querySelector("#mysql-user-email");
const formTitle = document.querySelector("#mysql-form-title");
const formMessage = document.querySelector("#mysql-form-message");
const submitButton = document.querySelector("#mysql-submit");
const cancelButton = document.querySelector("#mysql-cancel");
const refreshButton = document.querySelector("#mysql-refresh");
const usersList = document.querySelector("#mysql-users-list");
const usersStatus = document.querySelector("#mysql-users-status");

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo completar la operación");
  }

  return response.status === 204 ? null : response.json();
};

const resetForm = () => {
  userForm.reset();
  userId.value = "";
  formTitle.textContent = "Crear usuario";
  submitButton.textContent = "Guardar";
  cancelButton.hidden = true;
  formMessage.textContent = "";
};

const startEditing = (user) => {
  userId.value = user.id;
  userName.value = user.name;
  userEmail.value = user.email;
  formTitle.textContent = "Editar usuario";
  submitButton.textContent = "Actualizar";
  cancelButton.hidden = false;
  userName.focus();
};

const renderUsers = (users) => {
  usersList.replaceChildren();
  usersStatus.textContent = users.length
    ? `${users.length} usuario${users.length === 1 ? "" : "s"}`
    : "Aún no hay usuarios.";

  users.forEach((user) => {
    const item = document.createElement("article");
    item.className = "user-row";

    const identity = document.createElement("div");
    const name = document.createElement("strong");
    const email = document.createElement("span");
    name.textContent = user.name;
    email.textContent = user.email;
    identity.append(name, email);

    const actions = document.createElement("div");
    actions.className = "row-actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => startEditing(user));
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger-button";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => deleteUser(user));
    actions.append(editButton, deleteButton);
    item.append(identity, actions);
    usersList.append(item);
  });
};

const loadUsers = async () => {
  usersStatus.textContent = "Cargando usuarios…";
  refreshButton.disabled = true;

  try {
    const data = await request(apiUrl);
    renderUsers(data.users);
  } catch (error) {
    usersStatus.textContent = error.message;
  } finally {
    refreshButton.disabled = false;
  }
};

const deleteUser = async (user) => {
  if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;

  try {
    await request(`${apiUrl}/${user.id}`, { method: "DELETE" });
    if (userId.value === user.id) resetForm();
    await loadUsers();
  } catch (error) {
    usersStatus.textContent = error.message;
  }
};

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = userId.value;
  submitButton.disabled = true;
  formMessage.textContent = id ? "Actualizando…" : "Guardando…";

  try {
    await request(id ? `${apiUrl}/${id}` : apiUrl, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify({ name: userName.value.trim(), email: userEmail.value.trim() }),
    });
    resetForm();
    await loadUsers();
  } catch (error) {
    formMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

cancelButton.addEventListener("click", resetForm);
refreshButton.addEventListener("click", loadUsers);
loadUsers();
