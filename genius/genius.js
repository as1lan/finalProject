async function getSongs() {
  const input = document.querySelector("#input").value;
  const url = `https://genius-song-lyrics1.p.rapidapi.com/search/?q=${input}&per_page=10&page=1`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "b1e5646d2amsh650db7c12d103c5p10bc51jsn9019a9ff1f60",
      "X-RapidAPI-Host": "genius-song-lyrics1.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    result?.hits?.forEach((item) => {
      document.querySelector("#list").innerHTML += /*html*/ `
              <li>
      <div>
        <div class="card" style="width: 18rem">
          <img
            src="${item.result.header_image_thumbnail_url}"
            class="card-img-top"
            alt="${item.result.id}"
          />
          <div class="card-body">
            <a href="${item.result.url}"
              ><h4 class="card-title">${item.result.title}</h4></a
            >
            <p class="card-text">
              Release date:
              ${
                item.result.release_date_components &&
                item.result.release_date_components.year +
                  " " +
                  item.result.release_date_components.month +
                  " " +
                  item.result.release_date_components.day
              }
            </p>
            <p>${item.result.artist_names}</p>
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
  getSongs();
});
