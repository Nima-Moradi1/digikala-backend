const createHttpError = require("http-errors");
const { Role, Permission, RolePermission } = require("./rbac.model");
const { Op } = require("sequelize");

async function createRoleHandler(req, res, next) {
  try {
    const { title, description } = req.body;
    const existRole = await Role.findOne({
      where: {
        title,
      },
    });
    if (existRole) throw createHttpError(409, "role already exists");
    await Role.create({
      title,
      description,
    });
    return res.json({
      message: "role created successfully!",
    });
  } catch (error) {
    next(error);
  }
}

async function createPermissionHandler(req, res, next) {
  try {
    const { title, description } = req.body;
    const existPermission = await Permission.findOne({
      where: {
        title,
      },
    });
    if (existPermission) throw createHttpError(409, "permission already exists");
    await Permission.create({
      title,
      description,
    });
    return res.json({
      message: "permission created successfully!",
    });
  } catch (error) {
    next(error);
  }
}

async function assignPermissionToRoleHandler(req, res, next) {
  try {
    // we want to set an array of permissions to the roleId we get from body :
    const { roleId, permissions = [] } = req.body;
    //first we make sure that role exists,before assigning any permission to it :
    const role = await Role.findOne({ where: { id: roleId } });
    if (!role) throw createHttpError(404, "role was not found!");
    //then we make sure we have at least 1 permission to assign it to the role :
    if (permissions?.length > 0) {
      const permissionCount = await Permission.count({
        where: {
          id: { [Op.in]: permissions },
        },
      });
      if (permissionCount !== permissions.length) {
        throw createHttpError(400, "send correct list of permissions");
      }
      const permissionList = permissions?.map((perm) => ({
        roleId,
        permissionId: perm,
      }));
      await RolePermission.bulkCreate(permissionList);
    }
    return res.json({
      message: "permissions added to role successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRoleHandler,
  createPermissionHandler,
  assignPermissionToRoleHandler,
};
