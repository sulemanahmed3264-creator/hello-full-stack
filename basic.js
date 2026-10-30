function calculate(parameter1, parameter2,operation) {
    if (operation === "add") {
        return parameter1 + parameter2;
    } else if (operation === "subtract") {
        return parameter1 - parameter2;
    } else if (operation === "multiply") {
        return parameter1 * parameter2;
    } else if (operation === "divide") {
        return parameter1 / parameter2;
    } else {
        return "Invalid operation";
    }     
  }
    console.log(calculate(10, 5, "add")); // Output: 15
    console.log(calculate(10, 5, "subtract")); // Output: 5
    console.log(calculate(10, 5, "multiply")); // Output: 50
    console.log(calculate(10, 5, "divide")); //output: 2

    