// Backwards-compatible shim: re-export from new `permissionChecker.js`.
// Prefer importing from './permissionChecker' going forward.

const { hasPermission } = require('./permissionChecker');

module.exports = { hasPermission };
