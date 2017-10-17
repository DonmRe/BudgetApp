//*****************************************************************************
//BUDGET CONTROLLER
//*****************************************************************************
var budgetController = (function() {

    var Expense = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
      if (totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome) * 100)
      } else {
        this.percentage = -1;
      }
    };

    Expense.prototype.getPercentage = function () {
      return this.percentage;
    };

    var Income = function(id, description, value){
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var calculateTotal = function (type) {
      var sum = 0;
      data.allItems[type].forEach(function (cur) {
        sum += cur.value;
      });
      data.totals[type] = sum;
    };

    var data = {
      allItems: {
        exp: [],
        inc: []
      },
      totals:{
        exp: 0,
        inc: 0
      },
      budget: 0,
      percentage: -1
    };

    return {
      addItem: function (type, des, val) {
        var newItem, ID;

        //Create new ID
        if (data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
        ID = 0;
        }
        //Create new Item based on 'inc' or 'exp' type
        if (type === 'exp'){
        newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
          }

        // Push new Item into our data structure
        data.allItems[type].push(newItem);

        //Return the new element
        return newItem;
        console.log(newItem);
      },

        deleteItem: function (type, id) {
          var ids, index;
            // ex:
            //   let's imagine we have ID 6.
            //   we cannot access to it using this sintax
            //   data.allItems[type][id]
            //   because there's no certainty that the index will match the value of the id.
            //   ids = [1, 2, 4, 6, 8]
            //   in this case the index of 6 is 3. So we use the methods map and indexOf

            ids = data.allItems[type].map(function (current) {
              return current.id;
            });

            index = ids.indexOf(id)

            // now to erase the object, we first want to make sure it exists, so
            if(index !== -1){
            // now if this item actually exist, we want to delele it, for that we use the splice() method
              data.allItems[type].splice(index, 1);
            // in this case we are inputing two parameters to the splice method, being the first the index of where to start deleting and the second is how many elements to remove.
            // NOTE: the splice method can also be used to add elements, in that case those elements should be indicated after the second paramenter and they will be added as replacement of the deleted elements.
            // ex:
            // var myFish = ['angel', 'clown', 'mandarin', 'sturgeon'];
            // var removed = myFish.splice(2, 0, 'drum');
            //     myFish is ["angel", "clown", "drum", "mandarin", "sturgeon"]
            //     removed is [], no elements removed

            // ONCE THIS FUNCTION HAS BEEN DEFINED WE INVOKE IT ON THE CONTROLLER (ctrlDeleteItem)
            }

        },

        calculateBudget: function () {
          // Calculate total income and expenses
          calculateTotal('exp');
          calculateTotal('inc');

          // Calculate the budget: income - expenses
          data.budget = data.totals.inc - data.totals.exp;
          // Calculate the percentage of income the we spent
            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
          } else {
            data.percentage = -1;
          }
          // Expense = 100 and income 300, spent 33.333% = 100/300 = 0.3333 *100
        },

        calculatePercentages: function () {

          // a=20
          // b=10
          // c=40
          // income = 100
          // a = 20 / 100 = 20%
          // b = 10 / 100 = 10%
          // c = 40 / 100 = 40%

          data.allItems.exp.forEach(function (cur) {
            cur.calcPercentage(data.totals.inc); // this will  Calculate the percentage for each element we have in this object.
          });
        },

        getPercentages: function () {
          var allPerc = data.allItems.exp.map(function (cur) {
            return cur.getPercentage();
          });
          return allPerc;
        },

        getBudget: function () {
          return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
          };
        },

        testing: function () {
        console.log(data);
      }
    };

})();




//*****************************************************************************
// UI CONTROLLER
//*****************************************************************************
var UIController = (function() {

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec, type;
      //+ or - before a number
      // exactly 2 decimal points
      // comma separating the thousands
      // ex: 2310.4567 -> + 2,310.45
      //      2000 -> + 2,000.00

     num = Math.abs(num);
     num = num.toFixed(2);

     numSplit = num.split('.');

     int = numSplit[0];
     if (int.length > 3){
       int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2310, output 2,310
     }
     dec = numSplit[1];

     return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; // this ternary operator will return based on a boolean either '-' or '+'
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml;
      // create a HTML string with placeholder text

      if (type === 'inc'){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }else if (type === 'exp'){
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      // Replace the placeholder text with actual data

        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert HTML into the DOM

        document.querySelector(element).insertAdjacentHTML('beforeEnd', newHtml)

    },

    deleteListItem: function (selectorID) {
        var el = document.getElementById(selectorID);
        // Before removing and element we need to stablish which is it's parent element, because in javaScript we can only remove child elements. In this case we need to find the parent element of the listItem we want to delete
        el.parentNode.removeChild(el) // The parentNode method takes us up one level on the HTML tree.
    },

    clearFields: function () {
        var fields, fieldsArr;
        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)
        fieldsArr = Array.prototype.slice.call(fields)

        fieldsArr.forEach(function(current, index, array) {
          current.value = "";
        });

        fieldsArr[0].focus(); // the focus DOM method, will bring back the cursor to the specify element.
    },

    displayBudget: function (obj) {
        var type;

        obj.budget > 0 ? type = 'inc' : type = 'exp'; // since there's no way to know the type before it has been input, right then this ternary will set the value of the type and this way it can be applied on the format to be properly displayed.

        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if(obj.percentage > 0){
          document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        }else {
          document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        }

    },

    displayPercentages: function (percentages) {
        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

        nodeListForEach(fields, function (current, index) {
          // Do Stuff
          if(percentages[index] > 0 ){
            current.textContent = percentages[index] + '%';
          } else {
            current.textContent = '---';
          }
        });
    },

    displayMonth: function () {
      var now, year, month;

      now = new Date();
      // the format of this method goes this way. ex: var christmas = new Date (2017, 11, 25) // why 11 for decemenber? is because is 0 based.
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'Decemenber']
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    changedType: function () {
      //1. change outline of inputs based on type selection
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };


})();


//*****************************************************************************
//GLOBAL APP CONTROLLER
//*****************************************************************************
var controller = (function(budgetCtrl, UICtrl) {

  var setUpEventListeners = function () {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function () {
    //1. Calculate the budget
    budgetCtrl.calculateBudget();
    //2. Return the budget
    var budget = budgetCtrl.getBudget();
    //3. Display the budget on the UI
    UICtrl.displayBudget(budget)
  };

  var updatePercentages = function () {
    //1. Calculate percentages
    budgetCtrl.calculatePercentages();
    //2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);

  };

  var ctrlAddItem = function() {
    var input, newItem;

    //1. Get the field input data
    input = UICtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
      //2. Add the item to the budget CONTROLLER
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type)
      //4. Clear the fields
      UICtrl.clearFields()
      //5. Calculate and update budget
      updateBudget();
      //6. Calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

    if(itemID){
      splitID = itemID.split('-'); //the string method split(), will separate a string on a given character and create an array with the elements located before and after that caracter on different indexes
      type = splitID[0];
      ID = parseInt(splitID[1]); // the string method parseInt() will convert the value of a string to an integer / ex: '1' => 1

      // 1. Delete item from data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete Item from UI
      UICtrl.deleteListItem(itemID);
      // 3. Update and show new budget
      updateBudget(); // after the Item has been deleted we just need to call again the updateBudget function.
      //6. Calculate and update percentages
      updatePercentages();
    }

  };

  return {
    init: function () {
      console.log('App Started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      })
      setUpEventListeners();
    }
  }



})(budgetController, UIController);


controller.init()
