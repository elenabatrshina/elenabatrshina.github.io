
import movies from './films.json'
import tags from './tags.json'

let arrFromLocalStorage = localStorage.getItem("favMoviesArr");

movies.forEach((item, i) => {
  item.id = i;
  item.favorite = false;
  if (arrFromLocalStorage && arrFromLocalStorage.includes(item.title)) {
    item.favorite = true
  }
});

const objOfMovies = movies.reduce((acc, movie) => {
  acc[movie.id] = movie;
  return acc;
}, {});

// Elements UI
const listContainer = document.querySelector('.list-group'),
  bookmarksBtn = document.querySelector('.bookmarksBtn'),
  moviesBtn = document.querySelector('.moviesBtn'),
  btnForTurnBack = document.querySelector('.button_for_turn_back'),
  tagsDiv = document.querySelector('.tagsBlock');


let arrHTML = listContainer.children;
let showAll = true;


// Events
bookmarksBtn.addEventListener('click', showFavoriteMovies);
moviesBtn.addEventListener('click', showAllMovies);
listContainer.addEventListener('click', onFavoritehandler);

function listItemTemplate({ title, tags, id, favorite } = {}) {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center', 'mt-2');
  li.setAttribute('data-movie-id', id);

  const span = document.createElement('span');
  span.textContent = title;
  span.classList.add('mr-1');

  const favoritesBtn = document.createElement('a');
  const favoritesImg = document.createElement('img');
  favoritesImg.classList.add('favorites-btn');
  if (favorite) {
    favoritesImg.setAttribute('src', 'images/star_fav.png');
  } else favoritesImg.setAttribute('src', 'images/star.png');

  favoritesBtn.appendChild(favoritesImg);
  favoritesBtn.style.cursor = 'pointer';

  li.appendChild(span);
  li.appendChild(favoritesBtn);

  return li;
}

function getMoviesListRange(movies, from, to, className) {
  let template = [];

  if (movies.length <= to) { to = movies.length; }

  for (let i = from; i < to; i++) {
    const li = listItemTemplate(movies[i]);
    li.classList.add(className);
    template.push(li);
  }

  if (movies.length > to) {
    const btn = document.createElement('button');
    btn.innerHTML = 'Показать ещё';
    btn.classList.add('btn', 'btn-secondary', 'mt-4', 'mb-4', 'showmore');

    btn.addEventListener('click', function () {
      moviesHTML(getMoviesListRange(movies, to, to + 15));
      this.parentElement.removeChild(this);
    });
    template.push(btn);
  }
  return template;
}

function moviesHTML(list) {
  if (!list) {
    console.error('Передайте список фильмов');
    return;
  }

  const fragment = document.createDocumentFragment();
  list.forEach(movie => {
    fragment.appendChild(movie);
  });

  listContainer.appendChild(fragment);
};
moviesHTML(getMoviesListRange(movies, 0, 15));

// -- Favorites --
function onFavoritehandler(event) {
  if (event.target.classList.contains('favorites-btn')) {
    const parent = event.target.closest('[data-movie-id]'),
      id = parent.dataset.movieId;
    objOfMovies[id].favorite = !objOfMovies[id].favorite;
    if (!showAll) {
      parent.classList.add('hide');
      parent.classList.remove('show');

    }

    if (objOfMovies[id].favorite) {
      event.target.setAttribute('src', 'images/star_fav.png');
    } else event.target.setAttribute('src', 'images/star.png');

    let favMoviesArr = getFavoriteMovies();
    localStorage.setItem("favMoviesArr", favMoviesArr.map(movie => movie.title))
  }
};


function showFavoriteMovies() {
  showAll = false;
  document.querySelector('#searchForm').classList.add('hide');
  document.querySelector('#searchForm').classList.remove('show');
  document.querySelector('.tagsBlock').classList.add('hide');
  document.querySelector('.tagsBlock').classList.remove('show');

  bookmarksBtn.classList.add('active');
  moviesBtn.classList.remove('active');
  let favMoviesArr = getFavoriteMovies();

  [...arrHTML].forEach((item) => {
    item.remove();
  });

  moviesHTML(getMoviesListRange(favMoviesArr, 0, 15));
}

function showAllMovies() {
  showAll = true;
  document.querySelector('#searchForm').classList.remove('hide');
  document.querySelector('#searchForm').classList.add('show');
  document.querySelector('.tagsBlock').classList.remove('hide');
  document.querySelector('.tagsBlock').classList.add('show');
  bookmarksBtn.classList.remove('active');
  moviesBtn.classList.add('active');
  [...arrHTML].forEach((item) => {
    item.remove();
  });
  moviesHTML(getMoviesListRange(movies, 0, 15));
}

function getFavoriteMovies() {
  let favMoviesArr = Object.values(objOfMovies).filter((item) => { return item.favorite === true });
  return favMoviesArr;
}
// -- / Favorites --

function createTagButtons() {
  const fragment = document.createDocumentFragment();
  tags.forEach(tag => {
    const tagBtn = document.createElement('button');
    tagBtn.classList.add('btn', 'btn-outline-dark', 'mr-3', 'mb-3', 'tagBtn');
    tagBtn.style.type = "button";
    tagBtn.style.fontSize = "13px";
    tagBtn.innerHTML = tag;
    tagBtn.setAttribute('data-tag-title', tag);
    fragment.appendChild(tagBtn);
  });
  tagsDiv.appendChild(fragment);
}
createTagButtons();

let activeTagsArr = [];
let moviesWithTagsRepeatArr;
let matchArr;
let isSubmit = false;
let isTaged = false;
tagsDiv.addEventListener('click', (e) => {
  if (e.target.tagName === "BUTTON") {
    isTaged = true;
    if (e.target.classList.contains('active')) {
      activeTagsArr.splice(activeTagsArr.indexOf(e.target.getAttribute('data-tag-title')), 1);
    } else activeTagsArr.push(e.target.getAttribute('data-tag-title'));

    [...arrHTML].forEach((item) => {
      item.remove();
    });

    moviesWithTagsRepeatArr = [];

    if (isSubmit) {
      createMatchArr(matchArr)
    } else createMatchArr(Object.values(objOfMovies))

    function createMatchArr(arr) {
      arr.forEach((item) => {
        if (activeTagsArr.every(tag => item.tags.includes(tag))) {
          moviesWithTagsRepeatArr.push(item);
        }
      });
    }
    moviesHTML(getMoviesListRange(moviesWithTagsRepeatArr, 0, 15));

    e.target.classList.toggle('active');
    if (!e.target.classList.contains('active')) {
      isTaged = false;
    }
    console.log(isTaged)
    document.querySelector('.text-section').textContent = "";
    if (!moviesWithTagsRepeatArr.length) {
      document.querySelector('.text-section').textContent = "Нет элементов, удовлетворяющих поиску"
    } else document.querySelector('.text-section').textContent = "";
  }
})


// --  Text to find --

document.querySelector('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  FindOnPage();
  isSubmit = !isSubmit;
})

btnForTurnBack.addEventListener('click', () => {
  document.getElementById('text-to-find').value = "";
  FindOnPage();
});

function FindOnPage() {
  let input = document.getElementById('text-to-find');
  input.value = input.value.trim();

  matchArr = [];

  if (isTaged) {
    createSearchArr(moviesWithTagsRepeatArr)
  } else createSearchArr(Object.values(objOfMovies))
  console.log(isTaged)

  function createSearchArr(arr) {
    arr.forEach((item) => {
      if (item.title.toLowerCase().includes(input.value.toLowerCase())) {
        matchArr.push(item);
      }
    });
  }
  [...arrHTML].forEach((item) => {
    item.remove();
  });
  moviesHTML(getMoviesListRange(matchArr, 0, 15));
  if (!matchArr.length) {
    document.querySelector('.text-section').textContent = "Нет элементов, удовлетворяющих поиску"
  } else document.querySelector('.text-section').textContent = "";
}


  // -- / Text to find --


