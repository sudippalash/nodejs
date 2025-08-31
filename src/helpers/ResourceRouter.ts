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

export function createResourceRouter() {
  const router = Router();

  // Extend router with .resource()
  (router as any).resource = function (path: string, controller: ResourceController) {
    if (controller.index) this.get(path, controller.index);
    if (controller.create) this.get(`${path}/create`, controller.create);
    if (controller.store) this.post(path, controller.store);
    if (controller.show) this.get(`${path}/:id`, controller.show);
    if (controller.edit) this.get(`${path}/:id/edit`, controller.edit);
    if (controller.update) this.put(`${path}/:id`, controller.update);
    if (controller.destroy) this.delete(`${path}/:id`, controller.destroy);
    return this;
  };

  // Type definition so TS knows about .resource()
  return router as Router & {
    resource: (path: string, controller: ResourceController) => Router;
  };
}
