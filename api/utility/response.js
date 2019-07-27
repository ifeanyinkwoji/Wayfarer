const resSuccess = (res, code, data, status = 'success') => res.status(code).json({
  status,
  data,
});

const resBadRequest = (res, error, status = 'error') => res.status(400).json({
  status,
  error: error || 'Bad request',
});

const resUnauthorized = (res, error, status = 'error') => res.status(401).json({
  status,
  error: error || 'Unauthorized',
});

const resForbidden = (res, error, status = 'error') => res.status(403).json({
  status,
  error: error || 'Forbidden',
});

const resNull = (res, error, status = 'error') => res.status(404).json({
  status,
  error: error || 'Not found',
});

const resConflict = (res, error, status = 'error') => res.status(409).json({
  status,
  error: error || 'Conflict',
});

const resGone = (res, error, status = 'error') => res.status(410).json({
  status,
  error: error || 'Gone',
});

const resInternalServer = (res, error, status = 'error') => res.status(500).json({
  status,
  error: error || 'Internal Server Error',
});

export {
  resSuccess,
  resBadRequest,
  resUnauthorized,
  resForbidden,
  resNull,
  resConflict,
  resGone,
  resInternalServer,
};
