/*

Daily Timer Setup: Go to Edit -> Triggers -> Current Project Triggers -> Add trigger runList() function to search the mailbox for new detpol notifications to add them into google calendar as new events

*/


var calendar_event_title = '13 detpol';
var mail_search_query = "from:support@mcplus.com.ua subject: MedCard+"; 

/**
 * Retrieve Messages in user's mailbox matching query.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} query String used to filter the Messages listed.
 * @param  {Function} callback Function to call when the request is complete.
 */
/*
get new messages by search criteria and execute callback
*/
function listMessages(userId, query, callback) {
  var initialRequest = Gmail.Users.Messages.list('me', {
    'q': query
  });
  displayMessages(initialRequest);
}
/*
callback function to list new messages
check for calendar events for found messages
*/
function displayMessages(response){
  //Logger.log("Messages:"+response);
  var messages = response.messages;
  if(messages){
    for (var i = 0; i < messages.length; i++) {
      var body = messages[i];
      //Logger.log("- %s", body.id);
      //get message details by id
      var request = Gmail.Users.Messages.get('me',body.id);
      //Logger.log("- %s", request.snippet);
      // detect visitor's name
      var name = request.snippet.match(/(?:(([а-яА-ЯЁёі,]+\s+){3}))/);
      //get message date {DD-MM-YYYY HH:MM}
      var date_str = request.snippet.match(/(\d{2})\-(\d{2})\-(\d{4}) (\d{2}):(\d{2})/);
      //get the full date from object
      var full_date = String(date_str).split(",");
      //split to date and time array
      var datetime_str = full_date[0].split(" ");
      Logger.log("- %s", name[0]+" "+String(date_str));
      //split the date to reverse
      var datee = datetime_str[0].split("-");
      //make valid datetime ISO format: YYYY-MM-DDTHH:MM+02:00
      var datetime = datee[2]+"-"+datee[1]+"-"+datee[0]+"T"+datetime_str[1]+"+02:00";
      
      checkDateEventExist(datetime, request.snippet); /**/      
    }
  }
}
// RUN gmail check function
function runList(){
  listMessages('me',mail_search_query, displayMessages); 
}
/*
Check if event exist and create the new one if not
*/
function checkDateEventExist(new_event_date_time, event_description){
  //check only for future events!
  var today_date = new Date();
  var today_date_iso = today_date.toISOString();
  var response = Calendar.Events.list('primary', {
    'q': calendar_event_title,
    'timeMin':	today_date_iso
  });
  var items = response.items;
  var event_found = false;
  for (var i = 0; i < items.length; i++) {
    var d = new Date(items[i].start.dateTime);
    d.setHours(d.getHours() + 1);// correct UTC because server is +3 timezone !!
   // Logger.log("----- %s  ", d.toString() +' == '+new Date(new_event_date_time).toString());
    if(d.toString() == new Date(new_event_date_time).toString()){
      event_found = true;
      Logger.log("- %s event_found", d.toString());
    }    
  }

  if(!event_found){
    // create event
    var start_date = new Date(new_event_date_time);
    if(start_date > today_date){ // no action for expired events!
      createEvent(new_event_date_time, event_description);
    }
  }
}


function createEvent(event_date_time, event_description){
// Refer to the JavaScript quickstart on how to setup the environment:
// https://developers.google.com/calendar/quickstart/js
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.
  var start_date = new Date(event_date_time);
  start_date.setHours(start_date.getHours() -1); // correct UTC TIME!
  
  var end_date = new Date(event_date_time);
  var start_date_iso = start_date.toISOString();
  // no need +1 hour because  UTC was corrected
  //end_date.setHours(end_date.getHours() + 1);  
  var end_date_iso =  end_date.toISOString();
  Logger.log("- %s", start_date_iso);
  Logger.log("- %s", end_date_iso);

var event = {
  'summary': calendar_event_title,
  'description': event_description,
  'start': {
    'dateTime': start_date_iso
  },
  'end': {
    'dateTime': end_date_iso
  },
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 1 * 60}
    ]
  }
};

var event = Calendar.Events.insert(event,'primary');

Logger.log('New Event ID: ' + event.getId()); /*  */


}
