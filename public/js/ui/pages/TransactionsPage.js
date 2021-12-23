//const e = require("express");

/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error('Ошибка!');
    }

    this.element = element;
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    if (this.lastOptions) {
      this.render(this.lastOptions);
    }
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    document.querySelector('.remove-account').onclick = () => {
      this.removeAccount();
    }
    document.querySelector('.content').onclick = event => {
      if (event.target.classList.contains('transaction__remove')) {
        this.removeTransaction(event.target.dataset['id']);
      }
      else {
        if (event.target.closest('.transaction__remove')) {
          this.removeTransaction(event.target.closest('.transaction__remove').dataset['id']);
        }
      }
    };

  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets(),
   * либо обновляйте только виджет со счетами
   * для обновления приложения
   * */
  removeAccount() {
    if (this.lastOptions) {
      let confirmDeleteAccount = confirm('Удалить счет?');

      if (confirmDeleteAccount) {
        Account.remove({ id: this.lastOptions.account_id }, (error, response) => {
          this.clear();

          if (!error) {
            App.updateWidgets();
          }
        });
      }
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction(id) {
    let confirmDeleteTransaction = confirm('Удалить транзакцию?');

    if (confirmDeleteTransaction) {
      Transaction.remove({ id }, (error, response) => {
        if (!error) {
          App.update();
        }
      });
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options) {
    const user = User.current();

    this.lastOptions = options;
    Account.get(options.account_id, (error, response) => {
      if (!error) {
        this.renderTitle(response.data.name);
      }
    });


    if (user) {
      const data = { mail: user.email, account_id: options.account_id };

      Transaction.list(data, (error, response) => {
        this.renderTransactions(response.data);
      });
    }
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle('Название счета');
    this.lastOptions = null;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name) {
    document.querySelector('.content-title').textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    const newDate = new Date(date);
    const monthArr = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const fullDate = newDate.getDate() + ' ' + monthArr[newDate.getMonth()] + ' ' + newDate.getFullYear() + 'г. в ' + newDate.getHours() + ':' + newDate.getMinutes();

    return fullDate;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item) {
    const formatedDate = this.formatDate(item.created_at);
    const transactionType = (item.type == 'income') ? 'transaction_income' : 'transaction_expense';

    return `<div class="transaction ${transactionType} row">
        <div class="col-md-7 transaction__details">
          <div class="transaction__icon">
              <span class="fa fa-money fa-2x"></span>
          </div>
          <div class="transaction__info">
              <h4 class="transaction__title">${item.name}</h4>
              <!-- дата -->
              <div class="transaction__date">${formatedDate}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="transaction__summ">${item.sum}<span class="currency">₽</span>
          </div>
        </div>
        <div class="col-md-2 transaction__controls">
            <!-- в data-id нужно поместить id -->
            <button class="btn btn-danger transaction__remove" data-id="${item.id}">
                <i class="fa fa-trash"></i>  
            </button>
        </div>
    </div>`
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data) {
    const contentElement = document.querySelector('.content');

    contentElement.innerHTML = '';

    for (let i of data) {
      let transaction = this.getTransactionHTML(i);
      let divElement = document.createElement('div');

      divElement.innerHTML = transaction;
      contentElement.appendChild(divElement.firstChild);
    }
  }
}