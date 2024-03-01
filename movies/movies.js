async function getMovies(name) {
  const url = `https://movies-api14.p.rapidapi.com/search?query=${name}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "b1e5646d2amsh650db7c12d103c5p10bc51jsn9019a9ff1f60",
      "X-RapidAPI-Host": "movies-api14.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    result?.contents?.forEach((item) => {
      document.querySelector("#list").innerHTML += /*html*/ `
                <li>
        <div>
          <div class="card" style="width: 18rem">
            <img
              src="${item.backdrop_path}"
              class="card-img-top"
              alt="${item.id}"
            />
            <div class="card-body">
              <a href="${item.youtube_trailer}"
                ><h4 class="card-title">${item.title}</h4></a
              >
              <p class="card-text">
                ${item.overview}
              </p >
              <p class="card-text">Release Date: ${item.release_date}</p>
              <button class="btn btn-warning">${item.vote_average}/10</button>
            </div>
          </div>
        </div>
      </li>
    `;
    });
  } catch (error) {
    console.error(error);
  }
}

document.querySelector("#submit").addEventListener("submit", (e) => {
  e.preventDefault();
  getMovies(document.querySelector("#input").value);
});

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
