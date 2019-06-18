import React, {Component, Fragment} from 'react';
import { Popup } from 'react-leaflet';
import TowerGallery from './TowerGallery';
import { geo_towerRanges, geo_pickRange, geo_adjacentTowerObject } from '../../../../APInHelpers/map';
import Ribbon from '../../../Ribbon';
import { ENTITY_NAMES } from '../../../../APInHelpers/base';
import { pickWorstMessage} from '../../../../APInHelpers/notification';
import { ExpandToggle} from '../../../../APInHelpers/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faCaretLeft, faCaretRight, faEye, faExclamationCircle, faSnowflake, faQuestion, faExclamation, faCheckCircle} from '@fortawesome/free-solid-svg-icons'

class TowerSensorsPopup extends Component {

    state = {
        isDetailsExpanded: true
    }


    handleToggleClick() {
        this.setState((prevState) => {
            return { isDetailsExpanded: !prevState.isDetailsExpanded  };
        });
    }

    render() {
        // const FRESH_EMU = {
        //     "4010": {msg: []},
        //     "4011": {msg: []},
        //     "4013": {msg: []},
        //     "4014": {msg: []}
        // }
    
        const {towerID, schema, fresh } = this.props;

        // const { Name, number, coordinates} = schema.towers[towerID];
    
        // From range is the one having peer towerID less than out towerID
        // towards range is the one having peer towerID less than out towerID
        const focusTower = schema.towers[towerID];
        const adjacentRanges = geo_towerRanges(schema, towerID);
        const adjRangesCount = (_.keys(adjacentRanges)).length;
    
    
        //
        // MARKUP SHIT
        //
    
        let markup_towerNums, markup_status;
    
        const markup_towerNum = (towerObject, position='' ) => {
            
            const {number, Name} = towerObject;
            const style = `tower-number ${position}`
            const nameField = position === '' ? Name : null;
    
            return <div className={style}>
                        <span className='unit'>№ </span>
                        <span>{number}</span>
                        <div className='unit'>{nameField}</div>
                    </div>
        }
    
    
        const markup_statusPane = (rangeObject, position, fresh) => {
    
            let classes = `status-pane ${position}`
    
            // 1) Which objects correspond to this range ?
            // console.log(rangeObject);
            const rangeFresh = _.pick(fresh, rangeObject.obj);
            // console.log(rangeFresh);
            const sortedObjs = _.sortBy(_.keys(rangeFresh), id => schema.obj[id].Type);
            // console.log(sortedObjs);
           
            return <div className={classes}>
                    
                {sortedObjs.map(id => {
    
                    // console.log(id, rangeFresh[id]);
                    const {I, msg} = rangeFresh[id];
                    const msgCode = pickWorstMessage(msg);
                    const entityName = ENTITY_NAMES.get(schema.obj[id].Type);



                    if (position ==='from') {
                        return (
                            <Fragment>
                                <span className='status'><Ribbon value={I} msgCode={msgCode}/></span>
                                <span className={position}>{entityName}</span>
                            </Fragment>)
                    } else if (position === 'towards') {
                        return (
                            <Fragment>
                                <span className={position}>{entityName}</span>
                                <span className='status'><Ribbon value={I} msgCode={msgCode}/></span>
                            </Fragment>)
                    } else {
                        console.error('Position is neither _from_ nor _towards_');
                    }
    
                })}
    
            </div>
    
    
        }
    
   


        if (adjRangesCount === 2) {
    
            const fromRange = geo_pickRange(adjacentRanges, towerID, 'from');
            const towardsRange = geo_pickRange(adjacentRanges, towerID, 'towards');
        
            const fromTower = geo_adjacentTowerObject(fromRange, towerID, schema);
            const towardsTower = geo_adjacentTowerObject(towardsRange, towerID, schema);
    
    
            markup_towerNums =  <div className='tower-nums'>
                {markup_towerNum(fromTower, 'from') }
                <FontAwesomeIcon icon={faCaretLeft}/>
                {markup_towerNum(focusTower) }
                <FontAwesomeIcon icon={faCaretRight}/>
                {markup_towerNum(towardsTower, 'towards') }
            </div>
    
            markup_status = <div className='tower-status'>
    
                {markup_statusPane(fromRange, 'from', fresh)}
    
                {markup_statusPane(towardsRange, 'towards', fresh)}
            
            </div>
    
    
        } else if (adjRangesCount === 1) {
    
            //FIXME:
    
        } else if (adjRangesCount > 2) {
            console.error('More than two adjacentranges');
        } else {
            console.error('Zero adjacent ranges');
        }
    
       
    
        
        return (<Popup className='tower-popup'>
                  
            {markup_towerNums}
    
            <div className='tower-details'>
                
                <div className='details-expand-toggler' 
                    onClick={this.handleToggleClick.bind(this)}>
                    <ExpandToggle 
                        isExpanded={this.state.isDetailsExpanded}/>
                </div>

                <TowerGallery 
                    isExpanded={this.state.isDetailsExpanded}
                    towerID = {towerID}/>
                
            </div>
    
            {markup_status}
    
      
        </Popup>);
    }
}

 
export default TowerSensorsPopup;