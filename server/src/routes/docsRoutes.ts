import { Router, type Router as IRouter } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openapiSpec } from '../docs/openapi.js';

const router: IRouter = Router();

router.get('/openapi.json', (_req, res) => {
  res.json(openapiSpec);
});

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openapiSpec));

export default router;
