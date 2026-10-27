const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const submissionDir = path.join(uploadDir, 'submissions', String(req.params.formUuid || req.params.formId || 'misc'));
    fs.mkdirSync(submissionDir, { recursive: true });
    cb(null, submissionDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);

function fileFilter(req, file, cb) {
  if (allowedTypes.length === 0 || allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024 },
});

module.exports = upload;
