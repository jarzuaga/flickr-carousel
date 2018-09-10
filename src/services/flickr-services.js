import Flickr from 'flickr-sdk';

// For a real app, this key would not be commited to git, and would be better kept
// in an ENV variable.
const apiKey = 'b5fdb4308429a37234e8a1139bec5024';
const flickr = new Flickr(apiKey);

const flickrServices = {
  searchPhotos: (searchTerm) => {
    console.log('calling search service with: ', searchTerm);
    const options = {
      text: searchTerm,
      per_page: 15, // Only want to show the first 15 photos in the carousel for this demo
    };

    return flickr.photos.search(options);
  },

  getSizes: (photoId) => {
    const options = {
      photo_id: photoId,
    };

    return flickr.photos.getSizes(options);
  },
};

export default flickrServices;
