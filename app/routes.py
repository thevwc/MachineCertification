# routes.py

from flask import session, render_template, flash, redirect, url_for, request, jsonify, json, make_response, after_this_request
import pdfkit


from flask_bootstrap import Bootstrap
from werkzeug.urls import url_parse
from app.models import ShopName, Member, MemberActivity, MonitorSchedule, MonitorScheduleTransaction,\
MonitorWeekNote, CoordinatorsSchedule, ControlVariables, DuesPaidYears, Contact, Machines, \
MachineInstructors, MemberMachineCertifications, MachineActivity
from app import app
from app import db
from sqlalchemy import func, case, desc, extract, select, update, text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, DBAPIError
from sqlalchemy.orm import aliased
from sqlalchemy.sql import text as SQLQuery

import datetime as dt
from datetime import date, datetime, timedelta

import os.path
from os import path


from flask_mail import Mail, Message
mail=Mail(app)
import requests

# LOAD INITIAL LOGIN PAGE
@app.route('/',methods=['GET','POST'])
@app.route('/login',methods=['GET','POST'])
def login(): 
    if request.method != 'POST':
        return render_template("login.html")

    # PROCESS DATA FROM LOGIN FORM
    memberID = request.form['memberID']
    password = request.form['password']
    return render_template("login.html")

# MAIN PAGE
@app.route('/index')
def index():
    # get shop location from URL
    #shopLocation = 'BW'

     # BUILD ARRAY OF MACHINE NAMES FOR DROPDOWN LIST OF MACHINES
    #machineNames=[]
    sqlMachines = "SELECT machineID, machineDesc, machineLocation + ' - ' + machineDesc + ' (' + machineID + ')' as machineDisplayName, machineLocation, "
    sqlMachines += "suggestedCertificationDuration, keyInToolCrib, keyProvider "
    sqlMachines += "FROM MachinesRequiringCertification "
    sqlMachines += "ORDER BY machineLocation, machineDesc "
    
    machineList = db.engine.execute(sqlMachines)
    if machineList == None:
        flash('No machines to list.','danger')
    
    # CREATE OBJECT OF NAMES FOR DROPDOWN LIST OF MEMBERS
    sqlNames = "SELECT Last_Name + ', ' + First_Name + ' (' + Member_ID + ')' as memberDisplayName,"
    sqlNames += " Member_ID as villageID FROM tblMember_Data "
    sqlNames += "WHERE Dues_Paid <> 0 "
    sqlNames += "ORDER BY Last_Name, First_Name "

    memberList = db.engine.execute(sqlNames)
    if memberList == None:
        flash('No names to list.','danger')
   
    # CREATE OBJECT OF NAMES FOR DROPDOWN LIST OF INSTRUCTORS
    sqlNames = "SELECT Last_Name + ', ' + First_Name + ' (' + Member_ID + ')' as instructorDisplayName,"
    sqlNames += " Member_ID as villageID FROM tblMember_Data "
    # sqlNames += "WHERE machineCertificationStaff = 1 "
    sqlNames += "ORDER BY Last_Name, First_Name "

    instructorList = db.engine.execute(sqlNames)
    if instructorList == None:
        flash('No names to list.','danger')
    
    # for m in machineList:
    #     print(m.machineID, m.suggestedCertificationDuration)

    return render_template("index.html",machineList=machineList,memberList=memberList,instructorList=instructorList)
    
@app.route('/getMemberLoginData',methods=['POST'])
def getMemberLoginData():
    req = request.get_json()
    memberID = req["memberID"]
    req = request.get_json()
    password = req["password"]

    #  LOOK UP MEMBER ID
    member = db.session.query(Member).filter(Member.Member_ID == memberID).first()
    if member == None:
        msg = "This village ID was not found."
        return jsonify(msg=msg,status=200)
    
    memberName = member.First_Name + ' ' + member.Last_Name
    if member.Nickname != '' and member.Nickname != None:
        memberName = member.First_Name + ' (' + member.Nickname + ') ' + member.Last_Name

    if password != member.Password:
        msg = "The password does not match the password on file for <br>" + memberName + "."
        return jsonify(msg=msg,status=200)
    print('member.machineCertificationStaff - ',member.machineCertificationStaff)
    
    if member.machineCertificationStaff != True:
        msg = "You are not currently authorized to use this application."
        return jsonify(msg=msg)

    msg = "Authorized"
    return jsonify(msg=msg,status=200)
    
@app.route('/displayMachineInstructorsMembersUsage',methods=['GET','POST'])
def displayMachineData():
    req = request.get_json()
    machineID = req["machineID"]

    machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
    if machine == None:
        msg = "Machine ID " + machineID + " was not found."
        return jsonify(msg=msg,status=400)
    
    if machine.keyNumber :
        keyNumber = machine.keyNumber
        displayKeyNumber = " (key# " + machine.keyNumber + ") "
    else:
        keyNumber = ''
        displayKeyNumber = ''

    machineDesc = machine.machineDesc + displayKeyNumber + ' at ' + machine.machineLocation
    machineLocation = machine.machineLocation
    machineDuration = machine.suggestedCertificationDuration
    keyInToolCrib = machine.keyInToolCrib
    keyProvider = machine.keyProvider
    
    

    # GET INSTRUCTORS FOR THIS MACHINE
        # GET INSTRUCTOR FOR THIS MACHINE
    instructorsDict = []
    instructorsItem = []
    sp = "EXEC staffForSpecificMachine '" + machineID + "'"
    # sp = "EXEC instructorsForSpecificMachine '" + machineID + "'"
    sql = SQLQuery(sp)
    instructors = db.engine.execute(sql)
    if instructors == None:
        instructorName = 'No instructors assigned.'
        instructorsItem = {
            'instructorName':instructorName,
            'canCertify':'0',
            'keyProvider':'0',
            'canAssist':'0'
        }
        instructorsDict.append(instructorsItem)
    else:
        for i in instructors:
            instructorName = i.First_Name 
            if i.Nickname is not None:
                if len(i.Nickname) > 0 :
                    instructorName += ' (' + i.Nickname + ')'
            instructorName += ' ' + i.Last_Name
            
            instructorsItem = {
                'machineID':machineID,
                'instructorName':instructorName,
                'canCertify':i.canCertify,
                'keyProvider':i.keyProvider,
                'canAssist':i.canAssist
            }
            instructorsDict.append(instructorsItem)

    # GET MEMBERS CERTIFIED FOR THIS MACHINE
    certifiedDict = []
    certifiedItem = []
    sp = "EXEC membersCertifiedForSpecificMachine '" + machineID + "'"
    sql = SQLQuery(sp)
    certified = db.engine.execute(sql)
    if certified == None:
        memberName = 'No members have been certified.'
        certifiedItem = {
                'memberID':'',
                'memberName':memberName,
                'machineID':machineID,
                'dateCertified':'',
                'certifiedBy':''
        }
        certifiedDict.append(certifiedItem)
    else:
        for c in certified:
            memberName = c.First_Name
            if c.Nickname is not None:
                if len(c.Nickname) > 0 :
                    memberName += ' (' + c.Nickname + ')'
            memberName += ' ' + c.Last_Name

            instructorID = c.certifiedBy
            instructor = db.session.query(Member).filter(Member.Member_ID == instructorID).first()
            if (instructor == None):
                instructorName = "Unknown"
            else:
                instructorName = instructor.Last_Name + ', ' + instructor.First_Name
                if instructor.Nickname is not None:
                    if len(instructor.Nickname) > 0 :
                        instructorName += ' (' + instructor.Nickname + ')'

            certifiedItem = {
                'memberID':c.villageID,
                'memberName':memberName,
                'machineID':c.machineID,
                'dateCertified':c.dateCertified,
                'certifiedBy':instructorName
            }
            certifiedDict.append(certifiedItem)

           
    # GET MACHINE USAGE FROM MachineActivity table
    usageDict = []
    usageItem = []

    sp = "EXEC machineUsageForSpecificMachine '" + machineID + "'"
    sql = SQLQuery(sp)
    usage = db.engine.execute(sql)
    if usage == None:
        memberName = 'No members have been usage.'
        usageItem = {
                'memberID':'',
                'memberName':'',
                'machineID':machineID,
                'usageDate':''        
        }
        usageDict.append(usageItem)
    else:
        for u in usage:
            memberName = u.first_name
            if u.nickname is not None:
                if len(u.nickname) > 0 :
                    memberName += ' (' + u.nickname + ')'
            memberName += ' ' + u.last_name
            activityDate = u.startDateTime.strftime('%m-%d-%Y %H:%M')
            usageItem = {
                'memberID':u.member_ID,
                'memberName':memberName,
                'machineID':u.machineID,
                'usageDate':activityDate + '  -  ' + memberName
            }
            usageDict.append(usageItem)
        
    msg="Success"
    status=200
    return jsonify(msg=msg,status=status,machineLocation=machineLocation,machineID=machineID,\
        machineDesc=machineDesc,machineDuration=machineDuration,keyNumber=keyNumber,\
        instructorsDict=instructorsDict,\
        certifiedDict=certifiedDict,UsageDict=usageDict,keyInToolCrib=keyInToolCrib,keyProvider=keyProvider)


@app.route('/displayMemberData',methods=['POST'])
def displayMemberData():
    req = request.get_json() 
    villageID = req["villageID"]
    shopLocation = req["shopLocation"]
    mbr = db.session.query(Member).filter(Member.Member_ID == villageID).first()
    if (mbr == None):
        msg="Member not found"
        status=400
        return jsonify(msg=msg,status=status)

    memberName = mbr.First_Name
    if mbr.Nickname is not None:
        if len(mbr.Nickname) > 0 :
            memberName += ' (' + mbr.Nickname + ')'
    memberName += ' ' + mbr.Last_Name
    mobilePhone = mbr.Cell_Phone
    homePhone = mbr.Home_Phone
    eMail = mbr.eMail
    msg="Success"
    
    # Get all machines and mark those this member is certified
    machineDict = []
    machineItem = []
    machines = db.session.query(Machines).order_by(Machines.machineDesc)
    #.order(Machines.machineLocation,Machines.machineDesc)
    for m in machines:
        certificationExpired = False 
        if m.machineLocation == shopLocation or shopLocation == 'BOTH':
            # GET MEMBER DATA FOR THIS MACHINE, IF ANY
            mbrCert = db.session.query(MemberMachineCertifications)\
                .filter(MemberMachineCertifications.machineID == m.machineID)\
                .filter(MemberMachineCertifications.member_ID == villageID).first()
            if mbrCert == None:
                memberCertified = False
                certificationDuration = ''
                dateCertified = ''
                certifiedBy = ''
                certificationExpired = False
            else:
                memberCertified = True
                
                certificationDuration = mbrCert.certificationDuration
                if certificationDuration == None: 
                    certificationDuration = ''

                # HAS CERTIFICATION EXPIRED?
                dateCertified = mbrCert.dateCertified.strftime("%m/%d/%Y")
                if dateCertified == None:
                    dateCertified = ''
                    daysElapsed = 0
                else:
                    today=date.today()
                    delta = today - mbrCert.dateCertified
                    daysElapsed = delta.days  
                
                certificationExpired = False
                
                if certificationDuration.rstrip() == 'UNL':
                    certificationExpired = False
                if certificationDuration.rstrip() == '365 days':
                    if daysElapsed > 365:
                        certificationExpired = True
                if certificationDuration.rstrip() == '180 days':
                    if daysElapsed > 180:
                        certificationExpired = True
                if certificationDuration.rstrip() == '90 days':
                    if daysElapsed > 90:
                        certificationExpired = True
                if certificationDuration.rstrip() == '60 days':
                    if daysElapsed > 60:
                        certificationExpired = True
                if certificationDuration.rstrip() == '30 days':
                    if daysElapsed > 30:
                        certificationExpired = True
                if certificationDuration.rstrip() == '7 days':
                    if daysElapsed > 7:
                        certificationExpired = True

                certifiedBy = mbrCert.certifiedBy
                if certifiedBy == None:
                    certifiedBy = ''
                
            machineItem = {
                'machineID': m.machineID,
                'machineDesc': m.machineDesc + ' ('+m.machineLocation + ')', #- '+ dateCertified + ' ['+certificationDuration + '] '+certifiedBy,
                'machineLocation': m.machineLocation,
                'memberCertified':memberCertified,
                'certificationExpired':certificationExpired,
                'certificationDuration': certificationDuration,
                'dateCertified': dateCertified,
                'certifiedBy': certifiedBy
            }
            machineDict.append(machineItem)
        # END OF FOR LOOP
    return jsonify(msg=msg,memberName=memberName,mobilePhone=mobilePhone,homePhone=homePhone,eMail=eMail,machineDict=machineDict)

@app.route('/displayMachineInstructors',methods=['GET','POST'])
def displayMachineInstructors():
    
    req = request.get_json()
    instructorID = req["instructorID"]
    shopLocation = req["shopLocation"]
    
    instructor = db.session.query(Member).filter(Member.Member_ID == instructorID).first()
    if instructor == None:
        msg = "Instructor ID " + instructorID + " was not found."
        return jsonify(msg=msg,status=201)
    instructorName = instructor.First_Name
    if instructor.Nickname is not None:
        if len(instructor.Nickname) > 0 :
            instructorName += ' (' + instructor.Nickname + ')'
    instructorName += ' ' + instructor.Last_Name
    mobilePhone = instructor.Cell_Phone
    homePhone = instructor.Home_Phone
    eMail = instructor.eMail
    msg="Instructor found."

    # Get all machines and mark those this instructor may certifify
    machineDict = []
    machineItem = []
    machines = db.session.query(Machines).order_by(Machines.machineDesc)
    
    for m in machines:
        machInstr = db.session.query(MachineInstructors)\
            .filter(MachineInstructors.machineID == m.machineID)\
            .filter(MachineInstructors.member_ID == instructorID).first()
        
        if machInstr == None:
            canCertify = 0
            canAssist = 0
            keyProvider = 0
        else:
            canCertify = machInstr.canCertify
            canAssist = machInstr.canAssist
            keyProvider = machInstr.keyProvider

        if m.machineLocation == shopLocation or shopLocation == 'BOTH':
            machineItem = {
                'machineID': m.machineID,
                'machineDesc': m.machineDesc,
                'machineLocation': m.machineLocation,
                'canCertify':canCertify,
                'canAssist':canAssist,
                'keyProvider':keyProvider
            }
            machineDict.append(machineItem)
        msg="Success"
    return jsonify(msg=msg,status=200,instructorName=instructorName,mobilePhone=mobilePhone,\
        homePhone=homePhone,eMail=eMail,machineDict=machineDict)


@app.route('/certifyMember',methods=['GET','POST'])
def certifyMember():  
    req = request.get_json()
    transactionType = req["certifyTransactionType"]
    memberID = req["memberID"]
    machineID = req["machineID"]
    certifiedBy = req["certifiedBy"]
    duration = req["duration"]
    dateCertified = req["dateCertified"]
    todaysDate = date.today().strftime('%Y-%m-%d')

    # GET THE MEMBERS CURRENT CERTIFICATION RECORD
    if (transactionType == 'EDIT'):
        mbrCert = db.session.query(MemberMachineCertifications)\
            .filter(MemberMachineCertifications.machineID == machineID)\
            .filter(MemberMachineCertifications.member_ID == memberID).first()
        if (mbrCert == None):
            msg="Record not found"
            return jsonify(msg=msg,status=201)
        mbrCert.certificationDuration = duration
        mbrCert.certifiedBy = certifiedBy
        mbrCert.dateCertified = dateCertified
        try:
            db.session.commit()
            msg="Record updated"
            return jsonify(msg=msg,status=200)
        except:
            msg="Could not save changes"
            return jsonify(msg=msg,status=201)

    if (transactionType == 'NEW'):
        # CREATE NEW RECORD
        sqlInsert = "INSERT INTO memberMachineCertifications (member_ID,dateCertified,certifiedBy,machineID,certificationDuration)"
        sqlInsert += " VALUES('" + memberID + "', '" + dateCertified + "', '" + certifiedBy + "', '" + machineID + "', '" + duration + "')"
    
        try:
            certification = db.engine.execute(sqlInsert)
            msg="New certification record added."
            return jsonify(msg=msg,status=200)
        except (SQLAlchemyError, DBAPIError) as e:
            print("ERROR -",e)
            flash("ERROR - DB error")
            msg='Record could not be inserted'
            return jsonify(msg=msg,status=201)


@app.route('/deCertifyMember',methods=['GET','POST'])
def deCertifyMember():
    req = request.get_json()
    memberID = req["memberID"]
    machineID = req["machineID"]
    
    sqlDelete = "DELETE FROM memberMachineCertifications "
    sqlDelete += " WHERE member_ID = '" + memberID + "' and machineID = '" + machineID + "'"
   
    try:
        certification = db.engine.execute(sqlDelete)
        msg="Authorization removed."
        return jsonify(msg=msg,status=200)
    except (SQLAlchemyError, DBAPIError) as e:
        print("ERROR -",e)
        flash("ERROR - DB error")
        msg='Record could not be deleted'
        return jsonify(msg=msg,status=201)
    
@app.route('/prtMemberCertifications')
def prtMemberCertifications():
    villageID=request.args.get('villageID')
    today=date.today()
    todaysDate = today.strftime('%B %d, %Y')

    # Get the member's name and contact info
    mbr = db.session.query(Member).filter(Member.Member_ID == villageID).first()
    if (mbr == None):
        msg="Member not found"
        status=400
        return jsonify(msg=msg,status=status)
    memberName = mbr.First_Name
    if mbr.Nickname is not None:
        if len(mbr.Nickname) > 0 :
            memberName += ' (' + mbr.Nickname + ')'
    memberName += ' ' + mbr.Last_Name
    mobilePhone = mbr.Cell_Phone
    homePhone = mbr.Home_Phone
    eMail = mbr.eMail

    # Get the machines the member is certified
    machinesCertifiedDict = []
    machinesCertifiedItem = []
    machinesCertified = db.session.query(MemberMachineCertifications)\
            .filter(MemberMachineCertifications.member_ID == villageID)
    # If not certifed for any machines ...
    if (machinesCertified == None):
        machinesCertifiedItem = {
            'machineID': '',
            'machineDesc': 'Nothing certified',
            'machineLocation': '',
            'dateCertified': ''
        }
        machinesCertifiedDict.append(machineItem)
        return render_template("memberCerts.html",todaysDate=todaysDate,\
            memberName=memberName,villageID=villageID,\
            machineDict=machineDict)
            
    # List the machines for which the member is certified
    for mc in machinesCertified:
        machineID = mc.machineID
        # Look up specific machine to get description and location
        machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
        if (machine == None):
            msg="Missing machine record # " + machineID + "."
            return jsonify(msg=msg,status=201)
        
        dateCertified=mc.dateCertified.strftime('%m-%d-%Y')
        
        machinesCertifiedItem = {
            'machineID': machineID,
            'machineDesc': machine.machineDesc  + ' ('+ machineID + ')',
            'machineLocation': machine.machineLocation,
            'dateCertified':dateCertified
        }
        
        machinesCertifiedDict.append(machinesCertifiedItem)
        
    return render_template("memberCerts.html",todaysDate=todaysDate,\
            memberName=memberName,villageID=villageID,\
            machinesCertifiedDict=machinesCertifiedDict)

@app.route('/editMachine',methods=['GET','POST'])
def editMachine():
    req = request.get_json()
    machineID = req["machineID"]
    machineDesc = req["machineDesc"]
    keyNumber = req["keyNumber"]
    machineLocation = req["machineLocation"]
    suggestedCertificationDuration = req["suggestedCertificationDuration"]
    #suggestedCertificationDuration = suggestedCertificationDuration.replace(' days','')
    keyInToolCrib = req["keyInToolCrib"]
    keyProvider = req["keyProvider"]

    machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
    if (machine == None):
        return jsonify(msg="Machine not found.",status=201)
    try:
        machine.machineDesc = machineDesc
        machine.machineLocation = machineLocation
        machine.suggestedCertificationDuration = suggestedCertificationDuration
        machine.keyInToolCrib = keyInToolCrib
        machine.keyProvider = keyProvider
        machine.keyNumber = keyNumber
        db.session.commit()
        msg="Update succeeded"
        print(msg)
        return jsonify(msg=msg,status=200)
    except SQLAlchemyError as e:
        db.session.rollback()
        error = str(e.__dict__['orig'])
        msg = "SQLAlchemyError - " + error
        print(msg)
        return jsonify(msg=msg,status=201)
    except (DBAPIError) as e:
        db.session.rollback()
        error = str(e.__dict__['orig'])
        msg = "DPAPIError - " + error
        print(msg)
        return jsonify(msg=msg,status=201)
    except (IntegrityError) as e:
        db.session.rollback()
        error = str(e.__dict__['orig'])
        msg = "IntegrityError - " + error
        print(msg)
        return jsonify(msg=msg,status=201)   
    except:
        db.session.rollback()
        msg="Update failed."
        print(msg)
        return jsonify(msg=msg,status=201)
#except (sqlalchemy.exc.SQLAlchemyError, sqlalchemy.exc.DBAPIError) as e:

@app.route('/newMachine',methods=['GET','POST'])
def newMachine():  
    req = request.get_json()
    machineDesc = req["machineDesc"]
    keyNumber = req["keyNumber"]
    machineLocation = req["machineLocation"]
    suggestedCertificationDuration = req["suggestedCertificationDuration"]
    keyInToolCrib = req["keyInToolCrib"]
    keyProvider = req["keyProvider"]
    machineID = getNextMachineID()
    
    if (keyInToolCrib):
        keyInToolCribNumber = 1
    else:
        keyInToolCribNumber = 0

    if (keyProvider):
        keyProviderNumber = 1
    else:
        keyProviderNumber = 0

    # newMachine = Machines(
    #     machineID=machineID,
    #     machineDesc=machineDesc,
    #     machineLocation=machineLocation,
    #     certificationDuration=certificationDuration,
    #     keyInToolCrib=keyInToolCrib,
    #     callKeyProvider=keyProvider
    # )
    # try:
    #     db.session.add(newMachine)
    #     db.session.commit()
    #     msg("Success")
    #     return jsonify(msg=msg,status=200)
    # except:
    #     db.session.rollback()
    #     msg='Add machine failed.'
    #     return jsonify(msg=msg,status=201)

    sqlInsert = "INSERT INTO [machinesRequiringCertification] ([machineID],[machineDesc], [machineLocation],"
    sqlInsert += "suggestedCertificationDuration,keyInToolCrib,keyProvider,keyNumber) "
    sqlInsert += " VALUES ('" + machineID + "', '" +  machineDesc +"', '" + machineLocation + "', '" 
    sqlInsert += suggestedCertificationDuration + "', '" + str(keyInToolCribNumber) + "', '" + str(keyProviderNumber) + "', '" + str(keyNumber) + "')"
   
    try:
        result = db.engine.execute(sqlInsert)
        if result != 0:
            return jsonify(msg="Machine added.",status=200)
        else:
            return jsonify(msg="Add failed.",status=201)
    except (SQLAlchemyError, DBAPIError) as e:
        print("ERROR -",e)
        flash("ERROR - DB error")
        msg='Record could not be inserted'
        return jsonify(msg=msg,status=201)


def getNextMachineID():
    lastUsedID = db.session.query(func.max(Machines.machineID)).scalar() 
    strNumber = (lastUsedID[1:5])
    intNumber = int(strNumber)+1
    id = f'{intNumber:04d}'
    sum = (int(id[0]) * 13) + (int(id[1]) * 7) + (int(id[2]) * 5) + (int(id[3]) * 3)
    chkdigits = sum % 11 
    newMachineID = 'E' + id + f'{chkdigits:02d}'
    return newMachineID


@app.route('/deleteMachine', methods=['GET','POST'])
def deleteMachine():
    req = request.get_json()
    machineID = req["machineID"]
    sqlDelete = "DELETE FROM machinesRequiringCertification "
    sqlDelete += "WHERE machineID = '" + machineID + "'"

    try:
        result = db.engine.execute(sqlDelete)
        
        if result != 0:
            print('success')
            return jsonify(msg="Machine deleted.",status=200)
        else:
            print('failed')
            return jsonify(msg="Delete failed.",status=201)
    except SQLAlchemyError as e:
        #db.session.rollback()
        error = str(e.__dict__['orig'])
        msg = "SQLAlchemyError - " + error
        print(msg)
        return jsonify(msg=msg,status=201)
    except (DBAPIError) as e:
        #db.session.rollback()
        error = str(e.__dict__['orig'])
        msg = "DPAPIError - " + error
        print(msg)
        return jsonify(msg=msg,status=201)
    except (IntegrityError) as e:
        #db.session.rollback()
        error = str(e.__dict__['orig'])
        msg = "IntegrityError - " + error
        print(msg)
        return jsonify(msg=msg,status=201)   
    except:
        #db.session.rollback()
        msg="Delete failed."
        print(msg)
        return jsonify(msg=msg,status=201)

@app.route('/updateInstructorMachineSettings',methods=['GET','POST'])
def updateInstructorMachineSettings():
    req = request.get_json()
    memberID=req["memberID"]
    machineID = req["machineID"]
    canCertify=req["canCertify"]
    canAssist=req["canAssist"]
    keyProvider=req["keyProvider"]

    # print('memberID - ',memberID)
    # print('machineID - ',machineID)
    # print('canCertify - ',canCertify)
    # print('keyProvider - ',keyProvider)
    # print('canAssist - ',canAssist)

    if not canCertify and not canAssist and not keyProvider:
        try:
            removeInstructor = db.session.query(MachineInstructors)\
                .filter(MachineInstructors.member_ID == memberID)\
                .filter(MachineInstructors.machineID == machineID)\
                .delete()
            db.session.commit()
            msg = "Record deleted for member ID " + memberID + " on machine # " + machineID
            return jsonify(msg=msg,status=200)
        except:
            db.session.rollback()
            msg = "Record could NOT be deleted for member ID " + memberID + " on machine # " + machineID
            return jsonify(msg=msg,status=201)

    # LOOK UP MACHINE INSTRUCTORS RECORD    
    machineInstructor = db.session.query(MachineInstructors).filter(MachineInstructors.member_ID == memberID)\
        .filter(MachineInstructors.machineID == machineID).first()
    if machineInstructor != None:
        #  UPDATE CURRENT RECORD
        machineInstructor.canCertify = canCertify
        machineInstructor.canAssist = canAssist
        machineInstructor.keyProvider = keyProvider
        
        try:
            db.session.commit()
            return jsonify(msg="Update succeeded",status=200)
        except (SQLAlchemyError, DBAPIError) as e:
            return jsonify(msg='SQLAlchemyError, DPAPIError' + e)
        except:
            db.session.rollback()
            return jsonify(msg="Update failed.",status=201)
    else:
        print('machineID - ',machineID)
        print('memberID - ',memberID)
        # memberID is missing ????
        sqlInsert = "INSERT INTO machineInstructors (machineID, member_ID, canCertify, canAssist, keyProvider) "
        sqlInsert += "VALUES ('" + machineID + "', '" + memberID + "'," + str(canCertify) + "," + str(canAssist) + "," + str(keyProvider) + ")"
        print(sqlInsert)
        try:
            result = db.engine.execute(sqlInsert)
            if result != 0:
                return jsonify(msg="Add successful.",status=200)
            else:
                return jsonify(msg="Add NOT successful.",status=201) 
        except (SQLAlchemyError, DBAPIError) as e:
            print("ERROR -",e)
            return jsonify(msg='SQLAlchemyError, DPAPIError')
        except:
            print("unknown add error")
            msg='Add machineInstructor failed.'
            return jsonify(msg=msg,status=201)

# GET DATA FOR MEMBER CERTIFICATION MODAL
@app.route('/getDataForCertificationModal',methods=['GET','POST'])
def getDataForCertificationModal():
    req = request.get_json()
    machineID = req["machineID"]
    villageID = req["villageID"]
    transactionType = req["certifyTransactionType"]
    certifiedBy = ''

    # GET DATA COMMON TO BOTH 'NEW' AND 'EDIT'
    try:
        machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
    except (SQLAlchemyError, DBAPIError) as e:
        msg='Database error - ' + e
        print(msg)
        return jsonify(msg=msg,status=201) 
    
    machineDesc = machine.machineDesc + "(" + machine.machineLocation + ")"
    machineDuration = machine.suggestedCertificationDuration
    suggestedDuration = 'Std - ' + machineDuration
    
    # TRANSACTION DEPENDENT DATA FOR AUTHORIZATION MODAL FORM
    if transactionType == "NEW":
        # DATA FOR NEW CERTIFICATIONS
        dateCertified = date.today()
        dateCertifiedSTR = dateCertified.strftime('%Y-%m-%d')
        suggestedCertificationDuration = machineDuration
        certificationDuration = machineDuration
        print('machineDuration - ',machineDuration)

        certifiedBy = ''
    else:
        # DATA FOR EDIT OF EXISTING CERTIFICATION
        suggestedCertificationDuration = machine.suggestedCertificationDuration
       
        try:
            memberCertification = db.session.query(MemberMachineCertifications)\
                .filter(MemberMachineCertifications.machineID == machineID)\
                .filter(MemberMachineCertifications.member_ID == villageID).first()
        except (SQLAlchemyError, DBAPIError) as e:
            msg='Database error - ' + e
            print(msg)
            return jsonify(msg=msg,status=201) 
        
        dateCertifiedSTR = memberCertification.dateCertified.strftime('%Y-%m-%d')

        certificationDuration = memberCertification.certificationDuration
        certifiedBy = memberCertification.certifiedBy
       
    # INSTRUCTORS ASSIGNED TO THIS MACHINE FOR DROP-DOWN LIST
    instructorsDict = []
    instructorItem = []
    sp = "EXEC instructorsForSpecificMachine '" + machineID + "'"
    sql = SQLQuery(sp)
    try:
        instructors = db.engine.execute(sql)
    except (SQLAlchemyError, DBAPIError) as e:
        print("ERROR -",e)
        flash("ERROR - DB error")
        msg='Database error.'
        return jsonify(msg=msg,status=201)
    if instructors == None:
        instructorItem = {
            'machineID': '',
            'instructorName': "No instructors assigned.",
            'todaysDate':todaysDate,
            'defaultDuration':defaultDuration,
            'instructorID':''
        }
        
        instructorsDict.append(instructorItem)
    else:
        for i in instructors:
            instructorItem = {
                'machineID': i.machineID,
                'instructorName': i.LFN_Name,
                'instructorID':i.villageID
            }
            instructorsDict.append(instructorItem)
            
    return jsonify(msg='No msg',status=200,machineDesc=machineDesc,\
        dateCertified=dateCertifiedSTR,certificationDuration=certificationDuration,\
        suggestedCertificationDuration=suggestedCertificationDuration,\
        instructorsDict=instructorsDict,certifiedBy=certifiedBy, transactionType=transactionType)    

@app.route('/listCertified',methods=['GET'])
def listCertified():
    shopLocation = request.args.get('shopLocation')
    
    if (shopLocation == 'RA'):
        shopName = 'Rolling Acres'
        whereClause = "WHERE machineLocation = 'RA' "
    else:
        if (shopLocation =='BW'):
            shopName = 'Brownwood'
            whereClause = "WHERE machineLocation = 'BW' "
        else:
            shopName = 'Both locations'
            whereClause = ''

    todays_date = date.today()
    todays_dateSTR = todays_date.strftime('%B %-d, %Y')

    sqlSelect = "select m1.lfn_name as memberName, machineDesc, memberMachineCertifications.machineID, machineLocation, dateCertified, "
    sqlSelect += "certificationDuration, certifiedBy, m2.initials as instructorInitials FROM memberMachineCertifications "
    sqlSelect += "left join tblMember_Data m1 on memberMachineCertifications.member_ID = m1.member_ID "
    sqlSelect += "left join machinesRequiringCertification on memberMachineCertifications.machineID = machinesRequiringCertification.machineID "
    sqlSelect += "left join tblMember_Data m2 on memberMachineCertifications.certifiedBy = m2.member_ID "
    sqlSelect += whereClause + " "
    sqlSelect += "order by m1.lfn_name, machineDesc"
   
    certified = db.session.execute(sqlSelect)

    certifiedDict = []
    certifiedItem = []

    saveMemberName = ''
    for c in certified:
        if c.machineDesc == None or c.machineLocation == None:
            continue
        
        if c.memberName != saveMemberName :
            memberName = c.memberName
        else:
            memberName = ''

        if shopLocation.upper() == 'BOTH':
            machineDesc = c.machineDesc + " (" + c.machineLocation + ")"
        else:
            machineDesc = c.machineDesc

        # Is certification expired?
        today=date.today()
        delta = today - c.dateCertified
        daysElapsed = delta.days

        certificationDuration = c.certificationDuration
        certificationExpired = False
        if certificationDuration.rstrip() == 'UNL':
            certificationExpired = False
        if certificationDuration.rstrip() == '365 days':
            if daysElapsed > 365:
                certificationExpired = True
        if certificationDuration.rstrip() == '180 days':
            if daysElapsed > 180:
                certificationExpired = True
        if certificationDuration.rstrip() == '90 days':
            if daysElapsed > 90:
                certificationExpired = True
        if certificationDuration.rstrip() == '60 days':
            if daysElapsed > 60:
                certificationExpired = True
        if certificationDuration.rstrip() == '30 days':
            if daysElapsed > 30:
                certificationExpired = True
        if certificationDuration.rstrip() == '7 days':
            if daysElapsed > 7:
                certificationExpired = True

        certifiedItem = {
            'memberName':memberName,
            'machineDesc':machineDesc,
            'duration':c.certificationDuration,
            'dateCertified':c.dateCertified.strftime('%-m-%-d-%Y'),
            'certifiedBy':c.instructorInitials,
            'expired':certificationExpired
        }
        
        saveMemberName = c.memberName

        certifiedDict.append(certifiedItem)

    return render_template("rptCertifiedList.html",\
        todaysDate=todays_dateSTR,certifiedDict=certifiedDict,shopName=shopName
        )


@app.route('/listMachines',methods=['GET'])
def listMachines():
    shopLocation = request.args.get('shopLocation')
    
    if (shopLocation == 'RA'):
        shopName = 'Rolling Acres'
        whereClause = "WHERE machineLocation = 'RA' "
    else:
        if (shopLocation =='BW'):
            shopName = 'Brownwood'
            whereClause = "WHERE machineLocation = 'BW' "
        else:
            shopName = 'Both locations'
            whereClause = ''

    todays_date = date.today()
    todays_dateSTR = todays_date.strftime('%B %-d, %Y')

    # sqlSelect = "select lfn_name, machineDesc, canCertify, machineInstructors.keyProvider as key_Provider, "
    # sqlSelect += "canAssist from machineInstructors "
    # sqlSelect += "left join tblMember_Data on machineInstructors.member_ID = tblMember_Data.member_ID "
    # sqlSelect += "left join machinesRequiringCertification on machineInstructors.machineID = machinesRequiringCertification.machineID "
    # sqlSelect += whereClause + " "
    # sqlSelect += "order by lfn_name, machineDesc"
    sqlSelect = "SELECT machineDesc, machineID, machineLocation, suggestedCertificationDuration, "
    sqlSelect += "keyInToolCrib, keyProvider, keyNumber "
    sqlSelect += "FROM machinesRequiringCertification "
    sqlSelect += whereClause
    sqlSelect += " ORDER BY machineDesc"
    machines = db.session.execute(sqlSelect)

    machinesDict = []
    machinesItem = []

    for m in machines:

        if shopLocation == 'Both':
            machineDesc = m.machineDesc + " (" + m.machineLocation + ")"
        else:
            machineDesc = m.machineDesc

        machinesItem = {
            'machineDesc':machineDesc,
            'machineID':m.machineID,
            'machineDuration':m.suggestedCertificationDuration,
            'keyInToolCrib':m.keyInToolCrib,
            'keyProvider':m.keyProvider,
            'keyNumber':m.keyNumber
        }
        machinesDict.append(machinesItem)

    return render_template("rptMachineList.html",\
        todaysDate=todays_dateSTR,machinesDict=machinesDict,shopName=shopName
        )
    
@app.route('/listStaff',methods=['GET'])
def listStaff():
    shopLocation = request.args.get('shopLocation')
    
    if (shopLocation == 'RA'):
        shopName = 'Rolling Acres'
        whereClause = "WHERE machineLocation = 'RA' "
    else:
        if (shopLocation =='BW'):
            shopName = 'Brownwood'
            whereClause = "WHERE machineLocation = 'BW' "
        else:
            shopName = 'Both locations'
            whereClause = ''

    todays_date = date.today()
    todays_dateSTR = todays_date.strftime('%B %-d, %Y')

    sqlSelect = "select lfn_name, machineDesc, canCertify, machineInstructors.keyProvider as key_Provider, "
    sqlSelect += "canAssist from machineInstructors "
    sqlSelect += "left join tblMember_Data on machineInstructors.member_ID = tblMember_Data.member_ID "
    sqlSelect += "left join machinesRequiringCertification on machineInstructors.machineID = machinesRequiringCertification.machineID "
    sqlSelect += whereClause + " "
    sqlSelect += "order by lfn_name, machineDesc"
    

    staff = db.session.execute(sqlSelect)

    staffDict = []
    staffItem = []

    saveMemberName = ''
    for s in staff:
        if s.lfn_name != saveMemberName :
            memberName = s.lfn_name
        else:
            memberName = ''

        staffItem = {
            'memberName':memberName,
            'machineDesc':s.machineDesc,
            'canCertify':s.canCertify,
            'keyProvider':s.key_Provider,
            'canAssist':s.canAssist
        }
        saveMemberName = s.lfn_name

        staffDict.append(staffItem)

    return render_template("rptStaffList.html",\
        todaysDate=todays_dateSTR,staffDict=staffDict,shopName=shopName
        )

@app.route('/getMachineDataForEditModal',methods=['GET','POST'])
def getMachineDataForEditModal():
    print('/getMachineDataForEditModal')
    req = request.get_json()
    machineID = req["machineID"]

    try:
        machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
    except (SQLAlchemyError, DBAPIError) as e:
        msg='Database error - ' + e
        print(msg)
        return jsonify(msg=msg,status=201) 
    
    machineDesc = machine.machineDesc
    machineDuration = machine.suggestedCertificationDuration
    print('machineDuration - ',machineDuration)
    
    machineLocation = machine.machineLocation
    keyInToolCrib = machine.keyInToolCrib
    keyProvider = machine.keyProvider
    if machine.keyNumber:
        keyNumber = machine.keyNumber
    else:
        keyNumber = ''
    msg="Success"
    return jsonify(msg=msg,status=200,machineDesc=machineDesc,\
        machineDuration=machineDuration,machineLocation=machineLocation,\
        keyInToolCrib=keyInToolCrib,keyProvider=keyProvider,keyNumber=keyNumber)
