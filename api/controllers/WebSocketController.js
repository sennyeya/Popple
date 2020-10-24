const PlanController = require('./planController')
const WebSocket = require('ws')

/**
 * Start the wss connection, add listeners.
 * @param {WebSocket} ws a websocket
 */
module.exports = {
    start: function(wss){
        wss.on('connection', function connection(ws) {
            ws.on('message', async function incoming(data) {
            });
          });
    }
}