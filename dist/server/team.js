"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.team = void 0;
class team {
    constructor(brain, name) {
        this.brain = brain;
        this.name = name;
    }
    update_weight(layer_index, neuron_index, weight_index, new_weight, eventEmitter) {
        this.brain.weights[layer_index][neuron_index][weight_index] = new_weight;
        eventEmitter.emit(this.name);
    }
    update_bias(layer_index, neuron_index, new_bias, eventEmitter) {
        this.brain.biases[layer_index][neuron_index] = new_bias;
        eventEmitter.emit(this.name);
    }
}
exports.team = team;
//# sourceMappingURL=team.js.map