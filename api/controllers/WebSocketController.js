const PlanController = require('./planController')
const WebSocket = require('ws')

/**
 * Start the wss connection, add listeners.
 * @param {WebSocket} ws a websocket
 */
module.exports = {
    start: function(wss){
        wss.on('connection', function connection(ws) {
            ws.on('message', function incoming(data) {
              console.log(data);
              data = JSON.parse(data);
              PlanController.updateBucket(data.id, data.bucket, data.item)
            });
          });
    }
}