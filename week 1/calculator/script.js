class MatrixCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.matrixBg = document.getElementById('matrix-bg');
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.shouldResetDisplay = false;
        
        this.init();
    }
    
    init() {
        // Number buttons
        document.querySelectorAll('.btn-number').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleNumber(btn.dataset.number);
            });
        });
        
        // Operator buttons
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleOperator(btn.dataset.operator);
            });
        });
        
        // Action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleAction(btn.dataset.action);
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    handleNumber(num) {
        if (this.shouldResetDisplay) {
            this.currentInput = '0';
            this.shouldResetDisplay = false;
        }
        
        if (num === '.' && this.currentInput.includes('.')) {
            return;
        }
        
        if (this.currentInput === '0' && num !== '.') {
            this.currentInput = num;
        } else {
            this.currentInput += num;
        }
        
        this.updateDisplay();
    }
    
    handleOperator(op) {
        if (this.previousInput !== null && this.operator && !this.shouldResetDisplay) {
            this.calculate();
        }
        
        this.previousInput = this.currentInput;
        this.operator = op;
        this.shouldResetDisplay = true;
    }
    
    handleAction(action) {
        switch(action) {
            case 'clear':
                this.clear();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'equals':
                this.equals();
                break;
        }
    }
    
    calculate() {
        if (this.previousInput === null || this.operator === null) {
            return;
        }
        
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let result;
        
        switch(this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.displayError();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        // Round to avoid floating point errors
        result = Math.round(result * 100000000) / 100000000;
        
        this.currentInput = result.toString();
        this.previousInput = null;
        this.operator = null;
        this.updateDisplay();
    }
    
    equals() {
        if (this.previousInput !== null && this.operator) {
            this.calculate();
            this.triggerMatrixAnimation();
        }
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
        this.stopMatrixAnimation();
    }
    
    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }
    
    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }
    
    displayError() {
        this.currentInput = 'Error';
        this.updateDisplay();
        setTimeout(() => {
            this.clear();
        }, 2000);
    }
    
    updateDisplay() {
        // Format large numbers
        let displayValue = this.currentInput;
        if (displayValue.length > 12) {
            displayValue = parseFloat(displayValue).toExponential(6);
        }
        this.display.textContent = displayValue;
    }
    
    triggerMatrixAnimation() {
        this.matrixBg.classList.add('active');
        this.createMatrixColumns();
        
        // Stop animation after 3 seconds
        setTimeout(() => {
            this.stopMatrixAnimation();
        }, 3000);
    }
    
    stopMatrixAnimation() {
        this.matrixBg.classList.remove('active');
        // Clear existing columns after fade out
        setTimeout(() => {
            this.matrixBg.innerHTML = '';
        }, 500);
    }
    
    createMatrixColumns() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const columnCount = Math.floor(window.innerWidth / 20);
        
        for (let i = 0; i < columnCount; i++) {
            const column = document.createElement('div');
            column.className = 'matrix-column';
            column.style.left = `${(i * 100) / columnCount}%`;
            column.style.animationDelay = `${Math.random() * 2}s`;
            
            // Create random characters
            let text = '';
            const charCount = Math.floor(Math.random() * 20) + 10;
            for (let j = 0; j < charCount; j++) {
                text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
            }
            column.innerHTML = text;
            
            this.matrixBg.appendChild(column);
        }
    }
    
    handleKeyboard(e) {
        // Prevent default for calculator keys
        if (/[0-9+\-*/.=]/.test(e.key) || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Escape') {
            e.preventDefault();
        }
        
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            this.handleNumber(e.key);
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            const operatorMap = {
                '+': '+',
                '-': '−',
                '*': '×',
                '/': '÷'
            };
            this.handleOperator(operatorMap[e.key]);
        } else if (e.key === 'Enter' || e.key === '=') {
            this.equals();
        } else if (e.key === 'Backspace') {
            this.backspace();
        } else if (e.key === 'Escape') {
            this.clear();
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MatrixCalculator();
});

