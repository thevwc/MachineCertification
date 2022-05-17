// index.js


// CONSTANTS
const shopChoice = document.querySelector('.shopChoice')
//const shopSelection = document.getElementsByClassName('locationOption')
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
const newKeyInToolCrib = document.getElementById("newKeyInToolCrib")
const newKeyProvider = document.getElementById("newKeyProvider")
//const instrChkbox = document.querySelectorAll(".instrChkbox")
//const instrMachRow = document.getElementById('instrMachRow')

//const certifyChkbox = document.getElementsByClassName('certifyChkbox')

// EVENT LISTENERS
shopChoice.addEventListener("change",locationClicked)
//shopSelection.addEventListener('click',locationClicked)
//machineSelected.addEventListener("click",machineClicked)
machineSelected.addEventListener("change",machineClicked)

//memberSelected.addEventListener("click",memberClicked)
memberSelected.addEventListener("change",memberClicked)
instructorSelected.addEventListener("click",instructorClicked)
instructorSelected.addEventListener("change",instructorClicked)
largeScreen.addEventListener("change",handleMediaChange)
newKeyInToolCrib.addEventListener("change",keyChangeTC)
newKeyProvider.addEventListener("change",keyChangeProvider)
// add event listener to each element of class instrChkbox
// instrChkbox.forEach(box => {
//     box.addEventListener('click',function handleClick(event) {
//         console.log('box clicked', event);
//         instrMachRow.style.display='block'
//     })
// })

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
console.log('screen width ='+screen.width)
versionText.innerHTML='ver May 13, 2022  (' + screen.width + ')'

// IF NOT A LARGE SCREEN DISPLAY ONLY 1 PANEL AT A TIME INSTEAD OF ALL 3
handleMediaChange(largeScreen)

// END OF PAGE LOAD ROUTINES
// -------------
// FUNCTIONS


// SHOW/HIDE MACHINE LIST OPTIONS BASED ON LOCATION SELECTION
function locationListClicked() {
    console.log('.. locationListClicked ..')
}
function locationClicked() {

    console.log('window.event - '+window.event)

    selectedLocation = shopChoice.value
    console.log('.... locationClicked .... '+selectedLocation)

    if (shopChoice.value == '') {
        return
    }
    // STORE THE LOCATION
    localStorage.setItem('shopLocation',selectedLocation)
    filterMachineDropdown(selectedLocation)
}

function filterMachineDropdown(selectedLocation) {
    console.log('.... filterMachineDropdown ....'+ selectedLocation)
    if (selectedLocation == 'BOTH') {
        console.log('.. BOTH ..')
        optMachineName = document.getElementsByClassName('optMachineName')
        for (opt of optMachineName) {
            opt.style.display = 'block'
        }
        $('.selectpicker').selectpicker('refresh');
        return
        }
    else {
        if (selectedLocation == 'RA') {
            console.log('.. RA ..')
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
            console.log('.. BW ..')
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
    console.log('... machineClicked rtn')
    console.log('selectedIndex - '+machineSelected.selectedIndex)
    // CLEAR OTHER SELECTIONS
    if (machineSelected.selectedIndex > 1) {
        document.getElementById('btnEditMachine').style.display='block'
        document.getElementById('btnNewMachine').style.display='none'
        $('.selectpicker').selectpicker('refresh');
        memberSelected.selectedIndex = 0
        instructorSelected.selectedIndex = 0
        $('#memberSelected').prop('selectedIndex',0);
        $('#instructorSelected').prop('selectedIndex',0);
        memberSelected.setAttribute('selectedIndex',0)
        instructorSelected.setAttribute('selectedIndex',0)
    }
    else {
        document.getElementById('btnEditMachine').style.display='none'
        document.getElementById('btnNewMachine').style.display='block'
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

// function machineChanged() {
//     console.log('... machine changed rt')
// }

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
    shopLocation = shopChoice.value
    displayMemberCertifications(villageID,shopLocation)
}

function instructorClicked() {
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

        // Display full description
        var divDescription = document.createElement('div')
        divDescription.classList.add('machineDescription')
        divDescription.id = "D" + data.machineID
        divDescription.innerHTML = data.machineDesc
        dtlParent.appendChild(divDescription)

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
    // DISPLAY MEMBER NAME
    var memberNameHdg = document.createElement('div')
    memberNameHdg.classList.add('memberNameHdg')
    memberNameHdg.innerHTML = data.memberName
    memberData.appendChild(memberNameHdg)

    // Create table
    table = document.createElement('table')
    table.style="margin:auto"

    // tableCaption = document.createElement('caption')
    // tableCaption.style = "caption-side:top;text-align:center"
    // tableCaption.innerHTML = data.memberName
    // table.appendChild(tableCaption)

    tableBody = document.createElement('tbody')
    //tableBody.id = 'memberMachineList'
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
    divHdgText.classList.add('col-3')
    divHdgText.innerHTML="Certified"
    divHdgText.style.fontSize=".75rem"
    divHdgRow.appendChild(divHdgText)

    memberMachinesParent.appendChild(divHdgRow)

    for (m of machine) {
        //console.log('machine ID - '+ m['machineID'])

        // BUILD THE ROW
        var divRow = document.createElement('div')
        divRow.classList.add('row', 'mbrMachRow')
        
        // var blankCol = document.createElement('div')
        // blankCol.classList.add('col-1')
        // divRow.appendChild(blankCol)

        // 'CERTIFY' BUTTON
        // var divColCertifyBtn = document.createElement('div')
        // divColCertifyBtn.classList.add('col-1')

        // var certifyBtn = document.createElement('button')
        // certifyBtn.innerHTML = 'CERTIFY'
        // certifyBtn.id = 'CERTIFY' + m['machineID']
        // certifyBtn.onclick=function() {memberCertification(this.id)}
        // divColCertifyBtn.appendChild(certifyBtn)
        // divRow.appendChild(divColCertifyBtn)

        var blankCol = document.createElement('div')
        blankCol.classList.add('col-1')
        divRow.appendChild(blankCol)

        var chkInput = document.createElement('input')
        chkInput.type="checkbox"
        chkInput.id = "CERTIFY" + m['machineID']
        chkInput.onclick=function() {certifyMember(this)}
        //chkInput.disabled = true
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
        // MACHINE DESCRIPTION (LOCATION)
        var divColMachineDesc = document.createElement('div')
        divColMachineDesc.id = "Desc" + m['machineID']
        divColMachineDesc.classList.add('col-6')
        divColMachineDesc.classList.add('clsMachineDesc')
        divColMachineDesc.innerHTML = m['machineDesc']
        divColMachineDesc.style.textAlign='left'

        // console.log('certificationExpired - '+m['certificationExpired'])
        if (m['certificationExpired']) {
            divColMachineDesc.classList.add('expired')
            //divColMachineDesc.style.textDecoration = 'line-through'
        }

        divRow.appendChild(divColMachineDesc)

        // AUTHORIZATION DURATION
        // var divColCertDuration = document.createElement('div')
        // divColCertDuration.classList.add('col-1')
        // divColCertDuration.innerHTML = m['certificationDuration']
        // divRow.appendChild(divColCertDuration)

        // AUTHORIZATION DATE
        // var divColCertDate = document.createElement('div')
        // divColCertDate.classList.add('col-1')
        // divColCertDate.innerHTML = m['dateCertified']
        // divRow.appendChild(divColCertDate)

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
        // editBtn.onclick=function() {editMemberCertifications(m['machineID'])}
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
    shopLocation = shopChoice.value
    console.log('shopLocation - '+ shopLocation)
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
            divColMachineDesc.classList.add('col-5')
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
    //console.log('machineID - '+machineID)
    //console.log('e.id - '+e.id)
    selectedMachine = document.getElementById(e.id) 
    if (!selectedMachine.checked) {
        alert("Click on 'EDIT' to change or delete certification data.")
        selectedMachine.checked = true
        return
    }
    populateMemberCertificationModal('CERTIFY',machineID)

    return 
}
    //url = window.location.origin + '/certifyMember'
    //villageID = sessionStorage.getItem('villageID')
function editMemberCertification(e) {
    machineID = e.id.slice(4,11)
    populateMemberCertificationModal("EDIT",machineID)

}

function old(){
    let dataToSend = {
        //staffID: staffID,
        villageID: villageID,
        machineID: machineID
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
    // POPULATE certifyModal WITH INSTRUCTORS
        //document.getElementById('certifyMachineID').innerHTML = machineID
        document.getElementById('certifyMachineID').value = machineID
        var descID = 'Desc' + machineID
        document.getElementById('certifyDescription').value = machineID
        document.getElementById('certifyDescription').value = document.getElementById(descID).innerHTML
        document.getElementById('certifyDateCertified').value = data.todaysDisplayDate
        //document.getElementById('certifyDuration').innerHTML = data.defaultDuration
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
            $('#certifyModal').modal('show')
            return
        }
        // BUILD AN OPTION LINE FOR EACH INSTRUCTOR
        for (var element of instructors) {
            var optionLine = document.createElement('option')
            optionLine.innerHTML = element.instructorName
            optionLine.value = element.instructorID
            certificationModalInstructors.appendChild(optionLine)
        }
        $('#certifyModal').modal('show')
    return
    })
}

// CALL ROUTINE TO GET LIST OF INSTRUCTORS FOR THIS MACHINE AND TO SHOW THE MODAL 'certifyModal'
// POPULATE MACHINE ID, DESCRIPTION, DATE CERTIFIED, SET DURATION TO DEFAULT FOR THIS MACHINE
//function editMemberCertification(el) {
function populateMemberCertificationModal(transactionType,machineID) {
    villageID = sessionStorage.getItem('villageID')
    if (transactionType == 'CERTIFY') {
        document.getElementById('deleteAuthorizationModal').style.display="none"
        document.getElementById('transactionType').innerHTML='CERTIFY'
    }
    else {
        document.getElementById('deleteAuthorizationModal').style.display="block"
        document.getElementById('transactionType').innerHTML='EDIT'
    }


    // if (el.slice(0,7) == 'CERTIFY') {
    //     machineID = el.slice(7,14)
    //     console.log(' ... from CERTIFY btn ...'+ machineID)
    //     transactionType = 'CERTIFY'
    //     
    // }
    // if (el.slice(0,4) == 'EDIT') {
    //     machineID = el.slice(4,11)
    //     console.log(' ... from EDIT btn ...'+ machineID)
    //     transactionType = 'EDIT'
    // }
    //  add 'CERTIFY' button and logic ...
    //  chkbox - readonly, no click event
    //  if 'EDIT' then ...

    url = window.location.origin + '/getMachineInstructorsList'
    console.log('url - '+url)
    
    villageID = sessionStorage.getItem('villageID')

    let dataToSend = {
        villageID: villageID,
        machineID: machineID
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
        // POPULATE certifyModal WITH INSTRUCTORS
        //document.getElementById('certifyMachineID').innerHTML = machineID
        document.getElementById('certifyMachineID').value = machineID
        var descID = 'Desc' + machineID
        document.getElementById('certifyDescription').value = machineID
        document.getElementById('certifyDescription').value = document.getElementById(descID).innerHTML
        document.getElementById('certifyDateCertified').value = data.todaysDisplayDate
        
        console.log('defaultDuration - '+data.defaultDuration)
        if (data.defaultDuration !== undefined){
            document.getElementById('certifyDuration').value = data.defaultDuration
        }

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
            $('#certifyModal').modal('show')
            return
        }
        // BUILD AN OPTION LINE FOR EACH INSTRUCTOR
        for (var element of instructors) {
            var optionLine = document.createElement('option')
            optionLine.innerHTML = element.instructorName
            optionLine.value = element.instructorID
            certificationModalInstructors.appendChild(optionLine)
        }
        $('#certifyModal').modal('show')
    return
    })
}

function prtMemberCertifications(memberID) {
    villageID = sessionStorage.getItem('villageID')
    url = '/prtMemberCertifications?villageID='+villageID
    window.location.href=url
}   

function showNewMachineModal() {
    document.getElementById('machineModalTitle').innerHTML = 'ADD NEW MACHINE'
    document.getElementById('newMachineDescription').innerHTML = ''
    document.getElementById('newMachineLocation').value = localStorage.getItem('shopLocation')
    document.getElementById('newCertificationDuration').value = '180 days'
    $('#newMachineModal').modal('show')
    document.getElementById('newMachineDescription').focus()
}
function showEditMachineModal() {
    // nothing selected, return
    //  add code to fetch machine data
    let e = document.getElementById("machineSelected");
    machineID = e.options[e.selectedIndex].getAttribute('data-machineID')
    //selectedMachine = document.getElementById('machineSelected')
    console.log('selectedMachine - '+ machineID)
    //machineID = selectedMachine.data-machineID

    currentDesc = document.getElementById('D'+machineID)
    console.log('currentDesc.innerHTML - ',currentDesc.innerHTML)
    document.getElementById('machineModalTitle').innerHTML = 'EDIT MACHINE DATA'
    document.getElementById('newMachineDescription').value = currentDesc.innerHTML
    document.getElementById('newMachineLocation').value = localStorage.getItem('shopLocation')
    document.getElementById('newCertificationDuration').value = '180 days'
    $('#newMachineModal').modal('show')
    document.getElementById('newMachineDescription').focus()
}
function saveNewMachine() {
    machineDesc = document.getElementById('newMachineDescription').value
    machineLocation = document.getElementById('newMachineLocation').value
    certificationDuration = document.getElementById('newCertificationDuration').value
    // console.log('machineDesc - '+machineDesc)
    // console.log('machineLocation - '+machineLocation)
    // console.log('certificationDuration - '+certificationDuration)
    newKeyInToolCribID = document.getElementById('newKeyInToolCrib')
    if (newKeyInToolCribID.checked==true){
        keyInToolCrib = 1
    }
    else {
        keyInToolCrib = 0
    }
    newKeyProviderID = document.getElementById('newKeyProvider')
    if (newKeyProviderID.checked==true){
        keyProvider = 1
    }
    else {
        keyProvider = 0
    }
 
    url = window.location.origin + '/newMachine'  
    console.log('url - '+url)
        
    let dataToSend = {
        machineDesc: machineDesc,
        machineLocation: machineLocation,
        certificationDuration:certificationDuration,
        keyInToolCrib:keyInToolCrib,
        keyProvider:keyProvider
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
            modalAlert('New machine',data.msg)
        }
        //modalAlert('New Machine',data.msg)
        $('#newMachineModal').modal('hide')
        window.location.href = "/index"
    })
}
function keyChangeTC() {
    if (newKeyInToolCrib.checked == true) {
        newKeyProvider.checked = false
    }
    else {
        newKeyProvider.checked = true
    }
}
function keyChangeProvider() {
    if (newKeyProvider.checked == true) {
        newKeyInToolCrib.checked = false
    }
    else {
        newKeyInToolCrib.checked = true
    }
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
    console.log('memberID - '+memberID)
    machineID = el.id.substring(1,8)
    
    // GET canCertify STATUS
    certifyID = 'C' +  machineID
    if (document.getElementById(certifyID).checked) {
        canCertify = 1
    }
    else {
        canCertify = 0
    }

    // GET canAssist STATUS
    assistID = 'A' +  machineID
    if (document.getElementById(assistID).checked) {
        canAssist = 1
    }
    else {
        canAssist = 0
    }

    // GET keyProvider STATUS
    keyProviderID = 'K' +  machineID
    if (document.getElementById(keyProviderID).checked) {
        keyProvider = 1
    }
    else {
        keyProvider = 0
    }

    // CALL UPDATE ROUTINE
    console.log(machineID,canCertify,canAssist,keyProvider)
    
    let dataToSend = {
        memberID: memberID,
        machineID: machineID,
        canCertify:canCertify,
        canAssist:canAssist,
        keyProvider:keyProvider
    };
    console.log('dataToSend - '+dataToSend)

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
        console.log('after then')
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

function saveCertification(transactionType) {
    console.log('... saveCertification ...')
    //call certify or call save edit ?
}
// END OF FUNCTIONS
