import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as events from "./event_emit.js"
import * as path from "path"
import { setMaxListeners } from 'events';

var fake_brain = {
    "levels":[{"inputs":[0.16991812643318327,0,0,0.16991812643318316],"outputs":[0,0,0,0.8719402963605049],"biases":[0.27439338618088627,0.8031687110636181,0.7357095740551367,-0.8640887350772126],"weights":[[0.9,0.7962298025134651,-0.5987333823548768,-0.9],[0.9,0.9,-0.806185147846715,0.3442339319045433],[0.006342936360701934,0.2975376945310404,0.1045097519925009,-0.06000224953127331],[-0.5389917360612215,-0.06098026467081885,-0.7735945286352885,0.9462079087623403]]},{"inputs":[0,0,0,0.8719402963605049],"outputs":[0.58663862809158,0],"biases":[0.1981076386328744,0.5899271329580067],"weights":[[-0.9,0.9],[-0.9,0.8873192461995059],[0.9,0.9],[0.9,0.29533213644524237]]}]
};

type eventTypes = {
    'a' : {},
    'b' : {}
}

const event_emitter = new events.TypedEventEmitter<eventTypes>

const app = express();

//initialize a simple http server
const server = http.createServer(app);
if (server == null){}

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

var winner = "null"
var best = {}

setMaxListeners(10000);
wss.on('connection', (ws: WebSocket) => {

    var name = "";

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        var mess = JSON.parse(message);
        if (mess.type == "win"){
            winner = name;
            best = mess.data;
            event_emitter.emit("a")
        } else if (mess.type == "name"){
            name = mess.data;
            
        }
    });

    event_emitter.on('a', () => {
        
        if (name == "Henry"){
            ws.send(JSON.stringify({type : "alert", data : "We have a winner and the name is " + winner}))
            ws.send(JSON.stringify({type : "brain", data : fake_brain}))
        }
    })
    event_emitter.on('b', () => {
        if (name == "Mitchel"){
            console.log("Safety Feature enabled")
            ws.send(JSON.stringify({type : "brain", data : fake_brain}))
        }
    })

});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', 'login.html'))
})
app.get("/car/index", (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/car', 'index.html'))
})
app.use(express.static(path.join(__dirname, '../pages')))

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`server started`);
});


setTimeout(() => {
    event_emitter.emit("b")
}, 45000)