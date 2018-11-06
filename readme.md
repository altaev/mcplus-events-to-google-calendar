# Mcplus Events To Google Calendar

Add mcplus.com.ua(Ukraine) local hospital visits to your Google Calendar. 

## Getting Started

To make this script works you should upload it to google and give permissions for your Gmail and Calendar.

Then you need to set up Daily timer when your script will run. Edit -> Triggers triggers runList() function to search the mailbox for new detpol notifications to add them into google calendar as new events

You can change the Calendar Event Title
```
var calendar_event_title = '13 detpol';
```
and Email search query:

```
var mail_search_query = "from:support@mcplus.com.ua subject: MedCard+"; 
```