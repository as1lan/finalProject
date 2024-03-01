async function getQuotes() {
  const url =
    "https://andruxnet-random-famous-quotes.p.rapidapi.com/?cat=famous&count=10";
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "b1e5646d2amsh650db7c12d103c5p10bc51jsn9019a9ff1f60",
      "X-RapidAPI-Host": "andruxnet-random-famous-quotes.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    result.forEach((item) => {
      document.querySelector("#list").innerHTML += /*html*/ `
        <li>
        <div class="card" style="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">${item.author}</h5>
            <p class="card-text">${item.quote}</p>
            <a href="#" class="btn btn-primary">${item.category}</a>
          </div>
        </div>
        </li>
          
        `;
    });
  } catch (error) {
    console.error(error);
  }
}
getQuotes();
