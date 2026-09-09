const multer = require('multer');
const path = require('path');
const fs = require('fs');

// UID y GID de usuario 'gea'
const UID_GEA = 1001; // Reemplaza por el UID real de gea
const GID_GEA = 1003; // Reemplaza por el GID real de gea

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/html/Sistemas/INTRANET_GEA/ComunicacionInterna/Personal/FILES');
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    const fullPath = path.join('/var/www/html/Sistemas/INTRANET_GEA/ComunicacionInterna/Personal/FILES', filename);
    cb(null, filename);

    // Espera a que el archivo se guarde y luego cambia permisos y propietario
    setImmediate(() => {
      fs.chmod(fullPath, 0o777, err => {
        if (err) console.error('Error cambiando permisos:', err);
      });
      fs.chown(fullPath, UID_GEA, GID_GEA, err => {
        if (err) console.error('Error cambiando propietario:', err);
      });
    });
  }
});

const upload = multer({ storage: storage });

module.exports = upload;