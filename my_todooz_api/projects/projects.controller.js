const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const projectService = require("./projects.service");

// routes
router.get("/:project_id", authorize(), getById);
router.put("/:project_id", authorize(), update);
router.delete("/:project_id", authorize(), _delete);
router.get("/user/:owner_id", getAll);
router.post("/", updateSchema, create);

module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    project_name: Joi.string().max(40).required(),
    project_description: Joi.string().max(255).allow(""),
    project_notes: Joi.string().max(1000).allow(""),
    parent_project_id: Joi.number(),
    owner_id: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function getAll(req, res, next) {
  projectService
    .getAll(req.params.owner_id)
    .then((projects) => res.json(projects))
    .catch(next);
}

function getById(req, res, next) {
  projectService
    .getById(req.params.project_id)
    .then((project) => res.json(project))
    .catch(next);
}

function update(req, res, next) {
  projectService
    .update(req.params.project_id, req.body)
    .then((project) => res.json(project))
    .catch(next);
}

function create(req, res, next) {
  projectService
    .create(req.body)
    .then((project) => res.json(project))
    .catch(next);
}

function _delete(req, res, next) {
  projectService
    .delete(req.params.project_id)
    .then((result) => res.json(result))
    .catch(next);
}
