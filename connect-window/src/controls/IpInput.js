import React from 'react';
import MaskedInput  from 'react-text-mask';

const ipMask = [/[0-2]?/, /[0-9]/, /[0-9]/, '.', /[1-2]/, /[0-9]/, /[0-9]/, '.', /[1-2]/, /[0-9]/, /[0-9]/, '.', /[1-2]/, /[0-9]/, /[0-9]/]

const IpInput = ({value, changed}) => {
    return (
        <span id='ip'>

            <MaskedInput 
                placeholder='255.255.255.255'
                value={value}
                guide
                mask={ipMask}
                pipe={value => {
                    const subips = value.split('.')
                    const invalidSubips = subips.filter(ip => {
                      ip = parseInt(ip) 
                      return ip < 0 || ip > 255
                    })
                    return invalidSubips.length > 0 ? false : value
                }}
                placeholderChar={'\u2000'}
                onChange={changed}
                />
        </span>
    );
}
 
export default IpInput;