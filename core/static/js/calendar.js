let hasBusinessHours = false
let businessHours = false
document.addEventListener('DOMContentLoaded', function () {
    function getTz() {
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz ? tz : "UTC"
    }
    function renderCalender() {
        var calendarEl = document.getElementById('manage-schedules');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            themeSystem: 'bootstrap5',
            initialView: 'timeGridWeek',
            longPressDelay: 200,
            selectLongPressDelay: 200,
            timeZone: getTz(),
            fixedWeekCount: false,
            firstDay: document.getElementById("f_day").value,
            headerToolbar: { center: 'timeGridWeek,timeGridDay', },
            views: {
                dayGridMonth: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                },
                timeGridWeek: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                }
            },
            validRange: function (nowDate) {
                return {
                    start: nowDate, //grey out areas
                }
            },
            events: {
                url: "/dashboard/events",
                method: 'GET',
                extraParams: {
                    type: 'schedule',
                },
                failure: function () {
                    console.log('there was an error while fetching events!');
                },
            },
            eventClick: function (arg) {
                const token = document.getElementsByName('csrfmiddlewaretoken')[0].value
                if (confirm('Do you wish to delete this event?')) {
                    (async () => {
                        arg.event.remove()
                        const rawResponse = await fetch('/dashboard/events/detach', {
                            method: 'post',
                            credentials: 'same-origin',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'X-CSRFToken': token
                            },
                            body: JSON.stringify({ id: arg.event.id })
                        });
                        const content = await rawResponse.json();
                    })();
                }
            },
            eventColor: '#008000',
            navLinks: true,
            selectable: true,
            selectMirror: true,
            select: function (info) {
                const [start_date, start_time] = [info.start.toISOString().slice(0, 10), info.start.toISOString().slice(11, 16)]
                const [end_date, end_time] = [info.end.toISOString().slice(0, 10), info.end.toISOString().slice(11, 16)]

                document.getElementById('id_start_date').value = start_date
                document.getElementById('id_start_time').value = start_time
                document.getElementById('id_end_date').value = end_date
                document.getElementById('id_end_time').value = end_time
                document.getElementById('utz').value = getTz()

                const e = info.jsEvent

                setTimeout(() => {
                    const myModalEl = document.getElementById('manage-schedule-modal')
                    const myModal = new bootstrap.Modal(myModalEl)
                    myModal.show()

                    myModalEl.addEventListener('hidden.bs.modal', event => {
                        calendar.unselect()
                        myModal.hide()
                    })
                }, 900);
            },
            selectOverlap: function (event) {
                return false
            },
            unselectAuto: false,
            nowIndicator: true,
            businessHours: hasBusinessHours ? businessHours : false,
        });
        calendar.render();
    }

    // pull NBH
    async function getNbh() {
        await fetch("/dashboard/events/business-hours", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json()
        }).then((data) => {
            if (data.length > 0) {
                hasBusinessHours = true
                businessHours = data
            }
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            renderCalender()
        })
    }

    getNbh()

    const buttons = document.querySelectorAll('.r-bh');
    buttons.forEach(function (btn) {
        btn.addEventListener('click', function (event) {
            const token = document.getElementsByName('csrfmiddlewaretoken')[0].value
            const id = btn.dataset.id;
            const p = document.getElementById("bh-" + id)
            if (confirm('Do you wish to delete this business hour?')) {
                p.style.display = "none";
                (async () => {
                    const rawResponse = await fetch('/dashboard/events/business-hours/detach', {
                        method: 'post',
                        credentials: 'same-origin',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-CSRFToken': token
                        },
                        body: JSON.stringify({ id: id })
                    });
                })();
            }
        });
    });

}); 