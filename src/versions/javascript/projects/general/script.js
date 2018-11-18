var charset = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", " "];

var chars = 10;

var network = new cs.network({
      "nodes": {
            "Input": {
                  "num": chars
            },
            "Output": {
                  "num": chars
            },
            "Value": {
                  "num": 30,
                  "init": [-1, 1]
            },
            "Addition": {
                  "num": 30
            },
            "Multiplication": {
                  "num": 30
            },
            // "Tanh": {
            //       "num": 3
            // },
            // "Sine": {
            //       "num": 3
            // },
            // "Cosine": {
            //       "num": 3
            // },
            // "Abs": {
            //       "num": 3
            // }
      },
      "connections": {
            "num": chars * 5,
            "init": [-1, 1]
      }
});

var update_settings = {
      "iterations": 2,
      "limit": {
            "min": -10e3,
            "max": 10e3
      }
};

const encode = function(input, charset, length) {
      var output = [];
      for (var i = 0; i < length; i++) {
            output.push(charset.indexOf(input[i]));
      }
      return output;
}

const decode = function(input, charset) {
      var output = "";
      for (var i = 0; i < input.length; i++) {
            var character = charset[input[i]];
            if (!character) {
                  character = "";
            }
            output += character;
      }
      return output;
}

var inputs = [];
var outputs = [];
for (var i = 0; i < data.length; i++) {
      inputs.push(encode(data[i].input, charset, chars));
      outputs.push(encode(data[i].output, charset, chars));
}

// Maximum of output values
// don't use evaluate - reset
const predict = function(input) {
      return decode(
            cs.apply(
                  network.evaluate({
                        "input": encode(input, charset, chars),
                        "update": update_settings
                  }),
                  Math.round
            ),
            charset
      );
}

a = 1;

const update = function() {
      network = network.evolve({
            "iterations": 1,
            "population": 100,
            "inputs": inputs,
            "outputs": outputs,
            "mutate": {
                  "iterations": 1,
                  "nodes": {
                        "Value": {
                              "add": [0, a],
                              "remove": [0, a],
                              "limit": 10,
                              "init": [-1, 1],
                              "value": {
                                    "mutation_rate": 1,
                                    "mutation_size": 0,
                              }
                        },
                        "Addition": {
                              "add": [0, a],
                              "remove": [0, a],
                              "limit": 10
                        },
                        "Multiplication": {
                              "add": [0, a],
                              "remove": [0, a],
                              "limit": 10
                        },
                        "Tanh": {
                              "add": [0, a],
                              "remove": [0, a],
                              "limit": 10
                        },
                        // "Sine": {
                        //       "add": [0, a],
                        //       "remove": [0, a],
                        //       "limit": 10
                        // },
                        // "Cosine": {
                        //       "add": [0, a],
                        //       "remove": [0, a],
                        //       "limit": 10
                        // },
                        // "Abs": {
                        //       "add": [0, a],
                        //       "remove": [0, a],
                        //       "limit": 10
                        // }
                  },
                  "connections": {
                        "add": [0, 5],
                        "remove": [0, 5],
                        "limit": 5000,
                        "init": [-1, 1],
                        "value": {
                              "mutation_rate": 1,
                              "mutation_size": 0.001,
                        }
                  }
            },
            "update": update_settings,
            "log": true,
            "return": "network"
      });

      document.getElementById("output").innerText = predict("2+ 2=5");
}

setInterval(update, 1);