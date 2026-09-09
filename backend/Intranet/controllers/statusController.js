// backend/Intranet/controllers/statusController.js
exports.status = (req, res) => {
  res.json({ status: 'ok', servicio: 'Intranet' });
};
