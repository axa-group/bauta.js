const config = require('./jest.config.base');

module.exports = { displayName: 'bautajs', ...config, projects: ['<rootDir>/packages/*'] };
