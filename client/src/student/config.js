var config = {};
    config.api = process.env.NODE_ENV==="development"?"http://localhost:5000":"https://api-dot-popple-255000.appspot.com";

module.exports.config = config;