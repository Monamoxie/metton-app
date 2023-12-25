const renderCalender = function (pid) {
    var calendarEl = document.getElementById('meet');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        themeSystem: 'bootstrap5',
        initialView: 'dayGridMonth',
        dayHeaders: true,
        longPressDelay: 200,
        selectLongPressDelay: 200,
        timeZone: getTz(),
        headerToolbar: { center: 'dayGridMonth,timeGridDay', end: 'prev,next'},
        views: {
            dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
            },
            timeGridDay: {
                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
            }
        },
        validRange: function(nowDate) {
            return {
                start: document.getElementById('f_day_month').value,
            }
        },
        events: {
            url: "/events/" + pid,
            method: 'GET',
            extraParams: {
                type: 'schedule',
            },
            failure: function() {
                console.log('there was an error fetching events!');
            },
        },
        datesSet: function (dateInfo) {
            var view = dateInfo.view;

            if (view.type == "timeGridDay") {
                calendar.setOption('selectConstraint', hasBusinessHours ? "businessHours" : null)
                calendar.setOption('selectOverlap', false)
            } else {
                calendar.setOption('selectConstraint', null)
                calendar.setOption('selectOverlap', true)
            }
        },
        select: function(info) {
            const [start_date, start_time, today, end_date, end_time] = [
                info.start.toISOString().slice(0, 10), 
                info.start.toISOString().slice(11, 16), 
                new Date().toISOString().slice(0,10),
                info.end.toISOString().slice(0, 10), 
                info.end.toISOString().slice(11, 16)
            ]

            if (start_date < today) {
                return false
            }

            if (calendar.currentData.currentViewType == "dayGridMonth") {
                calendar.changeView('timeGridDay', start_date);
            } else {

                document.getElementById('evtStartTime').innerHTML = setAmPm(start_time)
                document.getElementById('evtStartDate').innerHTML = info.start.toDateString()
                document.getElementById('evtEndTime').innerHTML = setAmPm(end_time)
                document.getElementById('evtEndDate').innerHTML = info.end.toDateString()
                

                setTimeout(() => {
                    const myModalEl = document.getElementById('meet-modal')
                    const bookEl = document.getElementById('booking')
                    const myModal = new bootstrap.Modal(myModalEl)
                    myModal.show()
        
                    myModalEl.addEventListener('hidden.bs.modal', event => {
                        myModal.hide()
                        calendar.unselect()
                    })

                    bookEl.addEventListener('click', event => {
                        // bookEl.setAttribute('disabled', true)
                        // bookEl.innerHTML = 'Please wait...'
                        const frequencyChecks = document.getElementsByName('frequency');
                        const res = document.getElementById('response')
                        const email = document.getElementById('email').value
                        const note = document.getElementById('note').value
                        const title = document.getElementById('title').value
                        let frequencies = [];
                        for (let i = 0; i < frequencyChecks.length; i++) {
                            if (frequencyChecks[i].checked) {
                                frequencies.push(frequencyChecks[i].value)
                            }
                        }
                        
                        const req = (async () => {
                            const rawResponse = await fetch('/meet/' + JSON.parse(document.getElementById('pid').textContent) + '/book', {
                                method: 'post',
                                credentials: 'same-origin',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': document.getElementsByName('csrfmiddlewaretoken')[0].value
                                },
                                body: JSON.stringify({
                                    start_date: start_date,
                                    start_time: start_time,
                                    end_date: end_date,
                                    end_time: end_time,
                                    frequencies: frequencies,
                                    utz: getTz(),
                                    title: title,
                                    email: email,
                                    note: note
                                })
                            }).then((response) => {
                                return response.json()
                            }).then((data) => {
                                if (data.errors.length > 0) {
                                    res.classList.add('alert-danger')
                                    res.innerHTML = '<h6>' + data.message + '</h6> <hr/>'
                                    data.errors.forEach(error => {
                                        res.innerHTML += '<p> <i class="fa fa-warning"></i> ' + error + '</p>'
                                    });
                                } else {
                                    const bookingSection = document.getElementById('booking-section')
                                    bookingSection.classList.add('booking-completed')
                                    bookingSection.innerHTML = '<i class="fa fa-check-circle text-success"></i><p>Booking completed</p>'
                                    
                                    myModal.hide()
                                }
                            }).catch((error) => {
                                console.log(error)
                            });
                        })();
                        
                    })
                }, 500);
            }      
        },
        slotLabelInterval: "00:30",
        eventColor: '#008000',
        selectOverlap: function(event) {
            return true
        },
        navLinks: false,
        selectable: true,
        selectMirror: true,
        unselectAuto: false,
        nowIndicator: true,
        businessHours: hasBusinessHours ? businessHours : false,
    });
    calendar.render();
}
