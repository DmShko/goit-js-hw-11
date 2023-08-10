import axios from 'axios';

const API_KEY = '38720308-d21e625f12f534dc84967836c';

export async function getDataFromApi(data, counter) {
    let url = `https://pixabay.com/api/?key=${API_KEY}&q=${data}&image_type=photo$orientation=horizontal&safesearch=true&page=1&per_page=40&page=${counter}`;
    return await axios.get(url).then(responce => {
        return responce;
    });
}