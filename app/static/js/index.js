//$( document ).ready (function() {
//    $( "p" ).text( "The DOM is now loaded and can be manipulated." );
    // Declare global variables)

    // clientLocation, staffID will be set in localStorage within login routine
    var curCoordinatorID = 'All' //UPDATED FROM COORDINATOR SELECTION
    var clientLocation = ''
    var todaysDate = new Date();
    var shopNames = ['Rolling Acres', 'Brownwood']

    // UPDATED ON LOAD AND SHOP CHANGE
    var curShopNumber = ''
    var curShopName = ''

    //UPDATED FROM WEEK CHANGE ROUTINE
    var curWeekDate = '' 
    var curWeekDisplayDate = '' 
    var curCoordinatorName = '' 
    var curCoordinatorEmail = ''
    var curCoordinatorPhone = ''
    var curManagersEmail = ''

    // UPDATED FROM SEND TO SELECTION OF 'COORDINATOR AND MONITORS'
    var curPrimaryRecipientEmail = ''
    //var curMultipleRecipients = []
    var curMonitorsEmailAddresses = []
    var curMonitorsNames = []

    // DEFINE EVENT LISTENERS
    document.getElementById("weekSelected").addEventListener("change", weekChanged);
    //document.getElementById("weekSelected").addEventListener("click", weekChanged);

    document.getElementById("shopChoice").addEventListener("click", shopClicked);
    document.getElementById("coordChoice").addEventListener("change", coordinatorChanged);

    // Note - both of these buttons link to the 'printReports' function
    document.getElementById("printReportBtn").addEventListener("click",function(){printReports('PRINT');},false);
    document.getElementById("eMailReportBtn").addEventListener("click",function(){printReports('PDF');},false);

    //document.getElementById("coordinatorOnly").addEventListener("click",coordinatorOnly);
    //document.getElementById("coordinatorAndMonitors").addEventListener("click",coordinatorAndMonitors);
    //document.getElementById("memberOnly").addEventListener("click",memberOnly);
    

    if (!localStorage.getItem('staffID')) {
        localStorage.setItem('staffID','111111')
    }
    staffID = localStorage.getItem('staffID')
    

    // IF clientLocation IS NOT FOUND IN LOCAL STORAGE
    // THEN PROMPT WITH MODAL FORM FOR LOCATION AND YEAR
    if (!clientLocation) {
        localStorage.setItem('clientLocation','RA')
    }
    clientLocation = localStorage.getItem('clientLocation')
    console.log('on page load the variable curCoordinatorID-',curCoordinatorID)
    setShopFilter(clientLocation)
    filterWeeksShown()

    // SET EMAILSECTION TO OPAQUE
    document.getElementById('emailSection').style.opacity=.2;
    //alert('opacity set to .2')
    //document.getElementById("emailSection").style.display= 'None'
    

    // THE FOLLOWING ROUTINE RETRIEVES THE MESSAGE THAT IS TO BE INSERTED INTO A 'COORDINATORS ONLY' EMAIL
    $('#coordinatorOnlyID').click(function(){
        if (curWeekDate == ''){
            alert("Please select a date.")
            return 
        } 
        $.ajax({
            url : "/eMailCoordinator",
            type: "GET",
            //data : {
            //    weekOf: curWeekDate,
            //    shopNumber: curShopNumber},
            success: function(data, textStatus, jqXHR)
            {
                
                // WRITE RECIPIENT
                curPrimaryRecipientEmail = curCoordinatorEmail
                curRecipientName = curCoordinatorName

                // BUILD SUBJECT LINE
                subject = "Monitor Duty for Week Of " + curWeekDisplayDate + " at " + curShopName
                document.getElementById('eMailSubjectID').value=subject 

                // WRITE MESSAGE
                message = "DO NOT SEND EMAILS REGARDING MONITOR DUTY TO THE WORKSHOP.\n\n"
                message += "CALL OR EMAIL ACCORDING TO THE INSTRUCTIONS BELOW.\n"
                message += "THIS SCHEDULE IS FOR THE " + curShopName.toUpperCase() + " LOCATION\n\n"
                message += "Please remember to contact your coordinator, " + curCoordinatorName + ", if you make any changes or have questions.\n"
                message += "My phone number is " + curCoordinatorPhone + " and my Email is " + curCoordinatorEmail + "."
                message += '\n' + data.eMailMsg
                alert (message)
                document.getElementById('eMailMsgID').value=message 

            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                alert('ERROR from eMailCoordinator')
            }
        });
    })
    
    $('#coordinatorAndMonitorsID').click(function(){
        alert('curWeekDate - ' + curWeekDate)
        if (curWeekDate == ''){
            alert("Please select a date.")
            return 
        } 
        $.ajax({
            url : "/eMailCoordinatorAndMonitors",
            type: "GET",
            data : {
                weekOf: curWeekDate,
                shopNumber: curShopNumber},
            success: function(data, textStatus, jqXHR)
            {
                // BUILD SUBJECT LINE
                subject = "Monitor Duty for Week Of " + curWeekDisplayDate + " at " + curShopName
                document.getElementById('eMailSubjectID').value=subject 

                // WRITE MESSAGE
                message = "DO NOT SEND EMAILS REGARDING MONITOR DUTY TO THE WORKSHOP.\n\n"
                message += "CALL OR EMAIL ACCORDING TO THE INSTRUCTIONS BELOW.\n"
                message += "THIS SCHEDULE IS FOR THE " + curShopName.toUpperCase() + " LOCATION\n\n"
                message += "Please remember to contact your coordinator, " + curCoordinatorName + ", if you make any changes or have questions.\n"
                message += "My phone number is " + curCoordinatorPhone + " and my Email is " + curCoordinatorEmail + "."
                message += '\n' + data.eMailMsg
                alert (message)
                document.getElementById('eMailMsgID').value=message 
                alert('success from eMailCoordinatorAndMonitors')
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                alert('ERROR from eMailCoordinatorAndMonitors\n'+textStatus+'\n' + errorThrown)
            }
        });
    })

    $('#memberOnlyID').click(function(){ 
        if (curWeekDate == ''){
            alert("Please select a date.")
            return 
        } 
        $.ajax({
            url : "/eMailMember",
            type: "POST",
            data : {
                memberID:curMemberID,
                weekOf: curWeekDate,
                shopNumber: curShopNumber
            },
            success: function(data, textStatus, jqXHR)
            {
                alert('success from eMailMember')
                //data - response from server
                // receive coordName, coordEmail, coordPhone
                
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                alert('ERROR from eMailCoordinator')
            }
        });
    })
    
    
 
// ------------------------------------------------------------------------------------------------------
// FUNCTIONS    
// ------------------------------------------------------------------------------------------------------
function printReports(destination) {
    console.log("printReports")
    //alert('printReports') 
    if (destination == 'PDF'){
        console.log('set opacity = 1')
        //document.getElementById('emailSection').opacity=1
        document.getElementById('emailSection').style.opacity=1
    }

    //curWeekDate = document.getElementById('weekSelected').value
    if (curWeekDate == '') {
        alert("Please select a week date.")
        return
    }

    shopInitials = document.getElementById('shopChoice').value
    if (shopInitials == '') {
        alert("Please select a location.")
        return
    }
    if (shopInitials == 'RA') {
        curShopNumber = '1'
    }
    else {
        curShopNumber = '2'
    }

    reportSelected = false
    
    var scheduleBtn = document.getElementById('printScheduleLink');
    link='/printWeeklyMonitorSchedule?date=' + curWeekDate + '&shop=' + curShopNumber + '&destination=' + destination
    scheduleBtn.setAttribute('href', link)
    
    var notesBtn = document.getElementById('printNotesLink');
    link='/printWeeklyMonitorNotes?date=' + curWeekDate + '&shop=' + curShopNumber + '&destination=' + destination
    notesBtn.setAttribute('href', link)

    var contactsBtn = document.getElementById('printContactsLink');
    link='/printWeeklyMonitorContacts?date=' + curWeekDate + '&shop=' + curShopNumber + '&destination=' + destination
    contactsBtn.setAttribute('href', link)

    var subsBtn = document.getElementById('printSubsLink');
    link='/printWeeklyMonitorSubs?date='  + curWeekDate + '&shop=' + curShopNumber + '&destination=' + destination
    subsBtn.setAttribute('href', link)
    
    if (document.getElementById('scheduleID').checked) {
        reportSelected = true
        scheduleBtn.click()
    }

    if (document.getElementById('notesID').checked) {
        reportSelected = true
        notesBtn.click()
    }
    if (document.getElementById('contactsID').checked) {
        reportSelected = true
        contactsBtn.click()
    }
    if (document.getElementById('subsID').checked) {
        alert('This report is not available at this time.')
        reportSelected = true
        //subsBtn.click()
    }

    if (reportSelected != true) {
        alert('No reports have been selected.')
        return
    }
}

function myFunction() {
    document.getElementById("demo").innerHTML = "Hello World";
  }

// function emailReports() {
//     alert('Not implemented')
// }

function shopClicked() {
    setShopFilter(this.value)
    filterWeeksShown()
}

function setShopFilter(shopLocation) {
    switch(shopLocation){
        case 'RA':
            localStorage.setItem('shopFilter','RA')
            document.getElementById("shopChoice").selectedIndex = 0; //Option Rolling Acres
            shopFilter = 'RA'
            curShopNumber = '1'
            curShopName = shopNames[1]
            break;
        case 'BW':
            localStorage.setItem('shopFilter','BW')
            document.getElementById("shopChoice").selectedIndex = 1; //Option Brownwood
            shopFilter = 'BW'
            curShopNumber = '2'
            curShopName = shopNames[2]
            break;
        default:
            localStorage.setItem('shopFilter','RA')
            document.getElementById("shopChoice").selectedIndex = 0; //Option Rolling Acres
            shopFilter = 'RA'
            curShopNumber = '1'
            curShopName = shopNames[1]
    }   
}


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    yyyymmdd = year + month + day
    return yyyymmdd;
}



 // FILTER WEEKS DROPDOWN ON SHOPNUMBER AND COORDINATOR ID
function filterWeeksShown() {
    console.log('@filterWeeksShown the variable curCoordinatorID contains -', curCoordinatorID)
    //alert('shop- ' + curShopNumber + '\n' + 'curCoordinatorID- ' + curCoordinatorID)
    var weeks = document.querySelectorAll('.optWeeks')
    for (i=0; i < weeks.length; i++) {
        thisWeeksCoordID = weeks[i].getAttribute('data-coordID')
        shop = weeks[i].getAttribute('data-shop')
        console.log(i,curShopNumber, curCoordinatorID)
        if ((shop == curShopNumber && curCoordinatorID == 'All')
        || (shop == curShopNumber && thisWeeksCoordID == curCoordinatorID)){
            weeks[i].style.display = ''
        }
        else {
            weeks[i].style.display = 'none'
            continue
        }
    }
}
  

function weekChanged () {
    curWeekDate = this.value
    document.getElementById('emailSection').style.opacity=1;
    //selectedValue = $("#weekSelected option:selected").val();
    //alert('selectedValue - '+selectedValue)
    alert('curWeekDate - ' + curWeekDate)
    // RETRIEVE COORDINATOR INFORMATION FROM SERVER
    $.ajax({
        url : "/getCoordinatorData",
        type: "GET",
        data : {
            weekOf: curWeekDate,
            shopNumber: curShopNumber},
        success: function(data, textStatus, jqXHR)
        {
            curCoordinatorID = data.coordID 
            curCoordinatorName = data.coordName
            curCoordinatorEmail = data.coordEmail
            curCoordinatorPhone = data.coordPhone
            curManagersEmail = data.curManagersEmail
            curWeekDisplayDate = data.displayDate

            // BUILD MESSAGE FOR coordinatorInfoID
            if (curCoordinatorID != '') {
                //document.getElementById('coordinatorHeading').innerHTML = ''
                document.getElementById('coordHdgBeforeDate').innerHTML = "The coordinator for the week of " 
                document.getElementById('coordHdgDate').innerHTML = curWeekDisplayDate 
                document.getElementById('coordHdgBeforeName').innerHTML = ' is ' 
                document.getElementById('coordHdgName').innerHTML = curCoordinatorName 
                document.getElementById('coordHdgBeforePhone').innerHTML = ' and may be contacted at '
                document.getElementById('coordHdgPhone').innerHTML = curCoordinatorPhone 
                document.getElementById('coordHdgBeforeEmail').innerHTML = ' or by email at '
                document.getElementById('coordHdgEmailLink').href = 'mailto:' + curCoordinatorEmail
                document.getElementById('coordHdgEmailLink').innerHTML = curCoordinatorEmail
            }
            else {
                document.getElementById('coordHdgBeforeDate').innerHTML = "A coordinator has not been assigned for this week."
                document.getElementById('coordHdgDate').innerHTML = ''
                document.getElementById('coordHdgBeforeName').innerHTML = '' 
                document.getElementById('coordHdgName').innerHTML = ''
                document.getElementById('coordHdgBeforePhone').innerHTML = ''
                document.getElementById('coordHdgPhone').innerHTML = ''
                document.getElementById('coordHdgBeforeEmail').innerHTML = ''
                document.getElementById('coordHdgEmailLink').href = '#'
                document.getElementById('coordHdgEmailLink').innerHTML = ''
            }
    
            //alert('success from getCoordinatorData')   
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            alert('ERROR from getCoordinatorData')
        }
    });
}

function coordinatorChanged () {
    curCoordinatorID = this.value
    filterWeeksShown()
}

function coordinatorAndMonitors() {
    alert('button coordinatorOnly clicked')
}

function memberOnly() {
    alert('memberOnly function')
}

// CLICK ON ONE OF THREE SEND TO BUTTONS
// $('.sendToOptions button').click(function(){
//     alert('jquery button clicked -' + this.value)
//     alert('jquery button id - ' + this.id)   
// })

//});