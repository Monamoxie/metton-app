let hasBusinessHours = false
let businessHours = false
document.addEventListener('DOMContentLoaded', function() {
    function getTz() {
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz ? tz : "UTC"
    }
    function renderCalender() {
        var calendarEl = document.getElementById('manage-schedules');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            themeSystem: 'bootstrap5',
            initialView: 'timeGridWeek',
            timeZone: getTz(),
            longPressDelay: 200,
            selectLongPressDelay: 200,
            fixedWeekCount: 2,
            headerToolbar: { center: 'timeGridWeek,dayGridMonth', },
            views: {
                dayGridMonth: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                },
                timeGridWeek: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                }
            },
            events: {
                url: "/dashboard/events",
                method: 'GET',
                extraParams: {
                    type: 'schedule',
                },
                failure: function() {
                    console.log('there was an error while fetching events!');
                },
            },
            eventClick: function(arg) {
                
                const info = arg.event
               
                
                const [start_date, start_time] = [info.start.toISOString().slice(0, 10), info.start.toISOString().slice(11, 16)]
                const [end_date, end_time] = [info.end.toISOString().slice(0, 10), info.end.toISOString().slice(11, 16)]
                
                document.getElementById('eventTitle').innerHTML = info.title
                document.getElementById('eventStart').innerHTML = start_date + ' ' + start_time
                document.getElementById('eventEnd').innerHTML = end_date + ' ' + end_time
                if (info.extendedProps) {
                    const timetable = info.extendedProps.timetable
                    document.getElementById('eventFreq').innerHTML = 'Every:  ' + timetable
                }
                // document.getElementById('id_end_time').value = end_time

                // const e = info.jsEvent

                setTimeout(() => {
                    const myModalEl = document.getElementById('appointment-modal')
                    const myModal = new bootstrap.Modal(myModalEl)
                    myModal.show()
          
                    myModalEl.addEventListener('hidden.bs.modal', event => {
                        myModal.hide()
                    })
                }, 500);
            },
            eventColor: '#008000',
            navLinks: true,
            selectable: false,
            selectMirror: false,
            unselectAuto: false,
            nowIndicator: true,
            businessHours: hasBusinessHours ? businessHours : false,
            selectConstraint:  hasBusinessHours ? "businessHours" : null,
        });
        calendar.render(); 
    }

    // pull NBH
    async function getNbh() {
        await fetch("/dashboard/business-hours", {
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
    buttons.forEach(function(btn) {
        btn.addEventListener('click', function(event) {
            const token = document.getElementsByName('csrfmiddlewaretoken')[0].value
            const id = btn.dataset.id;
            const p = document.getElementById("bh-" + id)
            p.style.display = "none"
            if (confirm('Do you wish to delete this business hour?')) {
                (async () => {
                    const rawResponse = await fetch('/dashboard/business-hours/detach', {
                        method: 'post',
                        credentials: 'same-origin',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-CSRFToken': token
                        },
                        body: JSON.stringify({id: id})
                    });
                    const content = await rawResponse.json();
                })();
            }
        });
    });
    
}); 