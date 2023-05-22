let weights = []
let neuron_coords = []
var current_weight_index = null;
var current_bias_index = null;
var offsetX = 0;
var offsetY = 0;
var canv = null;
var dragging = false;
let prevX = 0;
let prevY = 0;

var my_net;



function getOffset(){
    let canvas_Offsets = canv.getBoundingClientRect();
    offsetX = canvas_Offsets.left;
    offsetY = canvas_Offsets.top;
}
window.onscroll = getOffset;
window.onresize = getOffset;
window.onchange = getOffset;

class Weight{

    level;
    neuronIndex;
    Index;
    x1;
    y1;
    x2;
    y2;
    /**
     * 
     * @param {NeuralNetwork} network 
     * @param {number} neuronIndex 
     * @param {number} Index 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x1 
     * @param {number} x2 
     * @param {number} y1 
     * @param {number} y2 
     * @param {number} value 
     * @param {number} levelIndex
     */
    constructor(network, neuronIndex, Index, ctx, x1, x2, y1, y2, value, levelIndex){
    
        
        console.log("New Weight made at", x1, x2, y1, y2, value);
        
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.network = network;
        this.neuronIndex = neuronIndex;
        this.Index = Index;
        this.value = value;
        this.levelIndex = levelIndex;
    }

    redraw(ctx){
        /*
        ctx.moveTo(
            this.x1,
            this.y1
        );
        */
        //console.log("Redrawing", lerp(this.x1, this.x2, 0.5 + this.value/2), lerp(this.y1, this.y2, 0.5 + this.value/2))
        ctx.fillStyle = 'cyan'
        ctx.fillRect(lerp(this.x1, this.x2, 0.5 - this.value/2), lerp(this.y1, this.y2, 0.5 - this.value/2), 10, 10);
        ctx.fill()
    }

    mouse_in_weight(x, y){
        let currX = lerp(this.x1, this.x2, 0.5 - this.value/2);
        let currY = lerp(this.y1, this.y2, 0.5 - this.value/2);
        
        if (x > currX && x < currX + 15 && y > currY && y < currY + 15){
            return true
        }
        return false
    }

    update_weight(){
        
        this.network.levels[this.levelIndex].weights[this.neuronIndex][this.Index] = this.value;
    }

}



class Visualizer{
    weights = [];
    biases = [];
    network;
    
    /**
     * 
     * @param {NeuralNetwork} network 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {HTMLElement} canvas
     */
    constructor(network, ctx, canvas){
        this.network = network;
        my_net = network;
        const margin = 50;
        const width=ctx.canvas.width-margin*1;
        const height=ctx.canvas.height-margin*2;
        
        const left= margin;
        const top = margin;
        const levelHeight=height/network.levels.length;
        
        for(let i=network.levels.length-1;i>=0;i--){
            const {inputs,outputs,weights,biases}=network.levels[i];
            const levelTop=top+
                lerp(
                    height-levelHeight,
                    0,
                    network.levels.length==1
                        ?0.5
                        :i/(network.levels.length-1)
                );
            let ind = 0;
            for(let b of biases){
                try{
                neuron_coords.push([Visualizer.#getNodeX(outputs,ind,left,width), levelTop, i, ind])
                ind++} catch{
                    break;
                }
            }
            console.log(levelTop, levelHeight)
            for (let t=0; t< network.levels[i].weights.length; t++){
                
                for (let j=0; j < network.levels[i].weights[t].length; j++){
                   
                    
                    this.weights.push(new Weight(network, t, j, ctx, Visualizer.#getNodeX(inputs,t,left,width), Visualizer.#getNodeX(outputs,j,left,width), levelTop+levelHeight, levelTop, network.levels[i].weights[t][j], i))
                }
            }
            console.log(canvas)
            canv = canvas;
            getOffset()
            canvas.onmousedown = this.onMouseDown;
            canvas.onmouseup = this.onMouseUp;
            canvas.onmousemove = this.onMove;
            canvas.ontouchstart = this.onMouseDown;
            canvas.ontouchend = this.onMouseUp;
            canvas.ontouchcancel = this.onMouseUp;
            canvas.ontouchmove = this.onMove;

        }
        
        weights = this.weights;
       
    }
    /**
     * 
     * @param {MouseEvent} e 
     */
    onMouseDown(e){
        e.preventDefault()
        let startX = parseInt(e.clientX - offsetX);
        let startY = parseInt(e.clientY - offsetY);
        
        let index = 0;
        for (let weight of weights){
            
            if (weight.mouse_in_weight(startX, startY)){
                current_weight_index = index;
                console.log("Weight Clicked")
                dragging = true;
                break;
            }
            index++
            dragging = false;
        }
        if (!dragging) {current_weight_index = null}
        

        let i = 0
        for (let coord of neuron_coords){
            if (Math.sqrt((startX- coord[0])**2 + (startY- coord[1])**2) < 18){
                current_bias_index = i;
                document.getElementById('bias').value = my_net.levels[coord[2]].biases[coord[3]];
                biases_change();
                console.log(coord, my_net.levels[coord[2]].biases[coord[3]])
                console.log(Math.sqrt((startX- coord[0])^2 + (startY- coord[1])^2))
                break;
            }
            i++
        }
        

        prevX = startX;
        prevY = startY;

    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    onMouseUp(e){
        e.preventDefault()
        dragging = false;
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    onMove(e){
        
        let newX = parseInt(e.clientX - offsetX);
        let newY = parseInt(e.clientY - offsetY);

        e.preventDefault()
        if (dragging && current_weight_index != null){
            var w = weights[current_weight_index];
            weights[current_weight_index].value = clamp(((w.y1 - 2*newY))/(w.y2-w.y1) - 0.5, 0.9, -0.9);
            w.update_weight();
            canWin = false;
            document.getElementById('win').style.color = 'magenta';
        }
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {NeuralNetwork} network 
     */
    drawNetwork(ctx){
        const network = this.network;
        const margin=50;
        const left=margin;
        const top=margin;
        const width=ctx.canvas.width-margin*2;
        const height=ctx.canvas.height-margin*2;
        
        const levelHeight=height/network.levels.length;

        this.weights.forEach((weight) => {
            ctx.restore()
            weight.redraw(ctx);
        })


        for(let i=network.levels.length-1;i>=0;i--){
            const levelTop=top+
                lerp(
                    height-levelHeight,
                    0,
                    network.levels.length==1
                        ?0.5
                        :i/(network.levels.length-1)
                );

            ctx.setLineDash([9,3]);
            Visualizer.drawLevel(ctx,network.levels[i],
                left,levelTop,
                width,levelHeight,
                i==network.levels.length-1
                    ?['<','>']
                    :[]
            );
        }
        
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {*} level 
     * @param {*} left 
     * @param {*} top 
     * @param {*} width 
     * @param {*} height 
     * @param {*} outputLabels 
     */
    static drawLevel(ctx,level,left,top,width,height,outputLabels){
        const right=left+width;
        const bottom=top+height;
        const {inputs,outputs,weights,biases}=level;

        for(let i=0;i<inputs.length;i++){
            for(let j=0;j<outputs.length;j++){
                ctx.beginPath();
                ctx.moveTo(
                    Visualizer.#getNodeX(inputs,i,left,right),
                    bottom
                );
                ctx.lineTo(
                    Visualizer.#getNodeX(outputs,j,left,right),
                    top
                );
                ctx.lineWidth=2;
                ctx.strokeStyle=getRGBA(weights[i][j]);
                ctx.stroke();
                
                
            }
        }

        const nodeRadius=18;
        for(let i=0;i<inputs.length;i++){
            const x=Visualizer.#getNodeX(inputs,i,left,right);
            ctx.beginPath();
            ctx.arc(x,bottom,nodeRadius,0,Math.PI*2);
            ctx.fillStyle="black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x,bottom,nodeRadius*0.6,0,Math.PI*2);
            ctx.fillStyle=getRGBA(inputs[i]);
            ctx.fill();
        }
        
        for(let i=0;i<outputs.length;i++){
            const x=Visualizer.#getNodeX(outputs,i,left,right);
            ctx.beginPath();
            ctx.arc(x,top,nodeRadius,0,Math.PI*2);
            ctx.fillStyle="black";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x,top,nodeRadius*0.6,0,Math.PI*2);
            ctx.fillStyle=getRGBA(outputs[i]);
            ctx.fill();

            ctx.strokeStyle=getRGBA(biases[i]);
            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.arc(x,top,nodeRadius*0.8,0,Math.PI*2);
            ctx.setLineDash([3,3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if(outputLabels[i]){
                ctx.beginPath();
                ctx.textAlign="center";
                ctx.textBaseline="middle";
                ctx.fillStyle="black";
                ctx.strokeStyle="white";
                ctx.font=(nodeRadius*1.5)+"px Arial";
                ctx.fillText(outputLabels[i],x,top+nodeRadius*0.1);
                ctx.lineWidth=0.5;
                ctx.strokeText(outputLabels[i],x,top+nodeRadius*0.1);
            }
        }
    }

    static #getNodeX(nodes,index,left,right){
        return lerp(
            left,
            right,
            nodes.length==1
                ?0.5
                :index/(nodes.length-1)
        );
    }
    static getNodeX(nodes, index, left, right){
        return Visualizer.#getNodeX(nodes, index, left, right)
    }
}