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
      carousel: {},
      carouselLength: 0,
      selectedPhoto: null,
      keyPressed: null,
      reset: false,
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

    this.setState({ searchTerm }, async () => {
      if (!parsedSearchTerm || parsedSearchTerm.length < 2 || pressedKeyIsBackspace) {
        return;
      }

      await this.debouncedSearchPhotos(parsedSearchTerm);
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

  buildCarouselData(photos) {
    const [_, ...allButFirst] = photos;
    const allButLast = photos.slice(0, photos.length - 1);
    let trackPosition = 24;

    const firstSection = allButFirst.map((src, index) => {
      const photo = {
        src,
        index: (allButFirst.length - index) * -1,
        trackPosition,
      };

      trackPosition -= 16;

      return photo;
    });

    const secondSection = photos.map((src, index) => {
      const photo = {
        src,
        index,
        trackPosition,
      };

      trackPosition -= 16;

      return photo;
    });

    const thirdSection = allButLast.map((src, index) => {
      const photo = {
        src,
        index: photos.length + index,
        trackPosition,
      };

      trackPosition -= 16;

      return photo;
    });

    const carousel = [...firstSection, ...secondSection, ...thirdSection].reduce((acc, photo) => {
      acc[photo.index] = photo;

      return acc;
    }, {});

    this.setState({ carousel, searchingPhotos: false, selectedPhoto: 0, carouselLength: photos.length });
  }

  renderSpinner() {
    return (
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
      border: ${this.state.selectedPhoto === photo.index ? '2px solid orange' : 'none'};
    `;

    return (
      <div
        type="button"
        data-index={photo.index}
        onClick={this.handlePhotoClick}
        className={photoClass}
      >
        {photo.index}
      </div>
    );
  }

  renderTrack() {
    const selectedPhoto = this.state.carousel[this.state.selectedPhoto] || {};
    const innerTrackClasses = css`
      ${innerTrack};
      transform: translateX(${selectedPhoto.trackPosition}rem);
    `;
    const orderedCarousel = Object.values(this.state.carousel).sort((a, b) => a.index - b.index);

    return (
      <div className={trackContainer}>
        <div className={innerTrackClasses}>
          {orderedCarousel.map(photo => this.renderPhotoItem(photo))}
        </div>
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
            this.renderTrack()
        }
      </div>
    );
  }
}
