import Notiflix from "notiflix";
import { getDataFromApi } from "./apiQuery.js";
import SimpleLightbox from "/node_modules/simplelightbox/dist/simple-lightbox.esm";
import _ from "lodash";

// most elements link set
const elementsSet = {
    cardContainer: document.querySelector('.gallery'),
    formElement: document.querySelector('.search-form'), 
    inputForm: document.querySelector('[type="text"]'),
    buttonForm: document.querySelector('[type="submit"]'),
    galleryElement: document.querySelector('img'),
    inputData: "",
    checkData: "",
    pageCounter: 0,
    totalH: 0,
    quantityCard: 40,
    temporary: undefined,
    fillingLevel: function () { return Math.floor(this.totalH / this.quantityCard)},
    key: true,
    keyCreateInstance: false,
    simpleArray: {},
    scrollValue: 0,
};

function autoScroll(data) {
  // get first card on page and set her to top
   document.getElementById(data).scrollIntoView({
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
      // elementsSet.fillingLevel = Math.floor(elementsSet.totalH / elementsSet.quantityCard);
      
    }
    
    // add one itteration
    if(elementsSet.pageCounter === elementsSet.fillingLevel() + 1) {

      // temporery value for 63's row
      elementsSet.temporary = elementsSet.fillingLevel() + 1;
      elementsSet.quantityCard = elementsSet.totalH - elementsSet.quantityCard * elementsSet.fillingLevel();
      
    }

        // control, when total quantity loaded images >= "data.totalHits"
    if(elementsSet.pageCounter > elementsSet.temporary) {
  
      elementsSet.quantityCard = 40;
      // reset property and output notification
      checkData = 0;
      elementsSet.key = false;
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      elementsSet.simpleArray.instance.destroy();

    } 
  }
  
  // if the request data isn't repeate
  else {
    elementsSet.key = true;
    elementsSet.pageCounter = 1;
    elementsSet.checkData = data;
    elementsSet.scrollValue = 0;
    elementsSet.cardContainer.innerHTML = "";
  }

  return elementsSet.key;
}

async function request(data) {
  // "data.totalHits" control
  let viewKey = loadPagesControl(data);
// create lightbox

  //'viewKey' - dont't output content, if when total quantity loaded images >= "data.totalHits" 
  // and output content, if < "data.totalHits"
  if(viewKey && elementsSet.quantityCard !== 0) {
   
    await getDataFromApi(data, elementsSet.pageCounter, elementsSet.quantityCard).then(responce => {
      
      if(responce.data.hits.length !== 0) {

        if(elementsSet.pageCounter === 1) {

          elementsSet.totalH = responce.data.totalHits;
      
          Notiflix.Notify.info(`Hooray! We found ${responce.data.totalHits} images.`);

        }
  
        const markup = responce.data.hits.reduce((result, { webformatURL, largeImageURL, id, tags, likes, views, comments, downloads }) => {

            return result + `<div class="photo-card" id="hit${id}">
            <a class="gallery__link" href="${largeImageURL}">
              <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
              <div class="info-f>
                <h class="info-item">
                  <b>Likes</b>
                </h>
                <p>${likes}</p>
              </div>
              <div class="info-cell>
                <h class="info-item">
                  <b>Views</b>
                </h>
              <p>${views}</p>
              </div>
              <div class="info-cell>
                <h class="info-item">
                  <b>Comments</b>
                </h>
                <p>${comments}</p>
              </div>  
              <div class="info-cell>
                <h class="info-item">
                  <b>Downloads</b>
                </h>
                <p>${downloads}</p>
              </div>  
            </div>
          </div>`;
        }, ""); 
        
        elementsSet.cardContainer.insertAdjacentHTML('beforeend', markup);

        if(elementsSet.pageCounter > 1) {
          
          // elementsSet.keyCreateInstance = false;
          elementsSet.simpleArray.instance.destroy();
          // delete elementsSet.simpleArray.instance;
        }
    
        autoScroll(`hit${responce.data.hits[0].id}`);
        // elementsSet.keyCreateInstance = true;
       
        return;
      } 
    
      Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.");
    }).catch(error => {
      Notiflix.Notify.warning(error.message);
    });
  }

  // if(elementsSet.keyCreateInstance) {
    // create instance of SimpleLightbox
    const gallery = new SimpleLightbox(".gallery a", {   
      captionsData: "alt",
      captionDelay: 250,
    });

    elementsSet.simpleArray.instance = gallery;
    // console.log(elementsSet.simpleArray);
  // }

}

function eventForm(evt) {

  evt.preventDefault();
  
  // input event
  if(evt.target.getAttribute('type') === 'text'){
   
      elementsSet.inputData = evt.target.value;
   
  } 
  
  // button event
  if(evt.target.getAttribute('type') === 'submit'){
    // validation
    if(elementsSet.inputData !== "" && (!elementsSet.inputData.includes(" "))) {
     
      // elementsSet.inputForm.value = "";
      request(elementsSet.inputData);

    } else {

      Notiflix.Notify.warning("Input must be filled and don't have spaces!");

    }
        
  }
}

function eventScroll() {
  
    elementsSet.scrollValue = window.innerHeight + Math.round(window.scrollY);
    if ((elementsSet.scrollValue) >= document.body.offsetHeight) {
      request(elementsSet.inputData);
    }
  
}

elementsSet.inputForm.addEventListener('input', _.debounce(eventForm, 300, {'leading': true}));
elementsSet.buttonForm.addEventListener('click', _.throttle(eventForm, 300));
document.addEventListener("scroll",  _.debounce(eventScroll, 300));

elementsSet.buttonForm.addEventListener('mouseover', (e) =>{
  e.target.classList.toggle("changeBackBut");
  elementsSet.formElement.classList.toggle("changeBackForm");
});

elementsSet.buttonForm.addEventListener('mouseout', (e) =>{
  e.target.classList.toggle("changeBackBut");
  elementsSet.formElement.classList.toggle("changeBackForm");
});

elementsSet.buttonForm.addEventListener('mousedown', (e) =>{
  e.target.style.borderStyle = "ridge";
});

elementsSet.buttonForm.addEventListener('mouseup', (e) =>{
  e.target.style.borderStyle = "none";
});