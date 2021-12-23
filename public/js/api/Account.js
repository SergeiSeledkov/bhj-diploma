/**
 * Класс Account наследуется от Entity.
 * Управляет счетами пользователя.
 * Имеет свойство URL со значением '/account'
 * */
class Account extends Entity {
  /**
   * Получает информацию о счёте
   * */
  static url = '/account';

  static get(id = '', callback) {
    createRequest({
      data: { id: id },
      method: 'GET',
      url: this.url + '/' + id,
      callback
    });
  }
}
