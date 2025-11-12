import * as basic from './hi.json';
import * as temples from './temples_hi.json';

const hi = {
    ...basic,
    ...temples
};

export default hi;