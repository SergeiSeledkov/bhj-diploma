/**
 * Класс AccountsWidget управляет блоком
 * отображения счетов в боковой колонке
 * */

class AccountsWidget {
  /**
   * Устанавливает текущий элемент в свойство element
   * Регистрирует обработчики событий с помощью
   * AccountsWidget.registerEvents()
   * Вызывает AccountsWidget.update() для получения
   * списка счетов и последующего отображения
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * */
  constructor(element) {
    if (!element) {
      throw new Error('В конструктор передан пустой элемент!');
    }

    this.element = element;
    this.registerEvents();
    this.update();
  }

  /**
   * При нажатии на .create-account открывает окно
   * #modal-new-account для создания нового счёта
   * При нажатии на один из существующих счетов
   * (которые отображены в боковой колонке),
   * вызывает AccountsWidget.onSelectAccount()
   * */
  registerEvents() {
    const accountCollection = document.querySelectorAll('.account');

    document.querySelector('.create-account').onclick = function () {
      App.getModal('createAccount').open();
    };

    for (let i of accountCollection) {
      i.onclick = () => {
        this.onSelectAccount(i);
      };
    }
  }

  /**
   * Метод доступен только авторизованным пользователям
   * (User.current()).
   * Если пользователь авторизован, необходимо
   * получить список счетов через Account.list(). При
   * успешном ответе необходимо очистить список ранее
   * отображённых счетов через AccountsWidget.clear().
   * Отображает список полученных счетов с помощью
   * метода renderItem()
   * */
  update() {
    const user = User.current();

    if (user && user.id) {
      const data = {
        mail: user.email
      };
      const callback = (error, response) => {
        if (!error) {
          this.clear();
        }
        for (let i of response.data) {
          this.renderItem(i);
        }
        this.registerEvents();
      }

      createRequest({
        data,
        method: 'GET',
        url: '/account',
        callback
      });
    }
  }

  /**
   * Очищает список ранее отображённых счетов.
   * Для этого необходимо удалять все элементы .account
   * в боковой колонке
   * */
  clear() {
    const accountCollection = document.querySelectorAll('.account');

    for (let i of accountCollection) {
      i.remove();
    }
  }

  /**
   * Срабатывает в момент выбора счёта
   * Устанавливает текущему выбранному элементу счёта
   * класс .active. Удаляет ранее выбранному элементу
   * счёта класс .active.
   * Вызывает App.showPage( 'transactions', { account_id: id_счёта });
   * */
  onSelectAccount(element) {
    const accountCollection = document.querySelectorAll('.account');

    for (let i of accountCollection) {
      i.classList.remove('active');
    }

    element.classList.add('active');
    App.showPage('transactions', { account_id: element.dataset['id'] });
  }

  /**
   * Возвращает HTML-код счёта для последующего
   * отображения в боковой колонке.
   * item - объект с данными о счёте
   * */
  getAccountHTML(item) {
    return `<li class="account" data-id="${item.id}">
              <a href="#">
                <span>${item.name}</span> /
                <span>${item.sum} ₽</span>
              </a>
            </li>`;
  }

  /**
   * Получает массив с информацией о счетах.
   * Отображает полученный с помощью метода
   * AccountsWidget.getAccountHTML HTML-код элемента
   * и добавляет его внутрь элемента виджета
   * */
  renderItem(data) {
    const divElement = document.createElement('div');

    divElement.innerHTML = this.getAccountHTML(data);
    this.element.appendChild(divElement.firstChild);
  }
}
