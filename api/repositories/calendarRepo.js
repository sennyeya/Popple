const {google} = require("googleapis");

const calendar = google.calendar({version: 'v3'});

const Calendar = require('../schema/calendar');

const CalendarStudentJoin = require("../schema/calendarStudentJoin")

module.exports = {
    getItem: async (id)=>{
        try{
            var events = await calendar.events.list({
                calendarId: id || 'primary',
                timeMin: (new Date()).toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            return events.data.items;
        }catch(err){
            console.log(err)
        }
    },

    getAllCalendars: async (id)=>{
        var joinElems = await CalendarStudentJoin.find({studentId:id}).exec();
        var items = await Calendar.find({studentId:id}).exec();
        items = items.concat(await Calendar.find({id:{$in:joinElems.map(e=>e.calendarId)}}).exec())
        var cals = [];
        for(let item of items){
            try{
                cals.push((await calendar.calendars.get({calendarId:item.googleId})).data)
            }catch(err){
                console.log(err)
            }
        }
         return [{summary:"Personal", id:""}, ...cals]
    },
    
    getUserCalendars: async ()=>{
        return (await calendar.calendarList.list({})).data.items;
    },

    getLocalCalendarOptions: async (id)=>{
        var items = await Calendar.find({studentId:{$nin:[id]}}).exec();
        return items;
    },

    addCalendar: async (studentId, calendarId)=>{
        await CalendarStudentJoin.create({studentId:studentId, calendarId:calendarId})
        var cal = await calendar.calendarList.insert({requestBody:{id:calendarId}})
        console.log(cal.data)
    },

    shareCalendar: async (studentId, calendarId)=>{
        await Calendar.create({studentId:studentId, googleId:calendarId, type:"Google", name:(await calendar.calendars.get({calendarId:calendarId})).data.summary})
        var acl = await calendar.acl.insert({calendarId:calendarId, requestBody:{role:"reader", scope:{type:"domain", value:"email.arizona.edu"}}})
    }
}