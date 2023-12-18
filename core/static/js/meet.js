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
            headerToolbar: { center: 'dayGridMonth', },
            views: {
                dayGridMonth: {
                    titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                }
            },
            validRange: function(nowDate) {
                return {
                    start: document.getElementById('f_day_month').value,
                }
            },
            select: function(info) {
                  
                const [start_date, start_time, today] = [
                    info.start.toISOString().slice(0, 10), 
                    info.start.toISOString().slice(11, 16), 
                    new Date().toISOString().slice(0,10)
                ]
                const [end_date, end_time] = [info.end.toISOString().slice(0, 10), info.end.toISOString().slice(11, 16)]

                if (start_date < today) {
                    console.log('aaa')
                    return false
                } 
                
                // document.getElementById('eventTitle').innerHTML = info.title
                // document.getElementById('eventStart').innerHTML = start_date + ' ' + start_time
                // document.getElementById('eventEnd').innerHTML = end_date + ' ' + end_time
                // if (info.extendedProps) {
                //     const timetable = info.extendedProps.timetable
                //     document.getElementById('eventFreq').innerHTML = 'Every:  ' + timetable
                // }
                // // document.getElementById('id_end_time').value = end_time

                // // const e = info.jsEvent

                // setTimeout(() => {
                //     const myModalEl = document.getElementById('meet-modal')
                //     const myModal = new bootstrap.Modal(myModalEl)
                //     myModal.show()
          
                //     myModalEl.addEventListener('hidden.bs.modal', event => {
                //         myModal.hide()
                //     })
                // }, 500);
            },
            eventColor: '#008000',
            selectOverlap: function(event) {
                return true
            },
            navLinks: false,
            selectable: true,
            selectMirror: true,
            unselectAuto: false,
            nowIndicator: true,
        });
        calendar.render(); 
    }
 
    renderCalender()
    setTimeout(() => {
        const myModalEl = document.getElementById('meet-modal')
        const myModal = new bootstrap.Modal(myModalEl)
        myModal.show()
    }, 500);
    
}); 