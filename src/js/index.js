import Notiflix from "notiflix";
import { getDataFromApi } from "./apiQuery.js";
import SimpleLightbox from "/node_modules/simplelightbox/dist/simple-lightbox.min.js";
import _ from "lodash";


const elementsSet = {
    cardContainer: document.querySelector('.gallery'),
    formElement: document.querySelector('.search-form'), 
    inputForm: document.querySelector('[type="text"]'),
    buttonForm: document.querySelector('[type="submit"]'),
    galleryElement: document.querySelector('img'),
    inputData: "",
};

function request(data) {

  getDataFromApi(data).then(responce => {
   
    if(responce.data.hits.length !== 0) {
    
      Notiflix.Notify.info(`Hooray! We found ${responce.data.totalHits} images.`);

      const markup = responce.data.hits.reduce((result, { webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {

          return result + `<div class="photo-card">
          <a class="gallery__link" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
          <div class="info">
            <div class="info-cell>
              <t class="info-item">
                <b>Likes</b>
              </t>
              <p>${likes}</p>
            </div>
            <div class="info-cell>
              <t class="info-item">
                <b>Views</b>
              </t>
            <p>${views}</p>
            </div>
            <div class="info-cell>
              <t class="info-item">
                <b>Comments</b>
              </t>
              <p>${comments}</p>
            </div>  
            <div class="info-cell>
              <t class="info-item">
                <b>Downloads</b>
              </t>
              <p>${downloads}</p>
            </div>  
          </div>
        </div>`;
      }, ""); 
      elementsSet.cardContainer.insertAdjacentHTML('beforeend', markup);

      // create lightbox
      const gallery = new SimpleLightbox(".gallery a", {   
        captionsData: "alt",
        captionDelay: 250,
      });

      return;
    } 

    elementsSet.cardContainer.innerHTML = "";
    Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
  }).catch(() => {
    Notiflix.Notify.warning(error);
  });
}

function eventForm(evt) {

  if(evt.target.getAttribute('type') === 'text'){
    elementsSet.inputData = evt.target.value;
  }
  
  if(evt.target.getAttribute('type') === 'submit'){
    evt.preventDefault();
    elementsSet.inputForm.value = "";
    request(elementsSet.inputData);
  }
  
}

elementsSet.inputForm.addEventListener('input', _.debounce(eventForm, 500));
elementsSet.buttonForm.addEventListener('click', eventForm);