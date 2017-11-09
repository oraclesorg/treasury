let big = require('./util/bigNum.js').big;

const ETHER = big(10**18);
const DECIMALS = big(18);
const TOTAL_SUPPLY_ITEMS = big(252460800)

module.exports = {
    DECIMALS,
    TOTAL_SUPPLY_ITEMS,
    ETHER,
}
