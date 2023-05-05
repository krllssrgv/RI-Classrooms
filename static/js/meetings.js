'use strict'
document.addEventListener('DOMContentLoaded', () => {
    function openForm() {
        let windowCreate = document.querySelector(".create"),
            layoutCreate = document.querySelector(".create__background");

        windowCreate.classList.remove("create-hidden");
        layoutCreate.classList.remove("create__background-hidden");
    };

    function closeForm() {
        let windowCreate = document.querySelector(".create"),
            layoutCreate = document.querySelector(".create__background"),
            statusCreate = document.querySelector(".create__status"),
            form = document.querySelector("form");

        windowCreate.classList.add("create-hidden");
        layoutCreate.classList.add("create__background-hidden");
        statusCreate.innerHTML = '';
        form.reset();
    };


    const buttonCreate = document.querySelector(".meetings__button"),
          buttonClose = document.querySelector(".create__close"),
          form = document.querySelector("form"),
          title = document.querySelector('[name="title"]'),
          date = document.querySelector('[name="date"]'),
          classroom = document.querySelector('[name="classroom"]'),
          time = document.querySelector('[name="time"]'),
          descr = document.querySelector('[name="descr"]');

    let windowCreate = document.querySelector(".create"),
        layoutCreate = document.querySelector(".create__background"),
        confirmCreate = document.querySelector(".create__button"),
        statusCreate = document.querySelector(".create__status");

    
    buttonCreate.addEventListener('click', () => {
        openForm();
    });

    buttonClose.addEventListener('click', () => {
        closeForm();
    });

    form.addEventListener('input', () => {
        if (form.checkValidity()) {
            confirmCreate.classList.add("create__button-active");
        } else {
            confirmCreate.classList.remove("create__button-active");
        };
    });

    form.addEventListener('change', () => {
        if (form.checkValidity()) {
            confirmCreate.classList.add("create__button-active");
        } else {
            confirmCreate.classList.remove("create__button-active");
        };
    });


    confirmCreate.addEventListener('click', (event) => {
        event.preventDefault();

        if (confirmCreate.classList.contains("create__button-active")) {
            let meetingData = {
                'type': 'createMeeting',
                'title': title.value,
                'date': (new Date(date.value)).getTime(),
                'time': time.value,
                'classroom': classroom.value,
                'members': [],
                'descr': descr.value
            };

            statusCreate.innerHTML = 'Загрузка...';

            fetch('', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(meetingData)
            }).then((data) => {
                return data.json()
            }).then((data) => {
                if (data.status == '200') {
                    statusCreate.innerHTML = 'Успешно!'
                    setTimeout(closeForm, 1000);
                } else if (data.status == '500') {
                    statusCreate.innerHTML = 'Ошибка на сервере!';
                };
            }).catch(() => {
                statusCreate.innerHTML = 'Ошибка!';
            });
        };
    });
})