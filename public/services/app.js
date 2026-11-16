fetch("/api/users?from=0&limit=1", { method: "GET" }).catch(() => { const status = document.querySelector(".status"); status.textContent = "API offline"; status.classList.add("offline"); });
