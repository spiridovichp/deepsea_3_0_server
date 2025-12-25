const DepartmentsService = require('../services/departmentsService');

exports.list = async (req, res, next) => {
  try {
    const actor = req.user;
    const rows = await DepartmentsService.listDepartments(actor);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const actor = req.user;
    const { name } = req.body;
    const created = await DepartmentsService.createDepartment(name, actor);
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
    const updated = await DepartmentsService.updateDepartment(id, fields, actor);
    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const actor = req.user;
    const id = parseInt(req.params.id, 10);
    await DepartmentsService.deleteDepartment(id, actor);
    res.status(200).json({ message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
};
