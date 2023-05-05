document.addEventListener('DOMContentLoaded', () => {
    let title = document.querySelector('[name="title"]'),
        date = document.querySelector('[name="date"]'),
        classroom = document.querySelector('[name="classroom"]'),
        time = document.querySelector('[name="time"]'),
        status = document.querySelector('[name="status"]'),
        descr = document.querySelector('[name="descr"]'),
        
        saveStatus = document.querySelector('.meet__saving');
    
    const saveButton = document.querySelector('.meet__save'),
          deleteButton = document.querySelector('.meet__delete');

    
    let currentDate = new Date(Number(meeting.date)),
        day = currentDate.getDate(),
        month = currentDate.getMonth() + 1,
        year = currentDate.getFullYear();

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;

    let currentDateToForm = year + "-" + month + "-" + day;      

    date.value = currentDateToForm;

    document.querySelector(`[value="${meeting.classroom}"]`).selected = true;
    document.querySelector(`[value="${meeting.status}"]`).selected = true;

    saveButton.addEventListener('click', (event) => {
        event.preventDefault();

        let meetingData = {
            'act': 'change',
            'title': title.value,
            'date': (new Date(date.value)).getTime(),
            'classroom': classroom.value,
            'time': time.value,
            'status': status.value,
            'descr': descr.value
        };

        saveStatus.innerHTML = 'Загрузка...'

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
                saveStatus.innerHTML = 'Встреча успешно отредактирована!'
                setTimeout(function() {
                    saveStatus.innerHTML = '';
                }, 1000);
            } else if (data.status == '500') {
                saveStatus.innerHTML = 'Ошибка на сервере!';
            };
        }).catch(() => {
            saveStatus.innerHTML = 'Ошибка!';
        });
    });

    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();

        fetch('', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({'act': 'delete'})
        }).then((data) => {
            return data.json()
        }).then((data) => {
            if (data.status == '200') {
                saveStatus.innerHTML = 'Встреча успешно удалена! Вы будете перенаправлены на страницу управления!'
                setTimeout(function() {
                    window.location.replace(data.url);
                }, 1000);
            } else if (data.status == '500') {
                saveStatus.innerHTML = 'Ошибка на сервере!';
            };
        }).catch(() => {
            saveStatus.innerHTML = 'Ошибка!';
        });
    });
})