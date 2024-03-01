function createUserCard(user) {
  const gravatarUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg`;

  return /*html*/ `
        <div class="b">
            <!-- card -->
            <div class="card rounded-3">
                <!-- card body -->
                <div class="card-body" style="height:300px;">
                    <!-- Avatar -->
                    <img src="${gravatarUrl}" style="width: 100px; height: 100px" alt="Avatar" class="rounded-circle mb-3">
                    <!-- Title -->
                    <h4 class="mb-1">${user.name}</h4>
                    <p>${user.isAdmin ? "Adminstaror" : ""}</p>
                    <div>
                        <div class="d-flex justify-content-between align-items-center">
                        <button type="button" class="btn btn-info send-email-btn" data-bs-toggle="modal" data-bs-target="#exampleModal" data-email="${
                          user.email
                        }">
                        Send a message
                      </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function addUsersToPage(users) {
  const userCardsContainer = document.getElementById("user-cards");
  if (userCardsContainer) {
    users.forEach((user) => {
      const cardHTML = createUserCard(user);
      userCardsContainer.innerHTML += cardHTML;
    });
  } else {
    console.error("User cards container not found");
  }
}

async function getAllUsers() {
  try {
    const response = await fetch(`http://localhost:3000/api/users`);

    if (response.ok) {
      const users = await response.json();
      addUsersToPage(users);
    } else {
      console.error("Failed to get users");
    }
  } catch (error) {
    console.error("Can't connect to the API", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  //console.log(token)
  if (token) {
    getAllUsers();
    //  console.log('Token:', token);
  } else {
    console.error("Token not found in cookie");
  }
});

document.getElementById("logout").addEventListener("click", function () {
  logout();
});

function logout() {
  localStorage.removeItem("token");
  alert("You have been signed out.");
  window.location.href = "/login/login.html";
}
function md5(string) {
  let hash = 0;
  if (string.length === 0) {
    return hash;
  }
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

const sendEmailForm = document.getElementById("sendEmailForm");
const to = document.getElementById("to");
const subject = document.getElementById("subject");
const message = document.getElementById("message");

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("send-email-btn")) {
    const userEmail = event.target.getAttribute("data-email");
    openEmailDialog(userEmail);
  }
});

function openEmailDialog(email) {
  to.value = email;
}

sendEmailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await sendEmail(to.value, subject.value, message.value);
});

async function sendEmail(to, subject, message) {
  fetch("http://localhost:3000/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, message }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      alert(data.message);
    })
    .catch((error) => console.error("Error:", error));
}
