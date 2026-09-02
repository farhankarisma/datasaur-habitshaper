import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports that the API is healthy', () => {
    const controller = new HealthController();

    expect(controller.getHealth()).toEqual({ status: 'ok' });
  });
});
