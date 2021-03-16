import React, { Component, Fragment } from 'react';
import { IMAGE_PATHS } from '../../../../APInHelpers/base';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
// import twr1 from '../../../../assets/twr1.png';
// import twr2 from '../../../../assets/twr2.png';
// import twr3 from '../../../../assets/twr3.png';
// import twr4 from '../../../../assets/twr4.png';

class TowerGallery extends Component {
  state = {
    photoIndex: 0,
    isOpen: false
  };

  handleThumbnailClick(index) {
    this.setState({ photoIndex: index });

    this.setState(prevState => {
      if (!prevState.isOpen) {
        return { isOpen: true };
      } else {
        return null;
      }
    });
  }

  render() {
    const { photoIndex, isOpen } = this.state;
    // const { images } = this.props;

    const { isExpanded, towerID } = this.props;

    const imagePaths = IMAGE_PATHS.has(towerID)
      ? IMAGE_PATHS.get(towerID)
      : IMAGE_PATHS.get('default');
    const classes = isExpanded ? 'details-gallery' : 'details-gallery hidden';
    const images = imagePaths.map((path, i) => (
      <div
        key={i}
        className="thumbnail"
        onClick={this.handleThumbnailClick.bind(this, i)}
        style={{
          background: `url('${path}')`,
          backgroundSize: 'cover'
        }}
      ></div>
    ));

    let lightbox;

    if (isOpen) {
      lightbox = (
        <Lightbox
          mainSrc={imagePaths[photoIndex]}
          nextSrc={imagePaths[(photoIndex + 1) % images.length]}
          prevSrc={
            imagePaths[(photoIndex + imagePaths.length - 1) % imagePaths.length]
          }
          onCloseRequest={() => this.setState({ isOpen: false })}
          onMovePrevRequest={() =>
            this.setState({
              photoIndex:
                (photoIndex + imagePaths.length - 1) % imagePaths.length
            })
          }
          onMoveNextRequest={() =>
            this.setState({
              photoIndex: (photoIndex + 1) % imagePaths.length
            })
          }
        />
      );
    } else {
      lightbox = null;
    }

    return (
      <Fragment>
        <div className={classes}>{images}</div>

        {lightbox}
      </Fragment>
    );
  }
}

export default TowerGallery;
