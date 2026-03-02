import multer from 'multer'
import path from 'path'

export default multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') {
      return cb(new Error('Only CSVs are allowed'));
    }
    cb(null, true);
  }
});