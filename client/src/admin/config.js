var config = {};
    config.api = process.env.NODE_ENV==="development"?"http://localhost:5000":"https://api-dot-popple-255000.appspot.com";

module.exports.config = config;

module.exports.authOptionsPost = (body) => {
    return{
        credentials: "include",
        method: 'POST',
        mode: 'cors',
        headers: {
            "x-Trigger": "CORS",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true
        },
        body: body
    }
}

module.exports.authOptionsGet = {
    credentials: "include",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true
    },
}