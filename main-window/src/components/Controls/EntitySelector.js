import React from 'react';
import { ENTITY_NAMES } from '../../APInHelpers/base';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare, faCheckSquare, faCheck } from '@fortawesome/free-solid-svg-icons' 

import _ from 'lodash';

const EntitySelector = ({possibleEntities, availableEntities, scopedEntities, changed}) => {
    
    // possbile
    // [A, B, C, ОКГТ]

    // scoped
    // [A] or [B, ОКГТ]



    return (  
        <div className={"btn-group entity-selector"}>

            {possibleEntities.map(o => {
                
                const isEntityAvailable = _.intersection(possibleEntities,availableEntities).length > 0;
                const isEntitySelected = scopedEntities.includes(o);

                let clickHandler, icon, itemClass;

                if (isEntityAvailable) {
                    itemClass = 'item'; 
                    clickHandler = changed.bind(null, o);
                } else {
                    icon = null;
                    clickHandler = null;
                    itemClass = 'item disabled';
                }

                if (isEntitySelected) {
                    icon = <FontAwesomeIcon icon={faCheckSquare} />;
                    itemClass = 'item active'
                } else {
                    icon = <FontAwesomeIcon icon={faSquare} />;
                }


                // // const clickHandler = isAvailable(possibleEntities, availableEntities) ? changed.bind(null, o) : null;
                // const itemClass = combineClasses(
                //     isAvailable(possibleEntities, availableEntities),
                //     isSelected(scopedEntities, o)
                // )
                

                return (
                
                <span key={o}
                    onClick={ clickHandler }
                    className={ itemClass }>

                    <input type="checkbox" id={o} value={o}/>

                    <span>
                       {icon}
                    </span>
                    
                    <label> {ENTITY_NAMES.get(o)} </label>

                </span>)
            })}

        </div>
    );
}
 
export default EntitySelector;