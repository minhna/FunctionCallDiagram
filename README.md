# Function call diagram

## How to run

### Install some required libraries

- `npm install`
- `sudo npm install -g ts-node`

Then you need to create/modify your `settings.json`. You can copy it from `settings-sample.json` file.

### run program

- `npm run scan SOURCE_CODE_DIRECTORY`: scan function declarations
- `npm run reset SOURCE_CODE_DIRECTORY`: reset database collection
- `npm run scan-usages SOURCE_CODE_DIRECTORY`: scan function usages

You can modify some program's params likes debug info, e.g:
`npm run scan -- --debug=run:* ./samples`
