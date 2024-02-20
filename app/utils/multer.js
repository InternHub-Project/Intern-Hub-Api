const multer  = require('multer');
const { sendResponse } = require('./util.service.js');
const { RESPONSE_BAD_REQUEST } = require('./constants.js');

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif","image/bmp","image/svg","image/tiff"];
const fileMimeTypes = ["application/pdf", "application/msword", "text/plain"];


   const HME = (err, req, res, next) => {
    if (err) {
      sendResponse(res,RESPONSE_BAD_REQUEST,"Multer error",{},err)
    } else {
      next();
    }
  };


  function myMullter(){
    const storage = multer.diskStorage({});
    function fileFilter(req, file, cb) {
        // Check if the file is an image
        if (imageMimeTypes.includes(file.mimetype)) {
          cb(null, true); // Accept the file
        } else if (fileMimeTypes.includes(file.mimetype)) {
          cb(null, true); // Accept the file
        } else {
          cb("Invalid file format. Only images and PDF files are allowed.", false);
        }
      }
      const upload = multer({ 
        storage: storage,
        fileFilter: fileFilter,
      });
      return upload
}



module.exports={
    myMullter,
    HME
}