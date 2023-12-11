function previewProfilePhoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.profile-photo-preview img').attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function getTz() {
    let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz ? tz : "UTC"
}


let hasBusinessHours = false
let businessHours = false
document.addEventListener('DOMContentLoaded', function() {
    
    function renderCalender() {
        var calendarEl = document.getElementById('manage-schedules');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            themeSystem: 'bootstrap5',
            initialView: 'timeGridWeek',
            timeZone: getTz(),
            fixedWeekCount: false,
            // showNonCurrentDates: true,
            firstDay: document.getElementById("f_day").value,
            headerToolbar: { center: 'timeGridWeek,timeGridDay', },
            views: {
                dayGridMonth: { // name of view
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                },
                timeGridWeek: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                }
            },
            validRange: function(nowDate) {
                return {
                    start: nowDate, //grey out areas
                }
            },
            events: {
                url: "/dashboard/events",
                method: 'GET',
                // color: 'yellow',    // an option!
                // textColor: 'black',  // an option!
                extraParams: {
                    type: 'schedule',
                },
                failure: function() {
                    console.log('there was an error while fetching events!');
                },
            },
            eventClick: function(arg) {
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
                            body: JSON.stringify({id: arg.event.id})
                        });
                        const content = await rawResponse.json();

                        console.log(content);
                    })();
                }
            },
            eventColor: '#008000',
            navLinks: true,
            selectable: true,
            selectMirror: true,
            select: function(info) {
                const [start_date, start_time] = [info.start.toISOString().slice(0, 10), info.start.toISOString().slice(11, 16)]
                const [end_date, end_time] = [info.end.toISOString().slice(0, 10), info.end.toISOString().slice(11, 16)]
                
                document.getElementById('id_start_date').value = start_date
                document.getElementById('id_start_time').value = start_time
                document.getElementById('id_end_date').value = end_date
                document.getElementById('id_end_time').value = end_time
                document.getElementById('utz').value = getTz()

                const e = info.jsEvent

                setTimeout(() => {
                    $('#manage-schedule-modal').modal({
                        show: true
                    }) 
                }, 500);
                $('#manage-schedule-modal').on('hidden.bs.modal', function (e) {
                    calendar.unselect()
                    calendar.scrollToTime(2)
                })
            
            },
            selectOverlap: function(event) {
                return false
            },
            unselectAuto: false,
            nowIndicator: true,
            businessHours: hasBusinessHours ? businessHours : false,
            // selectConstraint:  hasBusinessHours ? "businessHours" : null,
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