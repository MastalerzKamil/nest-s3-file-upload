## Description

This application is a local client in `Nest.JS` that communicate with 
an S3 server and sends there binary files using Node.js 
streams. The implementation is based on the [Node.js streams](https://nodejs.org/api/stream.html).
The client that has been implemented takes `fileName` parameter
from HTTP query that is located in directory defined in `.env` file.
The client will send the file to the server and the server will 
save it in the S3 bucket. Due to requirement I couldn't use `multipart/form-data` 
and load image into memory so the idea that came to my mind was using streams from 
files in the disk instead of loading them into memory.

## Other memory optimised solutions

- I could use buffer in memory and then send it to the server. According to the [GitHub Gist](https://gist.github.com/jonilsonds9/efc228e34a298fa461d378f48ef67836)
that I found it is possible but I didn't use it because it is not efficient in terms of testing.
- Another solution to send bigger files is related to S3 Transfer Acceleration however it's more
advanced solution and require more time and costs
- AWS lambda that trigger upload files to S3 using streams is possible to upload in fly according to 
[AWS Best Best Pracices](https://aws.amazon.com/blogs/compute/resize-images-on-the-fly-with-amazon-s3-aws-lambda-and-amazon-api-gateway/).
The provided idea is only about handling only images but Step Functions would solve the problem. 


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

