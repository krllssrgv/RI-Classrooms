document.addEventListener('DOMContentLoaded', () => {
    function createMeeting(element, location) {
        let meetingContainer = document.createElement('div');
        meetingContainer.classList.add('daily__action');

        let meetingTitle = document.createElement('div');
        meetingTitle.classList.add('daily__action-title');
        meetingTitle.innerHTML = 'Тема:' +  element.title;

        let meetingDate = document.createElement('div');
        meetingDate.classList.add('daily__action-location');
        meetingDate.innerHTML = 'Дата проведения:' + element.date;

        let meetingTime = document.createElement('div');
        meetingDate.classList.add('daily__action-location');
        meetingDate.innerHTML = 'Время проведения:' + element.time;

        let meetingClassroom = document.createElement('div');
        meetingClassroom.classList.add('daily__action-location');
        meetingClassroom.innerHTML = 'Аудитория:' + element.classroom;

        let meetingStatus = document.createElement('div');
        meetingStatus.classList.add('daily__action-location');
        meetingStatus.innerHTML = 'Статус встречи:' + element.status;

        let meetingLine = document.createElement('div');
        meetingLine.classList.add('daily__action-line');

        let meetingDescr = document.createElement('div');
        meetingDescr.classList.add('daily__action-descr');
        meetingDescr.innerHTML = element.descr.replaceAll("\n", "<br>");


        meetingContainer.append(meetingTitle);
        meetingContainer.append(meetingDate);
        meetingContainer.append(meetingTime);
        meetingContainer.append(meetingClassroom);
        meetingContainer.append(meetingStatus);
        meetingContainer.append(meetingLine);
        meetingContainer.append(meetingDescr);

        location.append(meetingContainer);
    };


    function getMeetings(newDate) {
        fetch('', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({'date': newDate})
        }).then((data) => {
            return data.json();
        }).then((data) => {
            if (document.querySelector('.daily__nothing')) {
                meetingContainer.removeChild(nothingToFound);
            };

            document.querySelectorAll('.daily__action').forEach((element) => {
                element.remove();
            });

            if (data.length == 0) {
                meetingContainer.append(nothingToFound);
            } else {
                for (let i = 0; i < data.length; i++) {
                    (createMeeting(data[i], meetingContainer));
                };
            };
        }).catch(() => {
            console.log('Error');
        });
    };


    function createCalendar() {
        let date = new Date(),
            year = date.getFullYear(),
            month = (date.getMonth()) + 1,
    
            day = (new Date(year, month - 1, 1)).getDay(),
            daysCount = 0,
            parent = document.querySelector('.calendar');
    
        if (day == 0) {
            day = 7;
        }
    
        if ([1,3,5,7,8,10,12].includes(month)) {
            daysCount = 31;
        } else if ([4,6,9,11].includes(month)) {
            daysCount = 30;
        } else if (month == 2) {
            if (year % 4 == 0) {
                daysCount = 28;
            } else {
                daysCount = 28;
            }
        };
    
    
        for (let j = 0; j < (day - 1); j++) {
            let emptyDay = document.createElement('div');
            parent.append(emptyDay);
        };
    
        for (let i = 1; i < daysCount + 1; i++) {
            let currentDay = document.createElement('div');
            currentDay.classList.add('calendar__day');
            currentDay.setAttribute('data-date', String((new Date(year, month - 1, i)).getTime()));
            if (i == date.getDate()) {
                currentDay.classList.add('calendar__day-today');
            };
            currentDay.innerHTML = String(i);
            parent.append(currentDay);
        };
    };

    
    function actCalendar() {
        document.querySelector('.calendar').addEventListener('click', (event) => {
            if (event.target.classList.contains('calendar__day')) {
                document.querySelector('[data-type="date"]').reset();
                getMeetings(event.target.getAttribute('data-date'));
            };
        });
    };


    createCalendar();
    actCalendar();

    let dateInput = document.querySelector('.daily__choseDate'),
        meetingContainer = document.querySelector('.daily__meetings');
    
    let nothingToFound = document.createElement('p');
    nothingToFound.classList.add('daily__nothing');
    nothingToFound.innerHTML = 'Нет запланированных встреч на эту дату :(';

    dateInput.addEventListener('input', () => {
        let newDate = (new Date(dateInput.value)).getTime();
        getMeetings(newDate);
    });
})