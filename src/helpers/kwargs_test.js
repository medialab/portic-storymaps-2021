import { getToflitFlowsByCsv } from './misc.js';

getToflitFlowsByCsv({
    year:1789,
    customs_region:"La Rochelle"
})
.then(console.log)
.catch(console.log)