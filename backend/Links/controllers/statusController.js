// backend/Links/controllers/statusController.js
exports.status = (req, res) => {
  res.json({ status: 'ok', servicio: 'Links' });
};