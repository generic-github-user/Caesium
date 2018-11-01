// ASCII logo art displayed in console
// http://www.network-science.de/ascii/
console.log("%c\
    _____            ______   _____  _____  _    _  __  __   \n\
   / ____|    /\\    |  ____| / ____||_   _|| |  | ||  \\/  |  \n\
  | |        /  \\   | |__   | (___    | |  | |  | || \\  / |  \n\
  | |       / /\\ \\  |  __|   \\___ \\   | |  | |  | || |\\/| |  \n\
  | |____  / ____ \\ | |____  ____) | _| |_ | |__| || |  | |  \n\
   \\_____|/_/    \\_\\|______||_____/ |_____| \\____/ |_|  |_|  \n\
                                                             \
", "background: #e8efff; color: #4319ff; font-weight: 1000;");



// Generate a random number in between a minimum value and a maximum value
const random = function(minimum, maximum) {
      return minimum + (Math.random() * (maximum - minimum));
}
// Select a random element from a given array
const random_item = function(array) {
      return array[Math.floor(Math.random() * array.length)];
}
// Clone an object so that the new object does not contain a reference to the original object; either object may be altered without affecting the other
const clone = function(object) {
      return Object.assign({}, object);
}
// Find a node globally given its ID
const get_node = function(id) {
      return all_nodes.find(x => x.id == id);
}

const difference = function(array_1, array_2) {
      return array_2.map(
            (element, i) => {
                  return element - array_1[i];
            }
      )
}

const sum = function(array) {
      var sum = 0;
      array.forEach(
            (element) => {
                  sum += element;
            }
      );
      return sum;
}

const average = function(array) {
      return sum(array) / array.length;
}



// Settings for networks
var settings = {
      "node_types": [{
                  "name": "Data/Input"
            },
            {
                  "name": "Data/Output"
            },
            {
                  "name": "Data/Value"
            },
            {
                  "name": "Operation/Addition",
            },
            {
                  "name": "Operation/Multiplication"
            }
      ]
};

const cs = {
      "all": {
            // List of all nodes
            "nodes": [],
            // List of all connections
            "connections": [],
            // List of all networks
            "networks": []
      },
      "temp": {
            // These must be declared outside of the scope of a network object so that the node constructor can add nodes to them
            // List of nodes with inputs (see if there is a more efficient way to do this)
            "node_types": {
                  // List of output nodes
                  "input": [],
                  // List of output nodes
                  "output": [],
                  // List of value (bias) nodes
                  "value": []
            },
            "node_inputs": [],
            // List of nodes with outputs
            "node_outputs": []
      }
};

// Generate a random UUID
// Based on https://stackoverflow.com/a/105074
var uuids = [];
cs.UUID = function() {
      // Generate a random string of four hexadecimal digits
      function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                  .toString(16)
                  .substring(1);
      }
      // Generate UUID from substrings
      var id;
      do {
            id = s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
      }
      while (uuids.indexOf(id) !== -1)

      uuids.push(id);
      return id;
}

// Node class
cs.node = class {
      constructor(config) {
            this.type = config.type;
            // Create input node
            if (config.type == "Data/Input") {
                  cs.temp.node_types.input.push(this);

                  // Cannot be undefined
                  this.value = 0;
                  cs.temp.node_outputs.push(this);
            }
            // Create output node
            else if (config.type == "Data/Output") {
                  cs.temp.node_types.output.push(this);

                  cs.temp.node_inputs.push(this);
                  this.value = config.value;
                  cs.temp.node_outputs.push(this);
            }
            // Create value node
            else if (config.type == "Data/Value") {
                  cs.temp.node_types.value.push(this);

                  this.value = config.value;
                  cs.temp.node_outputs.push(this);
            }
            // Create addition node
            else if (config.type == "Operation/Addition") {
                  cs.temp.node_inputs.push(this);
                  this.value = 0;
                  cs.temp.node_outputs.push(this);
            }
            // Create multiplication node
            else if (config.type == "Operation/Multiplication") {
                  cs.temp.node_inputs.push(this);
                  this.value = 0;
                  cs.temp.node_outputs.push(this);
            }
            // Log error: node type not found
            else {
                  console.error("'" + config.type + "'" + "is not a valid node type. Please use 'Data/Input', 'Data/Output', 'Data/Value', 'Operation/Addition', or 'Operation/Multiplication'.");
            }

            // Create UUID for node
            this.id = cs.UUID();
            // Add node to global nodes list
            cs.all.nodes.push(this);
      }
}

// Connection class
cs.connection = class {
      // Constructor for creating a connection between two nodes within a network
      constructor(config) {
            this.source = config.source;
            this.destination = config.destination;

            this.id = cs.UUID();
            cs.all.connections.push(this);
      }
}

// Network class
cs.network = class {
      // Constructor for creating a network or computation graph
      constructor(config) {
            this.inputs = config.num_inputs;
            this.outputs = config.num_outputs;
            this.nodes = [];

            cs.temp.node_inputs = [];
            cs.temp.node_outputs = [];

            // Score used for evolutionary optimization algorithm
            this.score = 0;

            cs.temp.node_types = {
                  // List of output nodes
                  "input": [],
                  // List of output nodes
                  "output": [],
                  // List of value (bias) nodes
                  "value": []
            }
            for (var i = 0; i < config.num_inputs; i++) {
                  this.nodes.push(
                        new cs.node({
                              "type": "Data/Input"
                        })
                  );
            }
            for (var i = 0; i < config.num_outputs; i++) {
                  this.nodes.push(
                        new cs.node({
                              "type": "Data/Output",
                              "value": 0
                        })
                  );
            }
            // Add value nodes to network
            for (var i = 0; i < Math.round(random(10, 20)); i++) {
                  this.nodes.push(
                        new cs.node({
                              "type": "Data/Value",
                              "value": random(-1, 1)
                        })
                  );
            }
            // Add addition nodes to network
            for (var i = 0; i < Math.round(random(10, 20)); i++) {
                  this.nodes.push(
                        new cs.node({
                              "type": "Operation/Addition"
                        })
                  );
            }
            // Add multiplication nodes to network
            for (var i = 0; i < Math.round(random(10, 20)); i++) {
                  this.nodes.push(
                        new cs.node({
                              "type": "Operation/Multiplication"
                        })
                  );
            }
            this.node_inputs = cs.temp.node_inputs;
            this.node_outputs = cs.temp.node_outputs;

            this.node_types = cs.temp.node_types;

            // Generate random connections between nodes
            var connections = [];
            for (var i = 0; i < Math.round(random(50, 100)); i++) {
                  connections.push(
                        // Create a new connection with the constructor function
                        new cs.connection({
                              // Connection sources must be nodes with outputs
                              "source": random_item(this.node_outputs).id,
                              // Connection destinations must be nodes with inputs
                              "destination": random_item(this.node_inputs).id
                        })
                  );
            }
            this.connections = connections;

            this.node = function(id) {
                  var node = this.nodes.find(x => x.id == id);
                  if (!node) {
                        console.error("Node with id " + id + " could not be found.");
                  } else {
                        return node;
                  }
            }
            this.connection = function(id) {
                  var connection = this.connections.find(x => x.id == id);
                  if (!connection) {
                        console.error("Connection with id " + id + " could not be found.");
                  } else {
                        return connection;
                  }
            }

            // Function for setting input data of network
            this.set_inputs = function(inputs) {
                  var num_inputs = this.node_types.input.length;
                  if (inputs.length < num_inputs) {
                        console.error("The number of inputs you have provided (" + num_inputs + ") is fewer than the number of input nodes in the network (" + num_inputs + "). Please provide " + num_inputs + " inputs.");
                        return false;
                  } else if (inputs.length > num_inputs) {
                        console.error("The number of inputs you have provided (" + num_inputs + ") is fewer than the number of input nodes in the network (" + num_inputs + "). Please provide " + num_inputs + " inputs.");
                        return false;
                  } else if (inputs.length == num_inputs) {
                        for (var i = 0; i < inputs.length; i++) {
                              this.node_types.input[i].value = inputs[i];
                        }
                        return this;
                  }
            }

            // Function for retrieving outputs from network
            this.get_outputs = function() {
                  var outputs = [];
                  this.node_types.output.forEach(
                        (node) => {
                              outputs.push(node.value);
                        }
                  );
                  return outputs;
            }

            // Run one iteration of calculations for node values in network
            this.update = function() {
                  // Create a clone of the network so that all nodes can be updated simultaneously, without affecting other values
                  var network_buffer = clone(this);
                  this.nodes.forEach(
                        (node) => {
                              var type = node.type;
                              if (type == "Data/Output" || type == "Operation/Addition") {
                                    node.value = 0;
                              } else if (type == "Operation/Multiplication") {
                                    node.value = 1;
                              }
                        }
                  );
                  for (var i = 0; i < network_buffer.connections.length; i++) {
                        var type = this.node(this.connections[i].destination).type;
                        if (type == "Data/Output" || type == "Operation/Addition") {
                              this.node(this.connections[i].destination).value +=
                                    network_buffer.node(connections[i].source).value;
                        } else if (type == "Operation/Multiplication") {
                              this.node(this.connections[i].destination).value *=
                                    network_buffer.node(connections[i].source).value;
                        }
                  }
                  this.nodes.forEach(
                        (node) => {
                              if (node.type == "Operation/Multiplication" && node.value == 1) {
                                    node.value = 0;
                              }
                        }
                  );

                  // Return updated network object
                  return this;
            }

            this.mutate = function(config) {
                  if (typeof(config.mutation_rate) !== "number") {
                        console.error("Mutation rate must be a number.");
                  } else if (config.mutation_rate < 0) {
                        console.error("Mutation rate of " + config.mutation_rate + " is too low. Mutation rate must be between 0 and 1.");
                  } else if (config.mutation_rate > 1) {
                        console.error("Mutation rate of " + config.mutation_rate + " is too high. Mutation rate must be between 0 and 1.");
                  } else {
                        this.node_types.value.forEach(
                              (node) => {
                                    if (random(0, 1) < config.mutation_rate) {
                                          node.value += random(-config.mutation_size,
                                                config.mutation_size
                                          );
                                    }
                              }
                        );
                  }

                  return this;
            };

            // Evolve network using supervised learning to match a given set of inputs to a given set of outputs
            this.evolve = function(config) {
                  for (var i = 0; i < config.iterations; i++) {
                        var population = new Array(config.population).fill(clone(this));
                        population.forEach(
                              (network) => {
                                    network.mutate({
                                          "mutation_rate": 0.5,
                                          "mutation_size": 1
                                    })
                                    network.set_inputs(config.inputs);
                                    network.update();
                                    console.log(network.get_outputs());
                                    network.score = average(difference(network.get_outputs(), config.outputs));
                              }
                        );
                        var best_score = Math.min.apply(
                              Math, population.map(
                                    function(x) {
                                          return x.score;
                                    }
                              )
                        );
                        var best_network = population.find(
                              function(x) {
                                    return x.score == best_score;
                              }
                        );
                        console.log(best_network)
                  }
                  return population;
            }

            this.id = cs.UUID();
            cs.all.networks.push(this);
      }
}