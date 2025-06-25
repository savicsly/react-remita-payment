import "@testing-library/jest-dom";
global.window.RmPaymentEngine = {
  init: jest.fn(),
  showPaymentWidget: jest.fn(),
  hidePaymentWidget: jest.fn(),
};
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
