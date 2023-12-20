let hasBusinessHours = false
let businessHours = false
document.addEventListener('DOMContentLoaded', function() {
    function getTz() {
        let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz ? tz : "UTC"
    }
    function renderCalender() {
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
                url: "/dashboard/events",
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
                        const myModal = new bootstrap.Modal(myModalEl)
                        myModal.show()
            
                            myModalEl.addEventListener('hidden.bs.modal', event => {
                                myModal.hide()
                                calendar.unselect()
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
    // setTimeout(() => {
    //     const myModalEl = document.getElementById('meet-modal')
    //     const myModal = new bootstrap.Modal(myModalEl)
    //     myModal.show()
    // }, 500);
    
}); 