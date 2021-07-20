const { exec } = require('child_process');
const puppeteer = require('puppeteer'); 
const visualizationsList = require('./src/visualizationsList.json')
let signal = null;


// const langs = ['fr', 'en'];
// just french for now
const langs = ['fr'];
const Screenshot = async () => { 

  console.log('starting screenshotting')

  const browser = await puppeteer.launch({ headless: false }); 

  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 800,
    deviceScaleFactor: 1,
  });
  await page.waitForTimeout(1000);

  for (const i in langs) {
    const lang = langs[i];
    const PATH_BASE = `./public/thumbnails/${lang}`;
    for (const j in visualizationsList) {
      const vis = visualizationsList[j];
      const url = `http://localhost:3000/${lang}/visualization/${vis.id}`;
      const path = `${PATH_BASE}/${vis.id}.png`;
      console.log('snapshoting ', url);
      console.log('saving it to', path);
      await page.goto(url, {
        waitUntil: 'networkidle2',
      });
      if (i === 0 && j === 0) {
        await page.waitForTimeout(4000);
      }
      await page.waitForTimeout(4000);
      await page.screenshot({ 
        path,
        fullPage: true
      });
      await page.waitForTimeout(1500);
      // doing it twice
      await page.screenshot({ 
        path,
        fullPage: true
      });
      await page.waitForTimeout(1000);
    }
    
  }
  await page.close();
  await browser.close();
  console.log('done')
}

// signal = exec('yarn start', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`error: ${error.message}`);
//     return;
//   }

//   if (stderr) {
//     console.error(`stderr: ${stderr}`);
//     return;
//   }

//   console.log(`stdout:\n${stdout}`);
//   const port = stdout.match(/Something is already running on port (\d+)/);
//   console.log('port', port);

//   console.log('screenshotting');
  
// });

Screenshot()
  // .then(() => {
    // console.log('will kill');
    // process.kill(-signal.pid);
  // })