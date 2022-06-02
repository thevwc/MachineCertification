// index.js

window.addEventListener("load", startup, false);

// VARIABLES
var colorWellMachineBG = document.querySelector("#colorWellMachineBG");
var colorWellMachineFG = document.querySelector("#colorWellMachineFG");
var colorWellMemberBG = document.querySelector("#colorWellMemberBG");
var colorWellMemberFG = document.querySelector("#colorWellMemberFG");
var colorWellInstructorBG = document.querySelector("#colorWellInstructorBG");
var colorWellInstructorFG = document.querySelector("#colorWellInstructorFG");

// CONSTANTS
const defaultColorMachineBG = "#f08080";
const defaultColorMachineFG = "#000000";
const defaultColorMemberBG = "#ADD8E6";
const defaultColorMemberFG = "#000000";
const defaultColorInstrBG = "#90EE90";
const defaultColorInstrFG = "#000000";
const shopChoice = document.querySelector('.shopChoice')
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
const keyInToolCribID = document.getElementById("keyInToolCribID")
const keyProviderID = document.getElementById("keyProviderID")
const machineBtns = document.getElementById('machineBtns')
const btnEditMachine = document.getElementById('btnEditMachine')
const btnDeleteMachine = document.getElementById('btnDeleteMachine')
const btnNewMachine = document.getElementById('btnNewMachine')
// EVENT LISTENERS
shopChoice.addEventListener("change",locationClicked)
machineSelected.addEventListener("change",machineClicked)
memberSelected.addEventListener("change",memberClicked)
instructorSelected.addEventListener("click",instructorClicked)
instructorSelected.addEventListener("change",instructorClicked)
largeScreen.addEventListener("change",handleMediaChange)
keyInToolCribID.addEventListener("change",keyChangeTC)
keyProviderID.addEventListener("change",keyChangeProvider)


// PAGE LOAD ROUTINES

// RETRIEVE COOKIE WITH LAST USED SHOP LOCATION
if (localStorage.getItem('shopLocation')) {
    // Set location drop down starting value
    if (localStorage.getItem('shopLocation') == 'BOTH'){
        shopChoice.selectedIndex = 0
    }
    else {
        if (localStorage.getItem('shopLocation') == 'RA'){
        shopChoice.selectedIndex = 1
        }
        else {
            shopChoice.selectedIndex = 2
        }
    }
}
else {
    localStorage.setItem('shopLocation','BOTH')
    shopChoice.selectedIndex = 0
}

// CALL ROUTINE TO FILTER MACHINE DROPDOWN LIST BASED ON LOCATION
filterMachineDropdown(shopChoice.value)

// SET VERSION OF APP AND CURRENT SCREEN SIZE (FOR DEVELOPMENT PURPOSES)
versionText = document.getElementById('versionText')
versionText.innerHTML='ver June 2, 2022  (' + screen.width + ')'

// IF NOT A LARGE SCREEN DISPLAY ONLY 1 PANEL AT A TIME INSTEAD OF ALL 3
handleMediaChange(largeScreen)

// END OF PAGE LOAD ROUTINES
// -------------
// FUNCTIONS
function startup() {
    console.log ('startup rtn ...')
    
    
    colorWellMachineBG.addEventListener("input", updateMachineFirst, false);
    colorWellMachineBG.addEventListener("change", updateMachineAll, false);
    colorWellMachineBG.select();

    //defaultColor = '#000000'
    colorWellMachineFG = document.querySelector("#colorWellMachineFG");
    colorWellMachineFG.value = defaultColorMachineFG;
    colorWellMachineFG.addEventListener("input", updateMachineFirst, false);
    colorWellMachineFG.addEventListener("change", updateMachineAll, false);
    colorWellMachineFG.select();

    //defaultColor = '#f08080'
    colorWellMemberBG = document.querySelector("#colorWellMemberBG");
    colorWellMemberBG.value = defaultColorMemberBG;
    colorWellMemberBG.addEventListener("input", updateMemberFirst, false);
    colorWellMemberBG.addEventListener("change", updateMemberAll, false);
    colorWellMemberBG.select();

    //defaultColor = '#000000'
    colorWellMemberFG = document.querySelector("#colorWellMemberFG");
    colorWellMemberFG.value = defaultColorMemberFG;
    colorWellMemberFG.addEventListener("input", updateMemberFirst, false);
    colorWellMemberFG.addEventListener("change", updateMemberAll, false);
    colorWellMemberFG.select();

    //defaultColor = '#f08080'
    colorWellInstrBG = document.querySelector("#colorWellInstrBG");
    colorWellInstrBG.value = defaultColorInstrBG;
    colorWellInstrBG.addEventListener("input", updateInstructorFirst, false);
    colorWellInstrBG.addEventListener("change", updateInstructorAll, false);
    colorWellInstrBG.select();

    //defaultColor = '#000000'
    colorWellInstrFG = document.querySelector("#colorWellInstrFG");
    colorWellInstrFG.value = defaultColorInstrFG;
    colorWellInstrFG.addEventListener("input", updateInstructorFirst, false);
    colorWellInstrFG.addEventListener("change", updateInstructorAll, false);
    colorWellInstrFG.select();

  }
  
function updateMachineFirst(event) {
    document.getElementById('machineDetailSection').style.backgroundColor = event.target.value 
}

function updateMachineAll(event) { 
    document.documentElement.style.setProperty('--machine-bg-color', event.target.value);
    localStorage.setItem('machineBGcolor',event.target.value)
    // close or hide dialog form
  }

function updateMemberFirst(event) {
    document.getElementById('memberDetailSection').style.backgroundColor = event.target.value 
}

function updateMemberAll(event) { 
    document.documentElement.style.setProperty('--member-bg-color', event.target.value);
}

function updateInstructorFirst(event) {
    document.getElementById('instructorDetailSection').style.backgroundColor = event.target.value 
}

function updateInstructorAll(event) { 
    document.documentElement.style.setProperty('--instructor-bg-color', event.target.value);
}

  
// SHOW/HIDE MACHINE LIST OPTIONS BASED ON LOCATION SELECTION
function locationListClicked() {
    console.log('.. locationListClicked ..')
}
function locationClicked() {
    selectedLocation = shopChoice.value

    if (shopChoice.value == '') {
        return
    }
    // STORE THE LOCATION
    localStorage.setItem('shopLocation',selectedLocation)
    filterMachineDropdown(selectedLocation)
}

function filterMachineDropdown(selectedLocation) {
    if (selectedLocation == 'BOTH') {
        optMachineName = document.getElementsByClassName('optMachineName')
        for (opt of optMachineName) {
            opt.style.display = 'block'
        }
        $('.selectpicker').selectpicker('refresh');
        return
        }
    else {
        if (selectedLocation == 'RA') {
            RAclass = document.getElementsByClassName ('RA')
            for (RA of RAclass) {
                RA.style.display = 'block'
            } 
            BWclass = document.getElementsByClassName ('BW')
            for (BW of BWclass) {
                BW.style.display = 'none'
            } 
        }
        else {
        if (selectedLocation == 'BW') {
            BWclass = document.getElementsByClassName ('BW')
            for (BW of BWclass) {
                BW.style.display = 'block'
            } 
            RAclass = document.getElementsByClassName ('RA')
            for (RA of RAclass) {
                RA.style.display = 'none'
            }
        }
    }
    $('.selectpicker').selectpicker('refresh');
}

    // if (selectedLocation == 'RA') {
    //     const RAclass = document.querySelectorAll('.RA');
    //     RAclass.forEach(RAitem => {
    //         RAitem.style.display = 'block'
            
    //     });
    //     const BWclass = document.querySelectorAll('.BW');
    //     BWclass.forEach(BWitem => {
    //         //BWitem.style.display = 'none'
    //         BWitem.hidden = true
    //     });
    // }
}

function machineClicked() {
    // CLEAR OTHER SELECTIONS
    if (machineSelected.selectedIndex > 1) {
        btnEditMachine.removeAttribute('disabled')
        btnDeleteMachine.removeAttribute('disabled')
        $('.selectpicker').selectpicker('refresh');
        memberSelected.selectedIndex = 0
        instructorSelected.selectedIndex = 0
        $('#memberSelected').prop('selectedIndex',0);
        $('#instructorSelected').prop('selectedIndex',0);
        memberSelected.setAttribute('selectedIndex',0)
        instructorSelected.setAttribute('selectedIndex',0)
    }
    else {
        btnEditMachine.style.display='none'
        btnDeleteMachine.style.display='none'
        btnNewMachine.style.display='none'
        return
    }
    // HIDE MEMBER AND INSTRUCTOR SECTIONS IF NOT ON LARGE SCREEN
    if (!largeScreen.matches) {
        machineDetailSection.style.display="block"
        memberDetailSection.style.display="none"
        instructorDetailSection.style.display="none"
    }
    // GET MACHINE DATA TO DISPLAY
    machineBtns.style.display="block"
    machineInstructorsAndMembers.style.display="block"
    displayMachineInstructorsAndMembers()
}

function memberClicked() {
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
    shopLocation = shopChoice.value
    displayMemberCertifications(villageID,shopLocation)
}

function instructorClicked() {
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

        // DISPLAY MACHINE DATA
        
        // Display full description
        var divDescription = document.createElement('div')
        divDescription.classList.add('machineDescription')
        divDescription.id = "D" + data.machineID
        divDescription.innerHTML = data.machineDesc
        dtlParent.appendChild(divDescription)

        // INSERT MACHINE DURATION AND SET LOCATION RADIO BUTTONS
        var divDurationRow = document.createElement('div')
        divDurationRow.classList.add('row')

        var divCol3 = document.createElement('div')
        divCol3.classList.add('col-3')
        divDurationRow.appendChild(divCol3)

        var divDuration = document.createElement('div')
        divDuration.classList.add('col-3')
        divDuration.innerHTML = data.machineDuration
        divDurationRow.appendChild(divDuration)
        
        // DEFINE RADIO BUTTON FOR KEY IN TOOL CRIB
        var divKeyInToolCrib = document.createElement('div')
        divKeyInToolCrib.classList.add('col-2')

        var inputKeyInToolCrib = document.createElement('input')
        inputKeyInToolCrib.type="radio"
        inputKeyInToolCrib.name = 'keyInToolCrib'
        
        if (data.keyInToolCrib == true) {
            inputKeyInToolCrib.checked = true
        }
        divKeyInToolCrib.appendChild(inputKeyInToolCrib)
        
        var labelKeyInToolCrib = document.createElement('label')
        labelKeyInToolCrib.innerHTML = 'TC'
        labelKeyInToolCrib.style.marginLeft = '3px'
        divKeyInToolCrib.appendChild(labelKeyInToolCrib)

        divDurationRow.appendChild(divKeyInToolCrib)

        // DEFINE RADIO BUTTON FOR KEY PROVIDER
        var divKeyProvider = document.createElement('div')
        divKeyProvider.classList.add('col-3')

        var inputKeyProvider = document.createElement('input')
        inputKeyProvider.type="radio"
        inputKeyProvider.name = 'KeyProvider'
        
        if (data.keyProvider == true) {
            inputKeyProvider.checked = true
        }
        divKeyProvider.appendChild(inputKeyProvider)
        
        var labelKeyProvider = document.createElement('label')
        labelKeyProvider.innerHTML = 'KP'
        labelKeyProvider.style.marginLeft = '3px'
        divKeyProvider.appendChild(labelKeyProvider)

        divDurationRow.appendChild(divKeyProvider)
            
        dtlParent.appendChild(divDurationRow)

        // Display Instructor heading
        var divInstructorHdg = document.createElement('div')
        divInstructorHdg.classList.add('instructorListHdg')
        divInstructorHdg.innerHTML = "Instructors:"
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
        dtlParent.appendChild(divUsageHdg)

        // Display dates machine was used 
        machineUsage = data.UsageDict

        if (machineUsage.length == 0){
            // If no members, display message
            var divNoMembers = document.createElement('div')
            divNoMembers.classList.add('noUsage')
            divNoMembers.innerHTML = "No usage to date."
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
    if (villageID == null) {
        return
    } 
    let dataToSend = {
        villageID: villageID,
        shopLocation: location
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
    if (data.msg == "Member not found") {
        modalAlert('Member Lookup',data.msg)
        return
    }
    // Clear previous member data
    memberData = document.getElementById('memberData')
    while (memberData.firstChild) {
        memberData.removeChild(memberData.lastChild)
    }
    // DISPLAY MEMBER NAME
    var memberNameHdg = document.createElement('div')
    memberNameHdg.classList.add('memberNameHdg')
    memberNameHdg.innerHTML = data.memberName
    memberData.appendChild(memberNameHdg)

    // Create table
    table = document.createElement('table')
    table.style="margin:auto"

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
    
    var divHdgText = document.createElement('div')
    divHdgText.classList.add('col-3')
    divHdgText.innerHTML="Certified"
    divHdgText.style.fontSize=".75rem"
    divHdgRow.appendChild(divHdgText)

    memberMachinesParent.appendChild(divHdgRow)

    for (m of machine) {
        // BUILD THE ROW
        var divRow = document.createElement('div')
        divRow.classList.add('row', 'mbrMachRow')

        var blankCol = document.createElement('div')
        blankCol.classList.add('col-1')
        divRow.appendChild(blankCol)

        var chkInput = document.createElement('input')
        chkInput.type="checkbox"
        chkInput.id = "CERTIFY" + m['machineID']
        chkInput.onclick=function() {certifyMember(this)}
        chkInput.classList.add('col-1')
        chkInput.classList.add('certifyChkbox')
        if (m['memberCertified']) {
            chkInput.checked = true
            chkInput.innerHTML = 'True'
            chkInput.disabled = true 
        }
        else {
            chkInput.innerHTML = 'False'
        }
        
        divRow.appendChild(chkInput)
        // MACHINE DESCRIPTION (LOCATION)
        var divColMachineDesc = document.createElement('div')
        divColMachineDesc.id = "Desc" + m['machineID']
        divColMachineDesc.classList.add('col-4')
        divColMachineDesc.classList.add('clsMachineDesc')
        divColMachineDesc.innerHTML = m['machineDesc']
        divColMachineDesc.style.textAlign='left'

        if (m['certificationExpired']) {
            divColMachineDesc.classList.add('expired')
        }

        divRow.appendChild(divColMachineDesc)

        // AUTHORIZATION DURATION
        var divColCertDuration = document.createElement('div')
        divColCertDuration.classList.add('col-2')
        divColCertDuration.innerHTML = m['certificationDuration']
        divRow.appendChild(divColCertDuration)

        // AUTHORIZATION DATE
        var divColCertDate = document.createElement('div')
        divColCertDate.classList.add('col-2')
        divColCertDate.innerHTML = m['dateCertified']
        divRow.appendChild(divColCertDate)

        // CERTIFIED BY
        // var divColCertBy = document.createElement('div')
        // divColCertBy.classList.add('col-1')
        // divColCertBy.innerHTML = m['certifiedBy']
        // divRow.appendChild(divColCertBy)

        // EDIT AUTHORIZATION
        var divColEditBtn = document.createElement('div')
        divColEditBtn.classList.add('col-1')

        var editBtn = document.createElement('button')
        editBtn.innerHTML = 'EDIT'
        editBtn.id = 'EDIT' + m['machineID']
        editBtn.onclick=function() {editMemberCertification(this)}
        if (m['memberCertified']) {
            editBtn.style.display='block'
        }
        else {
            editBtn.style.display='none'
        }
        divColEditBtn.appendChild(editBtn)

        divRow.appendChild(divColEditBtn)

        // ADD THE ROW TO THE DETAIL SECTION
        memberMachinesParent.appendChild(divRow)
    }
    return
    })
}

// function prtMemberCertifications (machineID) {
//     alert('... layout to be defined ...')
// }

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
    shopLocation = shopChoice.value
    let dataToSend = {
        instructorID: instructorID,
        shopLocation: shopLocation
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
        // Display full description
        var divDescription = document.createElement('div')
        divDescription.classList.add('instructorNameHdg')
        divDescription.innerHTML = data.instructorName
        dtlParent.appendChild(divDescription)

        var divHomePhone = document.createElement('div')
        divHomePhone.classList.add('contactData')
        divHomePhone.innerHTML = "Home phone - " + data.homePhone
        divHomePhone.style.textAlign='left'
        dtlParent.appendChild(divHomePhone)

        var divMobilePhone = document.createElement('div')
        divMobilePhone.classList.add('contactData')
        divMobilePhone.innerHTML = "Mobile phone - " + data.mobilePhone
        divMobilePhone.style.textAlign='left'
        dtlParent.appendChild(divMobilePhone)

        var divEmail = document.createElement('div')
        divEmail.classList.add('contactData')
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

        var divHdgRow1 = document.createElement('div')
        divHdgRow1.classList.add('row', 'headings')

        // HEADINGS FOR MACHINE LIST
        var divHdgCol1 = document.createElement('div')
        divHdgCol1.classList.add('col-1')
        divHdgCol1.classList.add('instrMachHdg')
        divHdgCol1.innerHTML="Can"
        divHdgRow1.appendChild(divHdgCol1)

        var divHdgCol2 = document.createElement('div')
        divHdgCol2.classList.add('col-1')
        divHdgCol2.classList.add('instrMachHdg')
        divHdgCol2.innerHTML="Can"
        divHdgRow1.appendChild(divHdgCol2)

        var divHdgCol3 = document.createElement('div')
        divHdgCol3.classList.add('col-1')
        divHdgCol3.classList.add('instrMachHdg')
        divHdgCol3.innerHTML="Has"
        divHdgRow1.appendChild(divHdgCol3)
        // Add row with 'Can  Can  Has'
        instructorMachinesParent.appendChild(divHdgRow1)

        var divHdgRow2 = document.createElement('div')
        divHdgRow2.classList.add('row', 'headings')
        var divHdgColA = document.createElement('div')
        divHdgColA.classList.add('col-1')
        divHdgColA.classList.add('instrMachHdg')
        divHdgColA.innerHTML="Certify"
        divHdgRow2.appendChild(divHdgColA)

        var divHdgColB = document.createElement('div')
        divHdgColB.classList.add('col-1')
        divHdgColB.classList.add('instrMachHdg')
        divHdgColB.innerHTML="Assist"
        divHdgRow2.appendChild(divHdgColB)

        var divHdgColC = document.createElement('div')
        divHdgColC.classList.add('col-1')
        divHdgColC.classList.add('instrMachHdg')
        divHdgColC.innerHTML="Key"
        divHdgRow2.appendChild(divHdgColC)

        // Add row with 'Certify   Assist   Key'
        instructorMachinesParent.appendChild(divHdgRow2)
        
        // BLANK SPACE BEFORE FIRST CHECK BOX
        // var divHdgCol = document.createElement('div')
        // divHdgCol.classList.add('col-2')
        // divHdgRow.appendChild(divHdgCol) 
        // instructorMachinesParent.appendChild(divHdgRow)

        //  ROWS OF MACHINES
        for (m of machine) {
            // BUILD THE ROW
            var divRow = document.createElement('div')
            divRow.classList.add('row', 'instrMachRow')
            divRow.id = 'R' + m['machineID']

            // Certify checkbox
            var chkInput = document.createElement('input')
            chkInput.type="checkbox"
            chkInput.id = 'C' + m['machineID']
            chkInput.classList.add('col-1')
            chkInput.classList.add('canCertify','instrChkbox')
            chkInput.setAttribute("onclick","certifyFunction(this)")
            if (m['canCertify']) {
                chkInput.checked = true
                chkInput.innerHTML = 'True'
            }
            else {
                chkInput.innerHTML = 'False'
            }
            divRow.appendChild(chkInput)
            
            // Assist checkbox
            var chkInput = document.createElement('input')
            chkInput.type="checkbox"
            chkInput.id = "A" + m['machineID']
            chkInput.classList.add('col-1')
            chkInput.classList.add('canAssist','instrChkbox')
            chkInput.setAttribute("onclick","assistFunction(this)")
            if (m['canAssist']) {
                chkInput.checked = true
                chkInput.innerHTML = 'True'
            }
            else {
                chkInput.innerHTML = 'False'
            }
            divRow.appendChild(chkInput)

            // Key Provider checkbox
            var chkInput = document.createElement('input')
            chkInput.type="checkbox"
            chkInput.id = 'K' + m['machineID']
            chkInput.classList.add('col-1')
            chkInput.classList.add('keyProvider','instrChkbox')
            chkInput.setAttribute("onclick","keyProviderFunction(this)")
            if (m['keyProvider']) {
                chkInput.checked = true
                chkInput.innerHTML = 'True'
            }
            else {
                chkInput.innerHTML = 'False'
            }
            divRow.appendChild(chkInput)

            // Machine Description
            var divColMachineDesc = document.createElement('div')
            divColMachineDesc.classList.add('col-6')
            divColMachineDesc.classList.add('clsMachineDesc')
            divColMachineDesc.innerHTML = m['machineDesc']
            divColMachineDesc.style.textAlign='left'
            divRow.appendChild(divColMachineDesc)

            // Machine Location
            var divColMachineLoc = document.createElement('div')
            divColMachineLoc.classList.add('col-1', 'clsMachineLocation')
            divColMachineLoc.innerHTML = m['machineLocation']
            divRow.appendChild(divColMachineLoc)

            // COL FOR SAVE BTN
            var divBtnCol0 = document.createElement('div')
            divBtnCol0.classList.add('col-1')

            var btnSaveRow = document.createElement('button')
            btnSaveRow.className="btn btn-primary btn-sm"
            btnSaveRow.style.fontSize='.5rem'
            btnSaveRow.style.display='none'
            btnSaveRow.id = 'S' + m['machineID']
            btnSaveRow.setAttribute("onclick","saveCheckedBoxes(this)")
            btnSaveRow.textContent='SAVE'
            divBtnCol0.appendChild(btnSaveRow)
            divRow.appendChild(divBtnCol0)

            // ADD THE ROW TO THE DETAIL SECTION
            instructorMachinesParent.appendChild(divRow)
        }
        // Add 'CANCEL' and 'SAVE' buttons
        // var divBtnRow = document.createElement('div')
        // divBtnRow.style.marginTop="10px"
        // divBtnRow.id= 'instructorMachinebtnRow'
        // divBtnRow.classList.add('row', 'instructorMachinebtnRow')
        // divBtnRow.style.display='none'

        // BLANK COL
        

        // COL FOR CANCEL BTN
        // var divBtnCol1 = document.createElement('div')
        // divBtnCol1.classList.add('col-3')

        // var btnCancel = document.createElement('button')
        // btnCancel.textContent='CANCEL'
        // btnCancel.className="btn btn-secondary btn-sm"
        // divBtnCol1.appendChild(btnCancel)

        // divBtnRow.appendChild(divBtnCol1)

        // COL FOR SAVE BTN
        // var divBtnCol2 = document.createElement('div')
        // divBtnCol2.classList.add('col-3')

        // var btnSave = document.createElement('button')
        // btnSave.className="btn btn-primary btn-sm"
        // btnSave.textContent='SAVE'
        // divBtnCol2.appendChild(btnSave)

        // divBtnRow.appendChild(divBtnCol2)

        // instructorMachinesParent.appendChild(divBtnRow)

   
        return
    })
}


// ROUTINE FOR NEW CERTIFICATIONS
function certifyMember(e) {
    machineID = e.id.slice(7,14)
    selectedMachine = document.getElementById(e.id) 
    if (!selectedMachine.checked) {
        alert("Click on 'EDIT' to change or delete certification data.")
        selectedMachine.checked = true
        return
    }
    populateMemberCertificationModal('NEW',machineID)
    return 
}

function editMemberCertification(e) {
    machineID = e.id.slice(4,11)
    populateMemberCertificationModal("EDIT",machineID)
}

// CALL ROUTINE TO GET LIST OF INSTRUCTORS FOR THIS MACHINE AND TO SHOW THE MODAL 'certifyMemberModal'
// POPULATE MACHINE ID, DESCRIPTION, DATE CERTIFIED, SET DURATION TO DEFAULT FOR THIS MACHINE
function populateMemberCertificationModal(certifyTransactionType,machineID) {
    villageID = sessionStorage.getItem('villageID')
    if (certifyTransactionType == 'NEW') {
        document.getElementById('deleteAuthorizationModal').style.display="none"
        document.getElementById('certifyTransactionType').innerHTML='NEW'
    }
    else {
        document.getElementById('deleteAuthorizationModal').style.display="block"
        document.getElementById('certifyTransactionType').innerHTML='EDIT'
    }

    url = window.location.origin + '/getDataForCertificationModal'
    villageID = sessionStorage.getItem('villageID')

    let dataToSend = {
        villageID: villageID,
        machineID: machineID,
        certifyTransactionType,certifyTransactionType
    };
    fetch(url, {
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
            modalAlert('Machine Authorization',data.msg)
            return
        }
        // SET certifyMemberModal FIELDS - MACHINEID, DESCRIPTION, DATE CERTIFIED
        document.getElementById('certifyMachineID').value = machineID
        document.getElementById('certifyDescription').value = data.machineDesc
        document.getElementById('certifyDateCertified').value = data.dateCertified
        console.log('data.dateCertified - '+ data.dateCertified)
        console.log('data.certificationDuration - '+ data.certificationDuration)

        durationIndex = 2
        if (data.certificationDuration == 'UNL') {
            durationIndex = 0
        }
        if (data.certificationDuration == '365 days') {
            durationIndex = 1
        }
        if (data.certificationDuration == '180 days') {
            durationIndex = 2
        }
        if (data.certificationDuration == '90 days') {
            durationIndex = 3
        }
        if (data.certificationDuration == '60 days') {
            durationIndex = 5
        }
        if (data.certificationDuration == '30 days') {
            durationIndex = 5
        }
        if (data.certificationDuration == '7 days') {
            durationIndex = 6
        }
        
        document.getElementById('certificationDuration').selectedIndex = durationIndex
        

        // POPULATE certifyMemberModal DROP DOWN LIST WITH INSTRUCTORS
        var certificationModalInstructors = document.getElementById('certificationModalInstructors')
        while (certificationModalInstructors.firstChild) {
            certificationModalInstructors.removeChild(certificationModalInstructors.lastChild);
        }
        instructors = data.instructorsDict
        // IF NO INSTRUCTORS ASSIGNED BUILD OPTION LINE WITH MSG
        if (instructors.length == 0){
            optionLine = document.createElement("option")
            optionLine.innerHTML = "No instructors assigned."
            certificationModalInstructors.appendChild(optionLine)
            msg = "There are currently no instructors assigned to this machine."
            msg += "\nYou will need to set up the instructors before you can certify any member."
            modalAlert("MEMBER AUTHORIZATION",msg)
            //$('#certifyMemberModal').modal('show')
            machineID = document.getElementById('certifyMachineID').value
            chkboxID = 'CERTIFY' + machineID
            chkbox = document.getElementById(chkboxID)
            chkbox.checked = false
            return
        }
        // BUILD AN OPTION LINE FOR EACH INSTRUCTOR
        for (var element of instructors) {
            var optionLine = document.createElement('option')
            optionLine.innerHTML = element.instructorName
            optionLine.value = element.instructorID
            certificationModalInstructors.appendChild(optionLine)
        }
        $('#certifyMemberModal').modal('show')
    return
    })
}

function prtMemberCertifications() {
    if (memberSelected.selectedIndex == 0) {
        modalAlert('PRINT CERTIFICATIONS',"A member has not been selected.")
        return
    }
    memberID = memberSelected.options[memberSelected.selectedIndex].getAttribute('data-villageid')
    url = '/prtMemberCertifications?villageID='+memberID
    window.location.href=url
}   

function showNewMachineModal() {
    document.getElementById('machineTransactionType').innerHTML = 'NEW'
    document.getElementById('machineModalTitle').innerHTML = 'ADD NEW MACHINE'
    document.getElementById('machineDescription').innerHTML = ''
    document.getElementById('machineDescription').value = ''
    document.getElementById('machineLocation').value = localStorage.getItem('shopLocation')
    document.getElementById('certificationDuration').value = '180 days'
    document.getElementById('keyInToolCribID').checked = false
    document.getElementById('keyProviderID').checked = true

    $('#machineModal').modal('show')
    document.getElementById('machineDescription').focus()
}
function showEditMachineModal() {
    console.log('showEditMachineModal')
    document.getElementById('machineTransactionType').innerHTML = 'EDIT'

    // GET DESCRIPTION et al FROM SELECTED SELECTPICKER FOR MACHINES
    let e = document.getElementById("machineSelected");
    machineID = e.options[e.selectedIndex].getAttribute('data-machineID')
    currentDesc = document.getElementById('D'+machineID).innerHTML
    position = currentDesc.indexOf("(")
    currentDesc = currentDesc.slice(0,position)
    datashopLocation = e.options[e.selectedIndex].getAttribute('data-location')
    dataduration = e.options[e.selectedIndex].getAttribute('data-duration')
    datakeyintoolcrib = e.options[e.selectedIndex].getAttribute('data-keyintoolcrib')
    datakeyprovider = e.options[e.selectedIndex].getAttribute('data-keyprovider')

    console.log('dataduration - ',dataduration)
    console.log('datakeyintoolcrib - ',datakeyintoolcrib)
    console.log('datakeyprovider - '+ datakeyprovider)

    document.getElementById('machineModalTitle').innerHTML = 'EDIT MACHINE DATA'
    document.getElementById('machineDescription').value = currentDesc
    document.getElementById('machineLocation').value = datashopLocation
    durationIndex = 2
    if (dataduration == 'UNL') {
        durationIndex = 0
    }
    if (dataduration == '365') {
        durationIndex = 1
    }
    if (dataduration == '180') {
        durationIndex = 2
    }
    if (dataduration == '90') {
        durationIndex = 3
    }
    if (dataduration == '60') {
        durationIndex = 5
    }
    if (dataduration == '30') {
        durationIndex = 5
    }
    if (dataduration == '7') {
        durationIndex = 6
    }
    console.log('durationIndex - '+durationIndex)
    document.getElementById('certificationDuration').selectedIndex = durationIndex
    
    //document.getElementById('certificationDuration').value = certificationDuration
    console.log('datakeyintoolcrib status - '+ datakeyintoolcrib + typeof(datakeyintoolcrib))
    console.log('datakeyprovider status - '+ datakeyprovider + typeof(datakeyprovider))
    console.log('... after ... keyInToolCribID.checked - '+ keyInToolCribID.checked)
    console.log('... after ... keyInProvider.checked - '+ keyProviderID.checked)
    if (datakeyintoolcrib == 'True') {
        keyInToolCribID.checked = true
    }
    else {
        keyInToolCribID.checked = false 
    }
    if (datakeyprovider == 'True') {
        keyProviderID.checked = true
    }
    else {
        keyProviderID.checked = false 
    }

    // keyInToolCribID.checked = datakeyintoolcrib
    //keyProviderID.checked = datakeyprovider
    // keyInToolCribID.checked = true

    // if (datakeyintoolcrib){
    //     console.log('datakeyintoolcrib is true')
    //     keyInToolCribID.checked = true
    // }
    // else {
    //     console.log('datakeyintoolcrib is false')
    //     keyInToolCribID.removeAttribute('checked')
    // }
    // console.log('... after ... keyInToolCribID.checked - '+ keyInToolCribID.checked)
    // console.log('datakeyprovider status - '+ datakeyprovider)
    // if (datakeyprovider){
    //     console.log('datakeyProvider is true')
    //     keyProviderID.checked = true
    // }
    // else {

    //     console.log('datakeyProvider is false')
    //     keyProviderID.removeAttribute('checked')
    // }
    // document.getElementById('keyInToolCribID').checked = keyInToolCrib
    // document.getElementById('keyProviderID').checked = keyProvider
    
    $('#machineModal').modal('show')
    document.getElementById('machineDescription').focus()
}
function saveMachineData() {
    machineTransactionType = document.getElementById('machineTransactionType').innerHTML
    alert('Saving ' + machineTransactionType + ' transaction.')
    machineDesc = document.getElementById('machineDescription').value
    machineLocation = document.getElementById('machineLocation').value
    certificationDuration = document.getElementById('certificationDuration').value
    //keyInToolCribID = document.getElementById('keyInToolCribID')
    if (keyInToolCribID.checked==true){
        keyInToolCrib = 1
    }
    else {
        keyInToolCrib = 0
    }
    //keyProviderID = document.getElementById('keyProviderID')
    if (keyProviderID.checked==true){
        keyProvider = 1
    }
    else {
        keyProvider = 0
    }
    if (machineTransactionType == 'NEW') {
        url = window.location.origin + '/newMachine' 
        machineID = '' 
    }
    else {
        url = window.location.origin + '/editMachine' 

    }
    console.log('url - '+url)    
    let dataToSend = {
        machineID:machineID,
        machineDesc: machineDesc,
        machineLocation: machineLocation,
        certificationDuration:certificationDuration,
        keyInToolCrib:keyInToolCribID.checked,
        keyProvider:keyProviderID.checked
    };
    fetch(url, {
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
            modalAlert('Machine save ...',data.msg)
        }
        else {
            modalAlert('Machine',data.msg)
        }
        //modalAlert('New Machine',data.msg)
        $('#machineModal').modal('hide')
        window.location.href = "/index"
        window.location.reload()
        //window.location.href = window.location.href;
    })
}


// 
function deleteMachine() {
    let e = document.getElementById("machineSelected");
    machineID = e.options[e.selectedIndex].getAttribute('data-machineID')
    if (confirm("Are you sure you want to delete machine ID - '" + machineID + "'?") != true) {
        return
    }
    url = window.location.origin + '/deleteMachine' 
    console.log('url - '+url)    
    let dataToSend = {
        machineID:machineID
    };
    fetch(url, {
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
            modalAlert('Machine delete ...',data.msg)
        }
        else {
            modalAlert('Machine',data.msg)
        }
        //modalAlert('New Machine',data.msg)
        window.location.href = "/index"
    })
}

function keyChangeTC() {
    console.log('... keyChangeTC')
    // if (keyInToolCribID.checked == true) {
    //     keyProviderID.checked = false
    // }
    // else {
    //     keyProviderID.checked = true
    // }
}
function keyChangeProvider() {
    console.log('... keyChangeProvider')
    // if (keyProviderID.checked == true) {
    //     keyInToolCribID.checked = false
    // }
    // else {
    //     keyInToolCribID.checked = true
    // }
}

// function instrMachChange() {
//     document.getElementById("instructorMachinebtnRow").style.display='block'
// }

function certifyFunction(el) {
    // machineID = el.id.substring(1,8)
    // saveID = 'S'+machineID
    document.getElementById('S'+el.id.substring(1,8)).style.display='block'
}
function assistFunction(el) {
    document.getElementById('S'+el.id.substring(1,8)).style.display='block'
}
function keyProviderFunction(el) {
    document.getElementById('S'+el.id.substring(1,8)).style.display='block'
}
function saveCheckedBoxes(el) {
    let e = document.getElementById("instructorSelected");
    memberID = e.options[e.selectedIndex].getAttribute('data-villageid')
    machineID = el.id.substring(1,8)
    
    // GET canCertify STATUS
    canCertifyID = 'C' +  machineID
    if (document.getElementById(canCertifyID).checked) {
        canCertify = 1
    }
    else {
        canCertify = 0
    }

    // GET canAssist STATUS
    canAssistID = 'A' +  machineID
    if (document.getElementById(canAssistID).checked) {
        canAssist = 1
    }
    else {
        canAssist = 0
    }

    // GET keyProvider STATUS
    hasKeyID = 'K' +  machineID
    if (document.getElementById(hasKeyID).checked) {
        keyProvider = 1
    }
    else {
        keyProvider = 0
    }

    // CALL UPDATE ROUTINE
    
    let dataToSend = {
        memberID: memberID,
        machineID: machineID,
        canCertify:canCertify,
        canAssist:canAssist,
        keyProvider:keyProvider
    };
    

    fetch(`${window.origin}/updateInstructorMachineSettings`, {
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
            modalAlert('NEW MACHINE FOR INSTRUCTOR',data.msg)
        }
        // else {
        //     modalAlert('NEW MACHINE FOR INSTRUCTOR',data.msg)
        // }
        // hide current SAVE button
        document.getElementById('S'+machineID).style.display='none'
    })
}

function cancelCertificationModal() {
    machineID = document.getElementById('certifyMachineID').value
    chkboxID = 'CERTIFY' + machineID
    console.log('chkboxID - '+ chkboxID)

    chkbox = document.getElementById(chkboxID)
    chkbox.checked = false
    $('#certifyMemberModal').modal('hide')
}
function saveCertificationModal() {
    certifyTransactionType = document.getElementById('certifyTransactionType').innerHTML
    memberID = memberSelected.options[memberSelected.selectedIndex].getAttribute('data-villageid')
    machineID = document.getElementById('certifyMachineID').value
    dateCertified = document.getElementById('certifyDateCertified').value
    duration = document.getElementById('certificationDuration').value
    instructorElement  = document.getElementById('certificationModalInstructors')
    instructorAssigned = instructorElement.options[instructorElement.selectedIndex].value

    console.log('member - '+ memberID)
    console.log('machine - '+ machineID)
    console.log('duration - '+ duration)
    console.log('instructor - '+instructorAssigned.value)
    let dataToSend = {
        certifyTransactionType: certifyTransactionType,
        memberID: memberID,
        machineID: machineID,
        dateCertified:dateCertified,
        duration:duration,
        certifiedBy:instructorAssigned
    };
    fetch(`${window.origin}/certifyMember`, {
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
            modalAlert('MEMBER CERTIFICATION',data.msg)
            $('#certifyMemberModal').modal('hide')
            return
        }
        modalAlert('MEMBER CERTIFICATION',data.msg)
        $('#certifyMemberModal').modal('hide')
        memberClicked()
    })
}

function clrMachineData() {
    btnDeleteMachine.disabled = true

    // Clear previous machine data
    machineData = document.getElementById('machineInstructorsAndMembers')
    while (machineData.firstChild) {
        machineData.removeChild(machineData.lastChild)
    }
    machineSelected.selectedIndex = 0
    $('.selectpicker').selectpicker('refresh');

}

function clrMemberData() {
    // if (memberSelected.selectedIndex == 0) {
    //     modalAlert('CLEAR MEMBER DATA',"Nothing to clear.")
    //     return
    // }

    // Clear previous member data
    memberData = document.getElementById('memberData')
    while (memberData.firstChild) {
        memberData.removeChild(memberData.lastChild)
    }
    var memberMachinesParent = document.getElementById('memberMachines')
    while (memberMachinesParent.firstChild) {
        memberMachinesParent.removeChild(memberMachinesParent.lastChild);
    }
    memberSelected.selectedIndex = 0
    $('.selectpicker').selectpicker('refresh');

}

function clrInstructorData() {
    // if (instructorSelected.selectedIndex == 0) {
    //     modalAlert('CLEAR INSTRUCTOR DATA',"Nothing to clear.")
    //     return
    // }

    // Clear previous member data
    dtlParent = document.getElementById('instructorData')
        while (dtlParent.firstChild) {
            dtlParent.removeChild(dtlParent.lastChild);
        }

    // Clear previous data from 'instructorMachines' div
    var instructorMachinesParent = document.getElementById('instructorMachines')
    while (instructorMachinesParent.firstChild) {
        instructorMachinesParent.removeChild(instructorMachinesParent.lastChild);
    }

    instructorSelected.selectedIndex = 0
    $('.selectpicker').selectpicker('refresh');

}

function deCertifyMember() {
    memberID = memberSelected.options[memberSelected.selectedIndex].getAttribute('data-villageid')
    machineID = document.getElementById('certifyMachineID').value
    confirmed = confirm('Are you sure you want to remove this authorization?')
    if (!confirmed) {
        return
    }
    let dataToSend = {
        memberID: memberID,
        machineID: machineID
    };
    fetch(`${window.origin}/deCertifyMember`, {
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
            modalAlert('MEMBER CERTIFICATION',data.msg)
            return
        }
        modalAlert('MEMBER CERTIFICATION',data.msg)
        memberClicked()
    })
}

function chgMachineBG() {
    document.getElementById('machineDetailSection').style.backgroundColor=this.value
    alert('new color')
}

function resetColor(panel) {
    if (panel == 'machine'){
        document.documentElement.style.setProperty('--machine-bg-color', defaultColorMachineBG);
        document.documentElement.style.setProperty('--machine-fg-color', defaultColorMachineFG);
    }
    else {
        if (panel== 'member') {
            document.documentElement.style.setProperty('--member-bg-color', defaultColormemberBG);
            document.documentElement.style.setProperty('--member-fg-color', defaultColormemberFG);
        }
        else {
            if (panel == 'instructor') {
                document.documentElement.style.setProperty('--instructor-bg-color', defaultColorinstructorBG);
            document.documentElement.style.setProperty('--instructor-fg-color', defaultColorinstructorFG);
            }
        }
    }
}


function retrieveStoredColors() {
        
    // IF A MACHINE COLOR HAS NOT BEEN SAVED, USE THE DEFAULT MACHINE COLOR
    if (!localStorage.getItem('machineBGcolor')){
        machineBGcolorInput = defaultColorMachineBG
    }
    else {
        machineBGcolorInput = localStorage.getItem('machineBGcolor')
    }
    document.documentElement.style.setProperty('--machine-bg-color', machineBGcolorInput);
    colorWellMachineBG.value = machineBGcolorInput

    if (!localStorage.getItem('machineFGcolor')){
        machineFGcolorInput = defaultColorMachineFG
    }
    else {
        machineFGcolorInput = localStorage.getItem('machineFGcolor')
    }
    document.documentElement.style.setProperty('--machine-fg-color', machineFGcolorInput);
    colorWellMachineFG.value = machineFGcolorInput

    // IF A MEMBER COLOR HAS NOT BEEN SAVED, USE THE DEFAULT MEMBER COLOR
    if (!localStorage.getItem('memberBGcolor')){
        memberBGcolorInput = defaultColorMemberBG
    }
    else {
        memberBGcolorInput = localStorage.getItem('memberBGcolor')
    }
    document.documentElement.style.setProperty('--member-bg-color', memberBGcolorInput);
    colorWellMemberBG.value = memberBGcolorInput

    if (!localStorage.getItem('memberFGcolor')){
        memberFGcolorInput = defaultColorMemberFG
    }
    else {
        memberFGcolorInput = localStorage.getItem('memberFGcolor')
    }
    document.documentElement.style.setProperty('--member-fg-color', memberFGcolorInput);
    colorWellMemberFG.value = memberFGcolorInput

    // IF A INSTRUCTOR COLOR HAS NOT BEEN SAVED, USE THE DEFAULT INSTRUCTOR COLOR
    if (!localStorage.getItem('instructorBGcolor')){
        instructorBGcolorInput = defaultColorInstructorBG
    }
    else {
        instructorBGcolorInput = localStorage.getItem('instructorBGcolor')
    }
    document.documentElement.style.setProperty('--instructor-bg-color', instructorBGcolorInput);
    colorWellInstructorBG.value = instructorBGcolorInput

    if (!localStorage.getItem('instructorFGcolor')){
        instructorFGcolorInput = defaultColorInstructorFG
    }
    else {
        instructorFGcolorInput = localStorage.getItem('instructorFGcolor')
    }
    document.documentElement.style.setProperty('--instructor-fg-color', instructorFGcolorInput);
    colorWellInstructorFG.value = instructorFGcolorInput
}
// END OF FUNCTIONS
