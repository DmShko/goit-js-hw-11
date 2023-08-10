import Notiflix from "notiflix";
import { getDataFromApi } from "./apiQuery.js";
import SimpleLightbox from "/node_modules/simplelightbox/dist/simple-lightbox.esm";
import _ from "lodash";

const elementsSet = {
    cardContainer: document.querySelector('.gallery'),
    formElement: document.querySelector('.search-form'), 
    inputForm: document.querySelector('[type="text"]'),
    buttonForm: document.querySelector('[type="submit"]'),
    galleryElement: document.querySelector('img'),
    inputData: "",
    checkData: "",
    pageCounter: 1,
    totalH: 0,
    fillingLevel: 0,
    key: true,
};

function autoScroll(data) {

  document.querySelector(data).scrollIntoView({
    block: "start",
    behavior: "smooth",
  });

}

// "data.totalHits" control
function loadPagesControl(data) {

  //if the request data is repeate
  if(elementsSet.checkData === data) {

    // "elementsSet.key" - open/close access to calc loaded pages. When total quantity loaded images >= "data.totalHits",
    // "elementsSet.fillingLevel" will not accumulate further and cause an error.
    if(elementsSet.key) { 

      // counter loaded pages
      elementsSet.pageCounter += 1;
      // total quantity loaded images (40 images on page)
      elementsSet.fillingLevel = 40 * elementsSet.pageCounter;

    }
    // control, when total quantity loaded images >= "data.totalHits"
    if(elementsSet.fillingLevel >= elementsSet.totalH) {

      // reset property and output notification
      checkData = 0;
      elementsSet.key = false;
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

    } 
  }
  // if the request data isn't repeate
  else {
    elementsSet.key = true;
    elementsSet.pageCounter = 1;
    elementsSet.checkData = data;
  }

  return elementsSet.key;
}

function request(data) {

  // "data.totalHits" control
  let viewKey = loadPagesControl(data);

  if(viewKey) {
    getDataFromApi(data, elementsSet.pageCounter).then(responce => {

      if(responce.data.hits.length !== 0) {

        if(elementsSet.pageCounter === 1) {

          elementsSet.totalH = responce.data.totalHits;
      
          Notiflix.Notify.info(`Hooray! We found ${responce.data.totalHits} images.`);

        }
        
        const markup = responce.data.hits.reduce((result, { webformatURL, largeImageURL, id, tags, likes, views, comments, downloads }) => {

            return result + `<div class="photo-card" id="hit-${id}">
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
     
        autoScroll(`"#hit-${responce.data.hits[0].id}"`);

        return;
      } 

      elementsSet.cardContainer.innerHTML = "";
      Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
    }).catch(() => {
      Notiflix.Notify.warning(error);
    });
  }
}


function eventForm(evt) {

  if(evt.target.getAttribute('type') === 'text'){
    elementsSet.inputData = evt.target.value;
  }
  
  if(evt.target.getAttribute('type') === 'submit'){
    evt.preventDefault();
    // elementsSet.inputForm.value = "";
    request(elementsSet.inputData);
  }
  
}

elementsSet.inputForm.addEventListener('input', _.debounce(eventForm, 500));
elementsSet.buttonForm.addEventListener('click', eventForm);