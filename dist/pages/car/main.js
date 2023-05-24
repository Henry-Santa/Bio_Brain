let canWin = true;

const carCanvas = document.getElementById("carCanvas");
carCanvas.width=300;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width=600;
url = "null"

const win_event = new Event('win')


const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get('name');
console.log(user)
if (!user){
    alert("YOUR NAME IS NOT PRESENT IN THE URL\nthis means you cannot win the game please go back the start\nIf you do not care about winning you can still play around")
}

const message = {
    "type" : "name",
    "data" : user
}

try{url=new URL(window.location.origin)} catch{}

if (url != "null"){
    try{
    const ws = new WebSocket("ws" + url.origin.slice(4))
    
    ws.onopen = ((e) => {
        ws.send(JSON.stringify(message));
        console.log("Connected")
        ws.onmessage = ((m) =>{
            var my_message = JSON.parse(m.data);
            if (my_message.type == "alert"){
                alert(my_message.data);
            } else if (my_message.type == "brain"){
                bestCar.brain = my_message.data;
                save();
                refresh();
            }
            
        })
    })
    document.addEventListener('win', () => {
        if (canWin == true){ ws.send(JSON.stringify({type : 'win', brain : my_net})) }
        else { alert("please save the brain and run the car again without any changes")}
        
        
    });} catch {}
}




document.getElementById('name').textContent = user;

const networkCtx = networkCanvas.getContext("2d");
const carCtx = carCanvas.getContext("2d");
const road = new Road(carCanvas.width/2,carCanvas.width*0.9);

carCanvas.height=window.innerHeight;
networkCanvas.height=window.innerHeight;

var biases_change = function() {
    document.getElementById("bias").style.accentColor = getRGBA(document.getElementById("bias").value);
    if (current_bias_index != null){
        let d = neuron_coords[current_bias_index];
        my_net.levels[d[2]].biases[d[3]] = document.getElementById("bias").value;
        canWin = false;
        document.getElementById('win').style.color = 'magenta';
    }
}


document.getElementById("bias").oninput = biases_change;
document.getElementById("bias").onchange = biases_change;


const N =1;
const cars =generateCars(N);

let bestCar = cars[0];
if (localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.15)
        }
    }
    
}

let carsAtOnce = 3;
var traffic=[
    new Car(road.getLaneCenter(1), -400,50,80,"DUMMY",1.8),
    new Car(road.getLaneCenter(2), -400,50,80,"DUMMY",1.8),
    new Car(road.getLaneCenter(1), -600,50,80,"DUMMY",1.8),
    new Car(road.getLaneCenter(0), -870,50,80,"DUMMY",1.8),
];


const visualizer = new Visualizer(bestCar.brain, networkCtx, networkCanvas)

//let lastTime= new Date();

animate();

function save(){
    localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain")
}

function drive(){
    canMove = !canMove;
}

function refresh(){
    location.reload()
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,50,80,"AI"));
    }
    return cars;
}



function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }

    

    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx,"yellow");
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx,"cyan");
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,"cyan",true);
    
    if (bestCar.y < traffic[traffic.length-1].y-100){
        console.log("WINNER");
        alert("YOU HAVE WON, Congrats!!")
        document.dispatchEvent(win_event);
        canMove = false;
        bestCar.y = 0;
    }
    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    visualizer.drawNetwork(networkCtx);
    requestAnimationFrame(animate);
}