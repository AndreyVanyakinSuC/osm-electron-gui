import React, {Component} from 'react';

const { clipboard } = require('electron')
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy} from '@fortawesome/free-solid-svg-icons'


class CopyCoordinatesBtn extends Component {


    state = {
        isAnimating: false
    }

    handleCopyClick(coordinates) {
        clipboard.writeText(coordinates.join(', '))
        this.setState( {isAnimating: true} )
    }

    render() {
        
        const classes = this.state.isAnimating ? 'icon animate' : 'icon'

        return (
                <span 
                    className={classes} 
                    onClick={this.handleCopyClick.bind(this, this.props.coordinates)}
                    onAnimationEnd={() => this.setState({isAnimating: false})}
                    title='Скопировать координаты в буфер обмена'
                    role='button'>
                    <FontAwesomeIcon icon={faCopy} />
                </span>
        );
    }

}

 
export default CopyCoordinatesBtn;