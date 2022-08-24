## Description

This application is a local client in Nest.JS that communicate with 
an S3 server and sends there binary files using Node.js 
streams. The implementation is based on the [Node.js streams](https://nodejs.org/api/stream.html).
The client that has been implemented takes `fileName` parameter
from HTTP query that is located in directory defined in `.env` file.
The client will send the file to the server and the server will 
save it in the S3 bucket. Due to requirement I couldn't use `multipart/form-data` 
and load image into memory so the idea that came to my mind was using streams from 
files in the disk instead of loading them into memory. 


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

