const JobTitlesService = require('../services/jobTitlesService');

exports.list = async (req, res, next) => {
  try {
    const actor = req.user;
    const rows = await JobTitlesService.listJobTitles(actor);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const actor = req.user;
    const fields = req.body || {};
    const created = await JobTitlesService.createJobTitle(fields, actor);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const actor = req.user;
    const id = parseInt(req.params.id, 10);
    const fields = req.body || {};
    const updated = await JobTitlesService.updateJobTitle(id, fields, actor);
    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const actor = req.user;
    const id = parseInt(req.params.id, 10);
    await JobTitlesService.deleteJobTitle(id, actor);
    res.status(200).json({ message: 'Job title deleted' });
  } catch (err) {
    next(err);
  }
};
