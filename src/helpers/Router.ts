import { Router, RequestHandler } from "express";

export interface ResourceController {
  index?: RequestHandler;
  create?: RequestHandler;
  store?: RequestHandler;
  show?: RequestHandler;
  edit?: RequestHandler;
  update?: RequestHandler;
  destroy?: RequestHandler;
}

// Extra type so both `resource()` and `group()` exist
export type ResourceRouter = Router & {
  resource: (path: string, controller: ResourceController) => Router;
  group: (middlewares: any[], callback: (r: ResourceRouter) => void) => void;
};

export function createRouter(): ResourceRouter {
  const router = Router() as ResourceRouter;

  // resource()
  router.resource = function (path: string, controller: ResourceController) {
    if (controller.index) this.get(path, controller.index);
    if (controller.create) this.get(`${path}/create`, controller.create);
    if (controller.store) this.post(path, controller.store);
    if (controller.show) this.get(`${path}/:id`, controller.show);
    if (controller.edit) this.get(`${path}/:id/edit`, controller.edit);
    if (controller.update) this.put(`${path}/:id`, controller.update);
    if (controller.destroy) this.delete(`${path}/:id`, controller.destroy);
    return this;
  };

  // group()
  router.group = function (middlewares: any[], callback: (r: ResourceRouter) => void) {
    const r = createRouter();
    if (middlewares && middlewares.length) {
      r.use(...middlewares);
    }
    callback(r);
    this.use(r);
  };

  return router;
}
