const express = require('express');

const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const iconGen = require('icon-gen');
const fs = require('fs-extra');
const archiver = require('archiver');
const uniqid = require('uniqid');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const htmlBeautify = require('js-beautify').html;

const { window } = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

app.use(express.static(`${__dirname}/public`));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: 'true',
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
  type: 'application/vnd.api+json',
}));
app.use(methodOverride());

const port = process.env.PORT || 8080;

app.get('/api/download/:dir', (req, res) => {
  const tempDir = `tmp/${req.params.dir}`;
  res.download(`${tempDir}/icons.zip`);

  fs.remove(tempDir, () => {});
});

app.post('/api/convert', (req, res) => {
  const svgData = htmlBeautify(DOMPurify.sanitize(req.body.image), { indent_size: 2 });
  const tmpName = uniqid();
  const dir = `./tmp/${tmpName}`;
  const dist = `${dir}/dist`;

  console.log('Converting SVG:');
  console.log(svgData);

  fs.ensureDir(dist, (ensureDirErr) => {
    if (ensureDirErr) {
      console.log(ensureDirErr);
    }

    fs.writeFile(`${dist}/image.svg`, svgData, (writeFileErr) => {
      if (writeFileErr) {
        return console.log('Error while saving SVG:', writeFileErr);
      }

      console.log('SVG successfully saved');

      const options = {
        report: true,
      };

      return iconGen(`${dist}/image.svg`, dist, options)
        .then(() => {
          const zipFile = fs.createWriteStream(`${dir}/icons.zip`);
          const archive = archiver('zip');
          archive.pipe(zipFile);
          archive.directory(dist, false);

          archive.on('error', (archiveErr) => {
            console.log('Error while zipping folder:', archiveErr);
            res.send('error');
          });

          zipFile.on('close', () => {
            console.log('Zip successfully created');
            res.send(tmpName);
          });

          archive.finalize();
        })
        .catch((iconGenErr) => {
          console.error('Error while generating icons:', iconGenErr);
          res.send('error');
        });
    });
  });
});

app.get('*', (req, res) => {
  res.sendfile('./public/index.html');
});

app.listen(port);
console.log(`app listening on ${port}`);
