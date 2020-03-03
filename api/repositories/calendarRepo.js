const {google} = require("googleapis");

const calendar = google.calendar({version: 'v3'});

const Calendar = require('../schema/calendar')

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
        var items = await Calendar.find({sid:id}).exec();
        var cals = [];
        for(let item of items){
            try{
                cals.push((await calendar.calendars.get({id:items})).data)
            }catch(err){
                console.log(err)
            }
        }
         return [{summary:"Personal", id:""}, ...cals]
    },
    
    getUserCalendars: async ()=>{
        return (await calendar.calendarList.list({})).data;
    },

    getLocalCalendarOptions: async (id)=>{
        var items = await Calendar.find({sid:{$nin:[id]}}).exec();
        return items;
    }
}