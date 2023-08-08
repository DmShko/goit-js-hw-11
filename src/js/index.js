import { getDataFromApi } from "./apiQuery.js";

const elementsSet = {
    cardContainer: document.querySelector('.gallery'),
    formElement: document.querySelector('.search-form'), 
    inputForm: document.querySelector('[type="text"]'),
    buttonForm: document.querySelector('[type="submit"]'),
};

getDataFromApi("cat").then(responce => {
    console.log(responce.data.hits);
    const markup = responce.data.hits.reduce((result, { webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return result + `<div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>${likes}</b>
          </p>
          <p class="info-item">
            <b>${views}</b>
          </p>
          <p class="info-item">
            <b>${comments}</b>
          </p>
          <p class="info-item">
            <b>${downloads}</b>
          </p>
        </div>
      </div>`;
    }, ""); 
    elementsSet.cardContainer.insertAdjacentHTML('beforeend', markup);
});

