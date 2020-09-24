document.querySelector('form').addEventListener('submit', submit);
document.querySelector('.search-button').addEventListener('click', submit);
document.querySelector('#back-to-list').addEventListener('click', showLists);
document.querySelector('#copy-button').addEventListener('click', copyLyrics);
function submit(e) {
  e.preventDefault();
  let input = document.querySelector('input');
  if (input.value != '') {
    findLyrics(input.value);
  }
}
function showLists(e) {
  e.preventDefault();
  hideErrorBlock();
  hideLyricBlock();
  showPaginationBlock();
  showErrorBlockOutSideLyricsBlock();
}
function findLyrics(inputKeyWord) {
  showLoader();
  hidePaginationBlock();
  hideErrorBlock();
  hideLyricBlock();
  showErrorBlockOutSideLyricsBlock();
  let url = `https://api.lyrics.ovh/suggest/${inputKeyWord}`;
  fetch(url)
    .then((response) => response.json())
    .then(({ data }) => {
      if (data.length > 0) {
        let pagination = new paginationBlock(data);
        pagination.init();
      } else {
        showError('Sorry, No ablum or song has been found.');
      }
      document.querySelector('.results').style.display = 'flex';
      document.querySelector('.secondary').style.top = '0%';
      document.querySelector('.form-input').style.top = '0%';
      hideLoader();
    })
    .catch((error) => {
      hideLoader();
      console.log(error);
      showError('Sorry for internal error');
    });
}

function callLyrics(artist, title) {
  showLoader();
  hideErrorBlock();
  hidePaginationBlock();
  hideCopyButton();
  const lyricsTitle = document.querySelector('.lyrics-title');
  lyricsTitle.innerHTML = `<h2>${title} - <span>${artist}</span></h2>`;
  const lyricsText = document.querySelector('.lyrics-text');
  lyricsText.innerHTML = '';
  let url = `https://api.lyrics.ovh/v1/${artist}/${title}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.lyrics != '') {
        lyricsText.innerHTML = data.lyrics;
        lyricsText.style.display = 'block';
        showCopyButton();
      } else {
        lyricsText.style.display = 'none';
        showError('Sorry, No lyrics has been found.');
        showErrorBlockBetweenLyricsBlock();
      }
      showLyricBlock();
      hideLoader();
    })
    .catch((error) => {
      hideLoader();
      console.log(error);
      showError('Sorry for internal error');
    });
}
function showErrorBlockOutSideLyricsBlock() {
  const error = document.querySelector('.error');
  const results = document.querySelector('.results');
  results.insertBefore(error, results.children[0]);
}
function showErrorBlockBetweenLyricsBlock() {
  const error = document.querySelector('.error');
  const lyricBlock = document.querySelector('.lyricBlock');
  lyricBlock.insertBefore(error, lyricBlock.children[1]);
}
function showLoader() {
  document.querySelector('.loader').style.display = 'block';
}
function hideLoader() {
  document.querySelector('.loader').style.display = 'none';
}

function showError(str) {
  const notFoundText = document.querySelector('.not-found-text');
  notFoundText.innerHTML = '';
  if (str) {
    notFoundText.innerHTML = str;
  } else {
    notFoundText.innerHTML = 'No data found';
  }
  document.querySelector('.error').style.display = 'block';
}

function hideErrorBlock() {
  document.querySelector('.error').style.display = 'none';
}
function hideLyricBlock() {
  document.querySelector('.lyricBlock').style.display = 'none';
}
function showLyricBlock() {
  document.querySelector('.lyricBlock').style.display = 'block';
}
function showPaginationBlock() {
  document.querySelector('.pagination-block').style.display = 'block';
}
function hidePaginationBlock() {
  document.querySelector('.pagination-block').style.display = 'none';
}
function showCopyButton() {
  const copyButton = document.querySelector('#copy-button');
  copyButton.innerHTML =
    'Copy <i class="fa fa-files-o" aria-hidden="true"></i>';
  copyButton.classList.add('button--lyrics');
  copyButton.classList.add('button--inverted');
  copyButton.classList.remove('button-copied');
  copyButton.style.display = 'block';
}
function hideCopyButton() {
  document.querySelector('#copy-button').style.display = 'none';
}
function paginationBlock(data) {
  showPaginationBlock();
  const objJson = data;
  const prevButton = document.getElementById('button_prev');
  const nextButton = document.getElementById('button_next');
  let current_page = 1;
  let records_per_page = 5;
  this.init = function () {
    changePage(1);
    addEventListeners();
  };
  let addEventListeners = function () {
    prevButton.addEventListener('click', prevPage);
    nextButton.addEventListener('click', nextPage);
  };
  let checkButtonOpacity = function () {
    current_page == 1
      ? (prevButton.style.display = 'none')
      : (prevButton.style.display = 'block');
    current_page == numPages()
      ? (nextButton.style.display = 'none')
      : (nextButton.style.display = 'block');
  };
  let changePage = function (page) {
    const listingSuggestion = document.querySelector('ul');

    if (page < 1) {
      page = 1;
    }
    if (page > numPages() - 1) {
      page = numPages();
    }

    listingSuggestion.innerHTML = '';

    for (
      let i = (page - 1) * records_per_page;
      i < page * records_per_page && i < objJson.length;
      i++
    ) {
      let li = document.createElement('li');
      const lyric = objJson[i];
      li.innerHTML = `<label>${lyric.title} - <span>${lyric.artist.name}</span></label><button class="button button--lyrics button--border-medium button--text-thick" onclick="callLyrics('${lyric.artist.name}','${lyric.title}')"><span>show lyrics</span></button>`;
      listingSuggestion.appendChild(li);
    }
    checkButtonOpacity();
  };
  let prevPage = function () {
    if (current_page > 1) {
      current_page--;
      changePage(current_page);
    }
  };

  let nextPage = function () {
    if (current_page < numPages()) {
      current_page++;
      changePage(current_page);
    }
  };
  let numPages = function () {
    return Math.ceil(objJson.length / records_per_page);
  };
}
function copyLyrics(e) {
  e.preventDefault();
  const lyricsText = document.getElementById('lyrics-text');
  const copyButton = document.querySelector('#copy-button');
  if (document.selection) {
    let range = document.body.createTextRange();
    range.moveToElementText(lyricsText);
    range.select().createTextRange();
    document.execCommand('copy');
  } else if (window.getSelection) {
    let range = document.createRange();
    range.selectNode(lyricsText);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  }
  copyButton.innerHTML =
    'Copied! <i class="fa fa-files-o" aria-hidden="true"></i>';
  copyButton.classList.remove('button--lyrics');
  copyButton.classList.remove('button--inverted');
  copyButton.classList.add('button-copied');
}
