document.addEventListener('DOMContentLoaded', () => {
    // Функция блокировки/разблокировки кнопок при пустом/заполненном input
    function activeOrPassiveButton(form, button) {
        form.addEventListener('input', () => {
            if (form.checkValidity()) {
                button.classList.remove('form__button-block');
                button.classList.add('form__button-access');
            } else {
                button.classList.remove('form__button-access');
                button.classList.add('form__button-block');
            };
        });
    };

    // Функция добавления ошибок
    function addErrors(input, inputError) {
        input.classList.add('form__input-incorrect');
        inputError.classList.add('form__inputComment-active');
    };

    // Функция очистки ошибок
    function clearErrors(form, inputs, inputErrors) {
        form.addEventListener('input', () => {
            inputs.forEach((element) => {
                element.classList.remove('form__input-incorrect');
            });

            inputErrors.forEach((element) => {
                element.classList.remove('form__inputComment-active');
            });
        });
    };

    // Функция валидации почты
    function validityEmail(email) {
        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(String(email).toLowerCase());
    };

    function checkPassword(password) {
        if (password.length < 8) {
            return false;
        } else {
            return true;
        }
    };


    let regButton = document.querySelector('.form__button'),
        regForm = document.querySelector('form');

    let checkEmail = false,
        checkPass = false,
        checkPassConfirm = false,

        regInputEmail = document.querySelector('[name="email-reg"]'),
        regInputEmailError = document.querySelector('[data-inputProperty="email-reg"]'),

        regInputName = document.querySelector('[name="name-reg"]'),
        regInputSurname = document.querySelector('[name="surname-reg"]'),
        regInputLastname = document.querySelector('[name="lastname-reg"]'),

        regInputPassword = document.querySelector('[name="password-reg"]'),
        regInputPasswordError = document.querySelector('[data-inputProperty="password-reg"]'),

        regInputPasswordConfirm = document.querySelector('[name="passwordRepeat-reg"]'),
        regInputPasswordConfirmError = document.querySelector('[data-inputProperty="passwordRepeat-reg"]');

    let userData = {
        'email': '',
        'name': '',
        'surname': '',
        'lastname': '',
        'password': ''
    };

    activeOrPassiveButton(regForm, regButton);
    clearErrors(
        regForm,
        [regInputEmail, regInputPassword, regInputPasswordConfirm],
        [regInputEmailError, regInputPasswordError, regInputPasswordConfirmError]
    );

    regButton.addEventListener('click', (event) => {
        event.preventDefault();

        if ((!(event.target.classList.contains('form__button-block')))) {

            if ((validityEmail(regInputEmail.value)) && (checkPassword(regInputPassword.value)) && (regInputPassword.value === regInputPasswordConfirm.value)) {
                userData.email = regInputEmail.value;
                userData.name = regInputName.value;
                userData.surname = regInputSurname.value;
                userData.lastname = regInputLastname.value;
                userData.password = regInputPassword.value;

                let result = document.querySelector(".form__result");
                result.innerHTML = 'Загрузка...'

                fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                }).then((data) => {
                    return data.json();
                }).then((data) => {
                    if (data.status == '200') {
                        result.innerHTML = 'Регистрация прошла успешно! Вы будете перенаправлены на страницу авторизации.';
                        setTimeout(function() {
                            window.location.replace(data.link);
                        }, 1000)
                    } else if (data.status == '500') {
                        result.innerHTML = 'Произошла ошибка на сервере!';
                    } else if (data.status == '409') {
                        result.innerHTML = 'Пользователь с таким Email уже существует!';
                    };
                });
            };
        };
    });
});