const GOOGLE_LOGIN_KEY = "googleLogin";
let googleUserEmail = null;

function showGoogleUser(user) {
  googleUserEmail = user.email;
  document.querySelector("#google-user-name").textContent = user.name;
  document.querySelector("#google-user-email").textContent = user.email;
  const avatar = document.querySelector("#google-avatar");
  avatar.src = user.image || "https://www.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png";
  avatar.alt = `Foto de ${user.name}`;
  document.querySelector("#google-message").textContent = "";
  document.querySelector("#google-signin").hidden = true;
  document.querySelector("#google-account").hidden = false;
}

try {
  const login = JSON.parse(localStorage.getItem(GOOGLE_LOGIN_KEY) || "null");
  if (login?.user && login?.token) showGoogleUser(login.user);
} catch {
  localStorage.removeItem(GOOGLE_LOGIN_KEY);
}

async function handleGoogleCredential(response) {
  const message = document.querySelector("#google-message");
  message.classList.remove("error");
  message.textContent = "Verificando cuenta…";

  try {
    const httpResponse = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_token: response.credential }) });
    const data = await httpResponse.json();
    if (!httpResponse.ok) throw new Error(data.message || "No fue posible iniciar sesión");
    localStorage.setItem(GOOGLE_LOGIN_KEY, JSON.stringify({ user: data.user, token: data.token }));
    showGoogleUser(data.user);
  } catch (error) {
    message.classList.add("error");
    message.textContent = error.message;
  }
}

function signOutGoogle() {
  const finish = () => {
    googleUserEmail = null;
    localStorage.removeItem(GOOGLE_LOGIN_KEY);
    document.querySelector("#google-account").hidden = true;
    document.querySelector("#google-signin").hidden = false;
    document.querySelector("#google-message").textContent = "Sesión cerrada correctamente.";
  };

  google.accounts.id.disableAutoSelect();
  if (googleUserEmail) return google.accounts.id.revoke(googleUserEmail, finish);
  finish();
}

document.querySelector("#google-signout").addEventListener("click", signOutGoogle);
