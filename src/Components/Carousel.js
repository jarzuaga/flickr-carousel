import React, { Component } from 'react';
import { css } from 'emotion';
import debounce from 'lodash.debounce';
import get from 'lodash.get';
import FlickrServices from '../services/flickr-services';

const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80%;
  margin: 0 auto;
`;

const carouselContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const spinnerContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 566px;
`;

const searchField = css`
  width: 20rem;
`;

const trackContainer = css`
  width: 64rem;
  overflow: hidden;
  background-color: #8e44ad;
`;

const innerTrack = css`
  display: flex;
  min-height: 200px;
  min-width: 100vw;
  transition: transform 0.5s ease-in;
`;

const photoItem = css`
  min-width: 15rem;
  margin: 0.5rem;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: cover;
  outline: none;
`;

export default class Carousel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchingPhotos: false,
      searchTerm: '',
      photos: [],
      selectedPhoto: null,
      keyPressed: null,
    };

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handlePhotoClick = this.handlePhotoClick.bind(this);
    this.debouncedSearchPhotos = debounce(this.searchPhotos, 750, { trailing: true });
  }

  handleSearchChange(e) {
    const searchTerm = e.target.value;
    const parsedSearchTerm = searchTerm.trim();
    const pressedKeyIsBackspace = this.state.keyPressed === 'Backspace';

    this.setState({ searchTerm }, () => {
      if (!parsedSearchTerm || parsedSearchTerm.length < 2 || pressedKeyIsBackspace) {
        return;
      }

      this.debouncedSearchPhotos(parsedSearchTerm);
    });
  }

  handleKeyPress(e) {
    this.setState({ keyPressed: e.key });
  }

  handlePhotoClick(e) {
    this.setState({ selectedPhoto: Number(e.target.dataset.index) });
  }

  async searchPhotos(searchTerm) {
    this.setState({ searchingPhotos: true });
    let results = [];

    try {
      const { body = {} } = await FlickrServices.searchPhotos(searchTerm);
      const rawPhotos = get(body, 'photos.photo', []);
      const photoSizesReq = rawPhotos.map(rawPhoto => FlickrServices.getSizes(rawPhoto.id));
      const photoSizes = await Promise.all(photoSizesReq);

      results = photoSizes.map((photoSize) => {
        const { body: photoBody = {} } = photoSize;
        const { sizes: { size = [] } } = photoBody;
        // From seeing the flickr API results, the last element of the size array is always
        // the original photo size.
        const selectedSize = size[size.length - 1];

        return selectedSize.source;
      });
    } catch (error) {
      console.log(`error fetching photos: ${error}`);
    } finally {
      this.buildCarouselData(results);
    }
  }

  buildCarouselData(results) {
    let trackPosition = 24; // Positions first picture in the middle of the track.

    const photos = results.reduce((acc, src, index) => {
      acc[index] = {
        src,
        trackPosition,
        index,
      };
      trackPosition -= 16;

      return acc;
    }, {});

    this.setState({ photos, searchingPhotos: false, selectedPhoto: 0 });
  }

  renderSpinner() {
    return (
      <div className={spinnerContainer}>
        <div className="preloader-wrapper small active">
          <div className="spinner-layer spinner-blue-only">
            <div className="circle-clipper left">
              <div className="circle" />
            </div>
            <div className="gap-patch">
              <div className="circle" />
            </div>
            <div className="circle-clipper right">
              <div className="circle" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderSearchInput() {
    return (
      <div className={searchField}>
        <input
          placeholder="Search photos..."
          value={this.state.searchTerm}
          onChange={this.handleSearchChange}
          onKeyDown={this.handleKeyPress}
        />
      </div>
    );
  }

  renderPhotoItem(photo) {
    const photoClass = css`
      ${photoItem};
      background-image: url('${photo.src}');
      border: ${this.state.selectedPhoto === photo.index ? '2px solid orange' : 'none'};
    `;

    return (
      <button
        type="button"
        data-index={photo.index}
        onClick={this.handlePhotoClick}
        className={photoClass}
      />
    );
  }

  renderTrack() {
    const selectedPhoto = this.state.photos[this.state.selectedPhoto] || {};
    const innerTrackClasses = css`
      ${innerTrack};
      transform: translateX(${selectedPhoto.trackPosition}rem);
    `;
    const photos = Object.values(this.state.photos);

    return (
      <div className={trackContainer}>
        <div className={innerTrackClasses}>
          {photos.map(photo => this.renderPhotoItem(photo))}
        </div>
      </div>
    );
  }

  renderMainPhoto() {
    const selectedPhoto = this.state.photos[this.state.selectedPhoto] || {};
    const mainPhoto = css`
      ${photoItem};
      width: 90%;
      height: 350px;
      margin: 0;
      background-image: url('${selectedPhoto.src}');
    `;

    return (
      <div className={mainPhoto} />
    );
  }

  renderCarousel() {
    return (
      <div className={carouselContainer}>
        {this.renderMainPhoto()}
        {this.renderTrack()}
      </div>
    );
  }

  render() {
    return (
      <div className={container}>
        {this.renderSearchInput()}

        {
          this.state.searchingPhotos ?
            this.renderSpinner() :
            this.renderCarousel()
        }
      </div>
    );
  }
}
