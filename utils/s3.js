const AWS = require('aws-sdk');
// AWS.config.update({
//   region: 'us-east-2',
//   accessKeyId: 'AKIAWVLKDVO3OLMGA4UL',
//   secretAccessKey: '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'
// });


var bucket = new AWS.S3({})

exports.createFolder = async (folderName) => {
  return await new Promise((resolve, reject) => {
    bucket.upload({
      Bucket: "decarbon-dev",
      Key: 'merchant/' + folderName + '/',
      Body: '',
    }, null, function(err, data) {
      if(err) {
        resolve({
          success: false,
          error: err
        })
        console.log(err);
      } else {
        resolve({
          success: true,
          data: data
        })
      }
    })
  })
}

exports.createFile = async (fileName, fileContent, folderName, public = true) => {
  return await new Promise((resolve, reject) => {
    bucket.upload({
      Bucket: "decarbon-dev",
      Key: 'merchant/' + folderName + '/' + fileName,
      Body: fileContent,
      ACL: public ?'public-read' :'',
    }, null, function(err, data) {
      if(err) {
        resolve({
          success: false,
          error: err
        })
      } else {
        resolve({
          success: true,
          data: data
        })
      }
    })
  })
}

exports.createUserFile = async (fileName, fileContent, public = true) => {
  return await new Promise((resolve, reject) => {
    bucket.upload({
      Bucket: "decarbon-dev",
      Key: 'user/' + fileName,
      Body: fileContent,
      ACL: public ?'public-read' :'',
    }, null, function(err, data) {
      if(err) {
        resolve({
          success: false,
          error: err
        })
      } else {
        resolve({
          success: true,
          data: data
        })
      }
    })
  })
}

exports.deleteFile = async (fileName, folderName) => {
  return await new Promise((resolve, reject) => {
    bucket.deleteObject({
      Bucket: "decarbon-dev",
      Key: 'merchant/' + folderName + '/' + fileName
    }, function(err, data) {
      if(err) {
        resolve({
          success: false,
          error: err
        })
      } else {
        resolve({
          success: true,
          data: data
        })
      }
    })
  })
}
