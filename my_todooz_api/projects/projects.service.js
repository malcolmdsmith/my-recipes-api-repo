const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};

async function getAll(owner_id) {
  return await db.Project.findAll({
    where: { owner_id: owner_id },
    order: [
      // ["parent_category", "ASC"],
      ["project_name", "ASC"],
    ],
  });
}

async function getById(project_id) {
  return await getProject(project_id);
}

async function create(params) {
  // validate
  if (
    await db.Project.findOne({
      where: {
        project_name: params.project_name,
      },
    })
  ) {
    //return;
    throw 'Project "' + params.project_name + '" already exists.';
  }

  // save project
  return await db.Project.create(params);
}

async function update(project_id, params) {
  const project = await getProject(project_id);

  // validate
  if (!project) throw "Project with the id does not exist.";

  // copy params to project and save
  Object.assign(project, params);
  await project.save();

  return project.get();
}

async function _delete(project_id) {
  const project = await getProject(project_id);
  if (project) await project.destroy();
}

// helper functions

async function getProject(project_id) {
  const project = await db.Project.findByPk(project_id);
  if (!project) throw "Project not found";
  return project;
}
