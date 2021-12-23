/**
 * Основная функция для совершения запросов
 * на сервер.
 * */

const createRequest = (options = {}) => {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    xhr.responseType = 'json';

    if (options.method !== 'GET') {
        for (let item in options.data) {
            formData.append(item, options.data[item]);
        }
    } else {
        let dataInUrl = '';
        let arr = [];

        for (let item in options.data) {
            arr.push(item + '=' + options.data[item]);
        }

        dataInUrl = arr.join('&');
        options.url = options.url + '?' + dataInUrl;
    }

    try {
        xhr.open(options.method, options.url);
        xhr.send(formData);
    }
    catch (e) {
        options.callback(e);
    }

    xhr.onload = function () {
        let response = null;
        let error = null;

        if (xhr.status != 200) {
            error = xhr.statusText;
        } else {
            response = xhr.response;
        }

        options.callback(error, response);
    }
};