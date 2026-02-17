const themeToggleButton = document.getElementById('theme-toggle');
themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.querySelector('lotto-generator').shadowRoot.querySelector('.wrapper').classList.toggle('dark-mode');
});

class LottoGenerator extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const heading = document.createElement('h2');
    heading.textContent = 'Your Lucky Numbers';

    const numbersContainer = document.createElement('div');
    numbersContainer.setAttribute('class', 'numbers');

    const button = document.createElement('button');
    button.textContent = 'Generate Numbers';
    button.addEventListener('click', () => this.generateNumbers(numbersContainer));

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        background-color: #fff;
      }
      .wrapper.dark-mode {
        background-color: #3a3a3a;
        color: #f0f2f5;
        border-color: #555;
      }
      .numbers {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }
      .number {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        margin: 0 5px;
        border-radius: 50%;
        background-color: #f0f0f0;
        font-size: 1.2em;
        font-weight: bold;
        color: #333;
      }
      .wrapper.dark-mode .number {
        color: #333;
      }
      button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        background-color: #007bff;
        color: white;
        font-size: 1em;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      button:hover {
        background-color: #0056b3;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    wrapper.appendChild(heading);
    wrapper.appendChild(numbersContainer);
    wrapper.appendChild(button);

    this.generateNumbers(numbersContainer);
  }

  generateNumbers(container) {
    container.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    for (const number of sortedNumbers) {
      const numberElement = document.createElement('div');
      numberElement.setAttribute('class', 'number');
      numberElement.textContent = number;
      this.colorizeNumber(numberElement, number);
      container.appendChild(numberElement);
    }
  }

  colorizeNumber(element, number) {
    if (number <= 10) {
      element.style.backgroundColor = '#fbc400';
    } else if (number <= 20) {
      element.style.backgroundColor = '#69c8f2';
    } else if (number <= 30) {
      element.style.backgroundColor = '#ff7272';
    } else if (number <= 40) {
      element.style.backgroundColor = '#aaa';
    } else {
      element.style.backgroundColor = '#b0d840';
    }
  }
}

customElements.define('lotto-generator', LottoGenerator);
