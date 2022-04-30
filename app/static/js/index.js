// index.js
const shopChoice = document.getElementById('shopChoice')
shopChoice.selectedIndex = 0

// Establish shop location
if (localStorage.getItem('shopLocation')) {
    // Set location drop down default
    if (localStorage.getItem('shopLocation') == 'RA'){
        shopChoice.selectedIndex = 1
    }
    else {
        shopChoice.selectedIndex = 2
    }
}
else {
    modalAlert('LOCATION CHECK','Please select a location.')
}

// const shopChoice = document.getElementById("shopChoice")
// console.log('shopChoice - '+shopChoice.value)
// shopChoice = 'BW'
versionText = document.getElementById('versionText')
console.log('screen width ='+screen.width)
versionText.innerHTML='ver Apr 30, 2022  (' + screen.width + ')'
//versionText.innerHTML='ver Apr 30, 2022'

const machineSelected = document.getElementById("machineSelected")
const memberSelected = document.getElementById("memberSelected")
const instructorSelected = document.getElementById("instructorSelected")
const machineDetailSection = document.getElementById("machineDetailSection")
const memberDetailSection = document.getElementById("memberDetailSection")
const instructorDetailSection = document.getElementById("instructorDetailSection")
const largeScreen = window.matchMedia("(min-width: 992px)")
const machineInstructorBtn = document.getElementById("machineInstructorBtn")
const machineMemberBtn = document.getElementById("machineMemberBtn")
const machineInstructorsAndMembers = document.getElementById("machineInstructorsAndMembers")
//const certifyChkbox = document.getElementsByClassName('certifyChkbox')

// EVENT LISTENERS
shopChoice.addEventListener("click",locationChange)
machineSelected.addEventListener("change",machineClicked)
//machineSelected.addEventListener("change",machineChanged)
memberSelected.addEventListener("change",memberClicked)
instructorSelected.addEventListener("change",instructorChange)
largeScreen.addEventListener("change",handleMediaChange)
// for (chkbox of certifyChkbox) {
//     chkbox.addEventListener("change",certifyMember)
// }


// CODE EXECUTED EVERY TIME
handleMediaChange(largeScreen)


// FUNCTIONS

// SHOW/HIDE MACHINE LIST OPTIONS BASED ON LOCATION SELECTION
function locationChange(e) {
    console.log('shopChoice.value - '+shopChoice.value)
    console.log('selectedIndex - '+shopChoice.selectedIndex)
    console.log('e - ' + e)

    if (shopChoice.value == '') {
        return
    }
    if (shopChoice.value == 'RA') {
        localStorage.setItem('shopLocation','RA')
    }
    else {
        localStorage.setItem('shopLocation','BW')
    }

     // SHOW ALL MACHINES
     $('.optMachineName').each(function(){
         console.log('title - ' +$(this).title)
         //console.log('innerHTML - ' +$(this).innerHTML)
         $(this).show();
     })

}
//     if (shopChoice.value != 'BOTH') {
//         // HIDE OPTION IF THE data.location MATCHES THE SELECTED LOCATION
//         let currentLocation = shopChoice.value
//         console.log('currentLocation - '+currentLocation)

//         $('.optMachineName').each(function(){
//             let sData = $(this).data('location');
//             if (sData != currentLocation){
//                 $(this).hide();
//             }
//         })
//     }


function machineClicked() {
    console.log('... machineClicked rtn')
    // CLEAR OTHER SELECTIONS
    if (machineSelected.selectedIndex != 0) {
        $('.selectpicker').selectpicker('refresh');
        memberSelected.selectedIndex = 0
        instructorSelected.selectedIndex = 0
        $('#memberSelected').prop('selectedIndex',0);
        $('#instructorSelected').prop('selectedIndex',0);
        memberSelected.setAttribute('selectedIndex',0)
        instructorSelected.setAttribute('selectedIndex',0)
    }
    else {
        return
    }
    // HIDE MEMBER AND INSTRUCTOR SECTIONS IF NOT ON LARGE SCREEN
    if (!largeScreen.matches) {
        machineDetailSection.style.display="block"
        memberDetailSection.style.display="none"
        instructorDetailSection.style.display="none"
    }
    // GET MACHINE DATA TO DISPLAY
    machineInstructorsAndMembers.style.display="block"
    displayMachineInstructorsAndMembers()
}

function machineChanged() {
    console.log('... machine changed rt')
}

function memberClicked() {
    console.log('... memberClicked rtn')
    
    // CLEAR OTHER SELECTIONS
    if (memberSelected.selectedIndex == 0) {
        return
    }

    // SET MACHINE AND INSTRUCTOR LISTS TO FIRST OPTION
    machineSelected.selectedIndex = 0
    instructorSelected.selectedIndex = 0

    // HIDE MACHINE AND INSTRUCTOR SECTIONS IF NOT ON LARGE SCREEN
    if (!largeScreen.matches) { 
        machineDetailSection.style.display="none"
        memberDetailSection.style.display="block"
        instructorDetailSection.style.display="none"
    }
    // GET MEMBER CONTACT INFO TO DISPLAY
    let option = memberSelected.options[memberSelected.selectedIndex]; 
    villageID = memberSelected.options[memberSelected.selectedIndex].getAttribute('data-villageid')
    sessionStorage.setItem('villageID',villageID)
    // ...................................
    // ....PROGRAM ERRORS AT THE NEXT LINE  
    //location=shopChoice.value
    //location = 'RA'
    //shopLocation = document.getElementById("shopChoice")
    //location=shopLocation.value
    // ....................................
    
    displayMemberCertifications(villageID,"RA")
}

function instructorChange() {
    console.log('... instructorClicked rtn')
    // CLEAR OTHER SELECTIONS
    if (instructorSelected.selectedIndex != 0) {
        machineSelected.selectedIndex = 0
        memberSelected.selectedIndex = 0
    }
    // HIDE MACHINE AND MEMBER SECTIONS IF NOT ON LARGE SCREEN
    if (!largeScreen.matches) {
        machineDetailSection.style.display="none"
        memberDetailSection.style.display="none"
        instructorDetailSection.style.display="block"
    }
    // GET INSTRUCTOR CONTACT DATA TO DISPLAY
    displayMachineInstructorData()
}

function displayMachineInstructorsAndMembers() {
    let e = document.getElementById("machineSelected");
    machineID = e.options[e.selectedIndex].getAttribute('data-machineid')
    if (machineID == null) {
        return
    } 
    let dataToSend = {
        machineID: machineID
    };
    fetch(`${window.origin}/displayMachineInstructorsMembersUsage`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dataToSend),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.msg == "Machine not found") {
            modalAlert('Machine Lookup',data.msg)
            return
        }
        // Clear previous instructor and member data
        dtlParent = document.getElementById('machineInstructorsAndMembers')
        while (dtlParent.firstChild) {
            dtlParent.removeChild(dtlParent.lastChild);
        }

        // Display Instructor heading
        var divInstructorHdg = document.createElement('div')
        divInstructorHdg.classList.add('instructorListHdg')
        divInstructorHdg.innerHTML = "Instructors:"
        // divInstructorHdg.style.textAlign = 'left'
        // divInstructorHdg.style.marginLeft = '30px'
        dtlParent.appendChild(divInstructorHdg)

        // Display List of Instructors
        instructors = data.instructorsList
        if (instructors.length == 0) {
            var divNoInstructors = document.createElement('div')
            divNoInstructors.classList.add('noInstructors')
            divNoInstructors.innerHTML = "No instructors assigned."
            //divNoInstructors.style.width = '400px'
            //divNoInstructors.style.paddingLeft = '60px'
            dtlParent.appendChild(divNoInstructors)
        }
        else {
            for (i=0;i<instructors.length;i++) {
                var divName = document.createElement('div')
                divName.classList.add('instructorName')
                divName.innerHTML = instructors[i]
                // divName.style.paddingLeft = '60px'
                // divName.style.width = '300px'
                // divName.style.textAlign = 'left'
                dtlParent.appendChild(divName)
            }
        }

        // Display 'Certified Members' heading
        var divMemberHdg = document.createElement('div')
        divMemberHdg.classList.add('memberListHdg')
        divMemberHdg.innerHTML = "Certified Members:"
        // divMemberHdg.style.textAlign = 'left'
        // divMemberHdg.style.paddingTop = '30px'
        // divMemberHdg.style.paddingLeft = '30px'
        dtlParent.appendChild(divMemberHdg)

        // Display list of members certified for this machine
        certified = data.certifiedDict
        if (certified.length == 0){
            // If no members, display message
            var divNoMembers = document.createElement('div')
            divNoMembers.classList.add('noMembers')
            divNoMembers.innerHTML = "No members have been certified."
            //divNoMembers.style.width = '400px'
            //divNoMembers.style.marginLeft = '60px'
            dtlParent.appendChild(divNoMembers)
        }
        else {
            for (var element of certified) {
                var divMemberName = document.createElement('div')
                divMemberName.classList.add('certifiedMemberName')
                divMemberName.innerHTML = element['memberName']
                dtlParent.appendChild(divMemberName)
            }
        }

        // Display 'Machine Usage' heading
        var divUsageHdg = document.createElement('div')
        divUsageHdg.classList.add('machineUsageHdg')
        divUsageHdg.innerHTML = "Machine Usage:"
        // divUsageHdg.style.textAlign = 'left'
        // divUsageHdg.style.paddingTop = '30px'
        // divUsageHdg.style.paddingLeft = '30px'
        dtlParent.appendChild(divUsageHdg)

        // Display dates machine was used 
        machineUsage = data.UsageDict

        if (machineUsage.length == 0){
            // If no members, display message
            var divNoMembers = document.createElement('div')
            divNoMembers.classList.add('noUsage')
            divNoMembers.innerHTML = "No usage to date."
            //divNoMembers.style.width = '400px'
            //divNoMembers.style.marginLeft = '60px'
            dtlParent.appendChild(divNoMembers)
        }
        else {
            for (var element of machineUsage) {
                var divUsageDate = document.createElement('div')
                divUsageDate.classList.add('usageDateAndName')
                divUsageDate.innerHTML = element['usageDate']
                //divUsageDate.style.marginLeft='60px'
                dtlParent.appendChild(divUsageDate)

                // var divUsageMemberName = document.createElement('div')
                // divUsageMemberName.classList.add('usageMemberName')
                // divUsageMemberName.innerHTML = element['memberName']
                // dtlParent.appendChild(divUsageMemberName)
            }
        }

        return
    })
}
function displayMemberCertifications(villageID,location) {
    console.log('villageID - '+villageID)
    console.log('location - '+location)
    if (villageID == null) {
        return
    } 
    let dataToSend = {
        villageID: villageID,
        location: location
    };
    fetch(`${window.origin}/displayMemberData`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dataToSend),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    })
.then((res) => res.json())
.then((data) => {
    console.log('data.msg - ' + data.msg)
    if (data.msg == "Member not found") {
        modalAlert('Member Lookup',data.msg)
        return
    }
    // Clear previous member data
    memberData = document.getElementById('memberData')
    while (memberData.firstChild) {
        memberData.removeChild(memberData.lastChild)
    }
    // Create table
    table = document.createElement('table')
    table.style="margin:auto"

    // tableCaption = document.createElement('caption')
    // tableCaption.style = "caption-side:top;text-align:center"
    // tableCaption.innerHTML = data.memberName
    // table.appendChild(tableCaption)

    tableBody = document.createElement('tbody')
    table.appendChild(tableBody)


    // Build data lines td1 - Home phone, td2 - mobile phone, td3 - email
    
    tableRow = document.createElement("tr")
    td1Lbl = document.createElement("td")
    td1Data = document.createElement("td")
    td1Lbl.innerHTML="Home phone:"
    td1Lbl.style="text-Align:left"
    td1Data.innerHTML= data.homePhone
    td1Data.style="text-Align:right"
    tableRow.appendChild(td1Lbl)
    tableRow.appendChild(td1Data)
    tableBody.appendChild(tableRow)
    
    tableRow = document.createElement("tr")
    td2Lbl = document.createElement("td")
    td2Data = document.createElement("td")
    td2Lbl.innerHTML="Mobile phone:"
    td2Lbl.style="text-Align:left"
    td2Data.innerHTML= data.mobilePhone
    td2Data.style="text-Align:right"
    tableRow.appendChild(td2Lbl)
    tableRow.appendChild(td2Data)
    tableBody.appendChild(tableRow)

    tableRow = document.createElement("tr")
    td3Lbl = document.createElement("td")
    td3Data = document.createElement("td")
    td3Lbl.innerHTML="Email:"
    td3Lbl.style="text-Align:left"
    td3Data.innerHTML= data.eMail
    td3Data.style="text-Align:right"
    tableRow.appendChild(td3Lbl)
    tableRow.appendChild(td3Data)
    tableBody.appendChild(tableRow)

    memberData.appendChild(table)

    // DISPLAY MACHINES FOR WHICH MEMBER HAS BEEN CERTIFIED
    // Clear previous data from 'memberMachines' div
    var memberMachinesParent = document.getElementById('memberMachines')
    while (memberMachinesParent.firstChild) {
        memberMachinesParent.removeChild(memberMachinesParent.lastChild);
    }

    machine = data.machineDict
    if (machine.length == 0){
        // If no machines, display message
        var divNoMachines = document.createElement('div')
        divNoMachines.innerHTML = "No machines have been defined."
        divNoMachines.style.width = '400px'
        divNoMachines.style.marginLeft = '60px'
        memberMachinesParent.appendChild(divNoMachines)
        return
    }
            
    // BUILD HEADINGS FOR LIST OF MACHINES
    var breakElement = document.createElement('br')
    memberMachinesParent.appendChild(breakElement)

    var divHdgRow = document.createElement('div')
    divHdgRow.classList.add('row')

    var divHdgCol = document.createElement('div')
    divHdgCol.classList.add('col-2')
    divHdgRow.appendChild(divHdgCol) 
    
    var divHdgText = document.createElement('div')
    divHdgText.classList.add('col-8')
    divHdgText.innerHTML="<h6 style=text-align:left>Certified for the following -</h6>"
    divHdgRow.appendChild(divHdgText)

    memberMachinesParent.appendChild(divHdgRow)

    for (m of machine) {
        // BUILD THE ROW
        var divRow = document.createElement('div')
        divRow.classList.add('row', 'mbrMachRow')
        
        var blankCol = document.createElement('div')
        blankCol.classList.add('col-2')
        divRow.appendChild(blankCol)

        var chkInput = document.createElement('input')
        chkInput.type="checkbox"
        chkInput.onclick=function() {certifyMember(this.id)}
        //chkInput.setAttribute('onclick',function() {certifyMember)
        chkInput.id = m['machineID']
        chkInput.classList.add('col-1')
        chkInput.classList.add('certifyChkbox')
        if (m['memberCertified']) {
            chkInput.checked = true
            chkInput.innerHTML = 'True'
        }
        else {
            chkInput.innerHTML = 'False'
        }
        
        divRow.appendChild(chkInput)

        var divColMachineDesc = document.createElement('div')
        divColMachineDesc.classList.add('col-6')
        divColMachineDesc.classList.add('clsMachineDesc')
        divColMachineDesc.innerHTML = m['machineDesc']
        divColMachineDesc.style.textAlign='left'
        divRow.appendChild(divColMachineDesc)

        var divColMachineLoc = document.createElement('div')
        divColMachineLoc.classList.add('col-1', 'clsMachineLocation')
        divColMachineLoc.innerHTML = m['machineLocation']
        divRow.appendChild(divColMachineLoc)

        // ADD THE ROW TO THE DETAIL SECTION
        memberMachinesParent.appendChild(divRow)
    }
    var prtMemberBtn = document.createElement('button')
    prtMemberBtn.innerHTML = 'PRINT'
    prtMemberBtn.onclick=function() {prtMemberCertifications(m['machineID'])}
    memberMachinesParent.appendChild(prtMemberBtn)
    return
    })
}

function prtMemberCertifications (machineID) {
    alert('... prtMemberCertifications - '+ machineID)
}

function modalAlert(title,msg) {
	document.getElementById("modalTitle").innerHTML = title
	document.getElementById("modalBody").innerHTML= msg
	$('#myModalMsg').modal('show')
}

function closeModal() {
	$('#myModalMsg').modal('hide')
}

function handleMediaChange(e) {
    if (e.matches) {
        // LOGIC FOR SCREENS 992 OR LARGER
        machineDetailSection.style.display="block"
        memberDetailSection.style.display="block"
        instructorDetailSection.style.display="block"
    }
    else {
        machineDetailSection.style.display="none"
        memberDetailSection.style.display="none"
        instructorDetailSection.style.display="none"
    }
}

function displayMachineInstructorData() {
    let e = document.getElementById("instructorSelected");
    instructorID = e.options[e.selectedIndex].getAttribute('data-villageid')
    if (instructorID == null) {
        return
    } 
    let dataToSend = {
        instructorID: instructorID
    };
    fetch(`${window.origin}/displayMachineInstructors`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dataToSend),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.msg == "Instructor not found") {
            modalAlert("Instructor Lookup",data.msg)
        }

        if (data.status == 400) {
            modalAlert('Machine Lookup',data.msg)
            return
        }
        // Clear previous instructor and member data
        dtlParent = document.getElementById('instructorData')
        while (dtlParent.firstChild) {
            dtlParent.removeChild(dtlParent.lastChild);
        }
        
        // Display Instructor Contact Data
        // var divInstructorName = document.createElement('div')
        // divInstructorName.innerHTML = data.instructorName
        // divInstructorName.style.textAlign='center'
        // divInstructorName.style.fontWeight='bold'
        // dtlParent.appendChild(divInstructorName)

        var divHomePhone = document.createElement('div')
        divHomePhone.innerHTML = "Home phone - " + data.homePhone
        divHomePhone.style.textAlign='left'
        dtlParent.appendChild(divHomePhone)

        var divMobilePhone = document.createElement('div')
        divMobilePhone.innerHTML = "Mobile phone - " + data.mobilePhone
        divMobilePhone.style.textAlign='left'
        dtlParent.appendChild(divMobilePhone)

        var divEmail = document.createElement('div')
        divEmail.innerHTML = "Email - " + data.eMail
        divEmail.style.textAlign='left'
        dtlParent.appendChild(divEmail)
        
        
        // Display machines instructor may certify with check boxes
        // Clear previous data from 'instructorMachines' div
        var instructorMachinesParent = document.getElementById('instructorMachines')
        while (instructorMachinesParent.firstChild) {
            instructorMachinesParent.removeChild(instructorMachinesParent.lastChild);
        }

        machine = data.machineDict
        if (machine.length == 0){
            // If no machines, display message
            var divNoMachines = document.createElement('div')
            divNoMachines.innerHTML = "No machines have been defined."
            divNoMachines.style.width = '400px'
            divNoMachines.style.marginLeft = '60px'
            instructorMachinesParent.appendChild(divNoMachines)
            return
        }
            
        // BUILD HEADINGS FOR LIST OF MACHINES
        var breakElement = document.createElement('br')
        instructorMachinesParent.appendChild(breakElement)

        var divHdgRow = document.createElement('div')
        divHdgRow.classList.add('row', 'headings')


        var divHdgText = document.createElement('div')
        divHdgText.classList.add('col-8')
        divHdgText.innerHTML="May certify the following -"
        divHdgRow.appendChild(divHdgText)

        var divHdgCol = document.createElement('div')
        divHdgCol.classList.add('col-2')
        divHdgRow.appendChild(divHdgCol) 
        instructorMachinesParent.appendChild(divHdgRow)

        for (m of machine) {
            // BUILD THE ROW
            var divRow = document.createElement('div')
            divRow.classList.add('row', 'instrMachRow')
            
            var chkInput = document.createElement('input')
            chkInput.type="checkbox"
            chkInput.id = m['machineID']
            chkInput.classList.add('col-1')
            chkInput.classList.add('canCertify')
            if (m['instructorCertified']) {
                chkInput.checked = true
                chkInput.innerHTML = 'True'
            }
            else {
                chkInput.innerHTML = 'False'
            }
            divRow.appendChild(chkInput)

            var divColMachineDesc = document.createElement('div')
            divColMachineDesc.classList.add('col-6')
            divColMachineDesc.classList.add('clsMachineDesc')
            divColMachineDesc.innerHTML = m['machineDesc']
            divColMachineDesc.style.textAlign='left'
            divRow.appendChild(divColMachineDesc)

            var divColMachineLoc = document.createElement('div')
            divColMachineLoc.classList.add('col-1', 'clsMachineLocation')
            divColMachineLoc.innerHTML = m['machineLocation']
            divRow.appendChild(divColMachineLoc)

            // ADD THE ROW TO THE DETAIL SECTION
            instructorMachinesParent.appendChild(divRow)
        }
   
        return
    })
}
function certifyMember(e) {
    machineID = e
    selectedMachine = document.getElementById(e) 
    if (selectedMachine.checked) {
        url = window.location.origin + '/certifyMember'
    }
    else {
        url = window.location.origin + '/deCertifyMember'
    }
    console.log('url - '+url)
    
    staffID = sessionStorage.getItem('staffID')
    villageID = sessionStorage.getItem('villageID')
    
    console.log('machineID - '+machineID)
    console.log('staffID - '+staffID)
    console.log('villageID - '+villageID)

    let dataToSend = {
        staffID: staffID,
        villageID: villageID,
        machineID: machineID
    };
    fetch(url, {
    //fetch(`${window.origin}/certifyMember`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(dataToSend),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    .then((res) => res.json())
    .then((data) => {

        if (data.status != 200) {
            modalAlert('Member Certification',data.msg)
            return
        }
    return
    })
}

function prtMemberCertifications(memberID) {
    villageID = sessionStorage.getItem('villageID')
    url = '/prtMemberCertifications?villageID='+villageID
    window.location.href=url
}   

// END OF FUNCTIONS
