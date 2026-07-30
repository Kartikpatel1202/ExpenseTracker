export function requireAuth(req, res, next) {
  // Add JWT verification in Level 2.
  req.user = { id: 'training-user-id' };
  next();
}

