const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
            <img src="${imgSrc}" />
            ${movie.Title} (${movie.Year})
          `;
  },

  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "afb7bb8",
        s: searchTerm,
      },
    });

    if (response.data.Error) return [];

    return response.data.Search;
  },
};

createAutoComplete({
  root: document.querySelector("#left-autocomplete"),
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie , document.querySelector("#left-summary") , 'left');
  },
});

createAutoComplete({
  root: document.querySelector("#right-autocomplete"),
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie , document.querySelector("#right-summary"), 'right');
  },
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie , summaryElement , side) => {
  const response = await axios.get("http://www.omdbapi.com/", {
    params: {
      i: movie.imdbID,
      apikey: "afb7bb8",
    },
  });

  summaryElement.innerHTML = movieTeplate(response.data);

  if(side === 'left') leftMovie = response.data
  else rightMovie = response.data

  // Time to comparison

  if(leftMovie && rightMovie){
    runComparison();
  }

};

const runComparison = () =>{
  const leftArticles = document.querySelectorAll("#left-summary .notification")
  const rightArticles = document.querySelectorAll("#right-summary .notification")
  
  leftArticles.forEach((leftStat , index) =>{
    const rightStat = rightArticles[index]
    
    let leftSideValue = leftStat.getAttribute("data-value")
    let rightSideValue = rightStat.getAttribute("data-value")

    if(rightSideValue > leftSideValue){
      leftStat.classList.remove("is-primary")
      leftStat.classList.add("is-warning")
    }else if (leftSideValue > rightSideValue){
      rightStat.classList.remove("is-primary")
      rightStat.classList.add("is-warning")
    }else{
      leftStat.classList.remove("is-primary")
      rightStat.classList.remove("is-primary")
      leftStat.classList.add("is-gray")
      rightStat.classList.add("is-gray")
    }

  })
}


const movieTeplate = (movieDetail) => {


  const dollrs = ((movieDetail.BoxOffice === 'N/A') || (!movieDetail.BoxOffice)) ? 0 : parseInt(movieDetail.BoxOffice.replace(/\$/g , '').replace(/,/g , ''));
  const metaScore = ((movieDetail.Metascore === 'N/A') || (!movieDetail.Metascore))  ? 0 : parseInt(movieDetail.Metascore);
  const imdbRating = ((movieDetail.imdbRating === 'N/A') || (!movieDetail.imdbRating))  ? 0 : parseFloat(movieDetail.imdbRating);
  const votes = parseInt(movieDetail.imdbVotes.replace(/,/g , ''))

  const awards = movieDetail.Awards.split(' ').reduce((prev,word) =>{
    let value = parseInt(word)

    if(isNaN(value)) return prev
    else             return prev + value 
  } , 0)

  return `
        <article class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="${movieDetail.Poster}" />
                </p>
            </figure>

            <div class="media-content">
                <div class="content">
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>

        </article>

        <article data-value=${awards} class="notification is-primary">
            <p class="title">${movieDetail.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>

        <article data-value=${dollrs} class="notification is-primary">
            <p class="title">${movieDetail.BoxOffice}</p>
            <p class="subtitle">Box Office</p>
        </article>

        <article data-value=${metaScore} class="notification is-primary">
            <p class="title">${movieDetail.Metascore}</p>
            <p class="subtitle">Metascore</p>
        </article>

        <article data-value=${imdbRating} class="notification is-primary">
            <p class="title">${movieDetail.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>

        <article data-value=${votes} class="notification is-primary">
            <p class="title">${movieDetail.imdbVotes}</p>
            <p class="subtitle">IMDB Votes</p>
        </article>
    `;
};
