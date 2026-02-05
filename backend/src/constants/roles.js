/**
 * User Roles Constants
 */

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

const PERMISSIONS = {
  [ROLES.USER]: ['read', 'invest', 'withdraw'],
  [ROLES.MODERATOR]: ['read', 'invest', 'withdraw', 'manage_users'],
  [ROLES.ADMIN]: ['read', 'invest', 'withdraw', 'manage_users', 'manage_segments', 'manage_plans'],
};

module.exports = {
  ROLES,
  PERMISSIONS,
};
