const { Router } = require("express");
const { AuthGuardMiddleware } = require("../auth/auth.guard");
const { createPermissionHandler, createRoleHandler, assignPermissionToRoleHandler } = require("../RBAC/rbac.service");
const { assignPermissionToRoleValidation } = require("./validation");

const router = Router();

router.post("/create-role", AuthGuardMiddleware, createRoleHandler);
router.post("/create-permission", AuthGuardMiddleware, createPermissionHandler);
router.post("/add-permission-to-role", assignPermissionToRoleValidation, assignPermissionToRoleHandler);

module.exports = {
  RbackRoutes: router,
};
