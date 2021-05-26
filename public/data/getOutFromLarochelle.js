// a little script helping to export custom csv from navigo's pointcall csv outputs

const fs = require('fs-extra');
const dsv = require('d3-dsv');

const pointcalls = dsv.csvParse(fs.readFileSync('./navigo_pointcalls_sprint.csv', 'utf-8'));

const ACCEPTED_ADMIRALTIES = ['Marennes', 'Sables-d’Olonne', 'La Rochelle'];

const directionsFromRegion = pointcalls.filter(p => {
  if (ACCEPTED_ADMIRALTIES.includes(p['homeport_admiralty']) && p.pointcall_action === 'In') {
    return true;
  }
  return false;
})

fs.writeFileSync('./navigo-out-of-ships-from-region.csv', dsv.csvFormat(directionsFromRegion), 'utf-8')