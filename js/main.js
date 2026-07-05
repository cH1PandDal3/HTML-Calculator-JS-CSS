const calculator = document.querySelector('.calculator');
const display = calculator.querySelector('.calculator__display');
const keys = calculator.querySelector('.calculator__keys');

const getKeyType = (key) => {
    const { action } = key.dataset;
    if (!action) return 'number';
    if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide') return 'operator';
    return action;
};

const calculate = (n1, operator, n2) => {
    const firstNum = parseFloat(n1);
    const secondNum = parseFloat(n2);
    if (operator === 'add') return firstNum + secondNum;
    if (operator === 'subtract') return firstNum - secondNum;
    if (operator === 'multiply') return firstNum * secondNum;
    if (operator === 'divide') return firstNum / secondNum;
    return 0;
};

const createResultString = (key, displayedNum, state) => {
    const keyType = getKeyType(key);
    const keyContent = key.textContent;
    const { firstValue, modValue, operator, previousKeyType } = state;

    switch (keyType) {
        case 'number':
            return handleNumberKey(displayedNum, previousKeyType, keyContent);
        
        case 'decimal':
            return handleDecimalKey(displayedNum, previousKeyType);
        
        case 'operator':
            return handleOperatorKey(firstValue, operator, previousKeyType, displayedNum);
        
        case 'clear':
            return '0';
        
        case 'calculate':
            return handleCalculateKey(firstValue, operator, modValue, previousKeyType, displayedNum);
        
        default:
            return displayedNum;
    }
};

const handleNumberKey = (displayedNum, previousKeyType, keyContent) => {
    const shouldReplace = displayedNum === '0' || 
                         previousKeyType === 'operator' || 
                         previousKeyType === 'calculate';
    return shouldReplace ? keyContent : displayedNum + keyContent;
};

const handleDecimalKey = (displayedNum, previousKeyType) => {
    if (!displayedNum.includes('.')) {
        return displayedNum + '.';
    }
    if (previousKeyType === 'operator' || previousKeyType === 'calculate') {
        return '0.';
    }
    return displayedNum;
};

const handleOperatorKey = (firstValue, operator, previousKeyType, displayedNum) => {
    const canCalculate = firstValue && 
                         operator && 
                         previousKeyType !== 'operator' && 
                         previousKeyType !== 'calculate';
    
    return canCalculate 
        ? calculate(firstValue, operator, displayedNum)
        : displayedNum;
};

const handleCalculateKey = (firstValue, operator, modValue, previousKeyType, displayedNum) => {
    if (!firstValue) {
        return displayedNum;
    }

    if (previousKeyType === 'calculate') {
        return calculate(displayedNum, operator, modValue);
    } else {
        return calculate(firstValue, operator, displayedNum);
    }
};

const updateCalculatorState = (key, calculator, calculatedValue, displayedNum) => {
    const keyType = getKeyType(key);
    const dataset = calculator.dataset;
    const { firstValue, modValue, operator, previousKeyType } = dataset;

    dataset.previousKeyType = keyType;

    switch (keyType) {
        case 'operator':
            updateOperatorState(key, dataset, firstValue, operator, previousKeyType, calculatedValue, displayedNum);
            break;
        
        case 'clear':
            updateClearState(key, dataset);
            break;
        
        case 'calculate':
            updateCalculateState(dataset, firstValue, modValue, previousKeyType, displayedNum);
            break;
    }
};

const updateOperatorState = (key, dataset, firstValue, operator, previousKeyType, calculatedValue, displayedNum) => {
    dataset.operator = key.dataset.action;
    
    const shouldCalculate = firstValue && 
                           operator && 
                           previousKeyType !== 'operator' && 
                           previousKeyType !== 'calculate';
    
    dataset.firstValue = shouldCalculate ? calculatedValue : displayedNum;
};

const updateClearState = (key, dataset) => {
    if (key.textContent === 'AC') {
        dataset.firstValue = '';
        dataset.modValue = '';
        dataset.operator = '';
        dataset.previousKeyType = '';
    } else {
        key.textContent = 'AC';
    }
};

const updateCalculateState = (dataset, firstValue, modValue, previousKeyType, displayedNum) => {
    dataset.modValue = (firstValue && previousKeyType === 'calculate') 
        ? modValue 
        : displayedNum;
};

const updateVisualState = (key, calculator) => {
    const keyType = getKeyType(key);
    const clearButton = calculator.querySelector('[data-action=clear]');

    const allKeys = key.parentNode.children;
    Array.from(allKeys).forEach(k => k.classList.remove('is-depressed'));

    if (keyType === 'operator') {
        key.classList.add('is-depressed');
    }

    if (keyType === 'clear') {
        if (key.textContent !== 'AC') {
            key.textContent = 'AC';
        }
    } else {
        clearButton.textContent = 'CE';
    }
};

keys.addEventListener('click', (e) => {
    if (!e.target.matches('button')) return;

    const key = e.target;
    const displayedNum = display.textContent;

    const resultString = createResultString(key, displayedNum, calculator.dataset);

    display.textContent = resultString;

    updateCalculatorState(key, calculator, resultString, displayedNum);
    updateVisualState(key, calculator);
});