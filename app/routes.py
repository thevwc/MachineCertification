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

# temp code
# @app.route('/index')
# def index():
#     print ('/index found')
#     return

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
    sqlMachines += "certificationDuration, keyInToolCrib, keyProvider "
    sqlMachines += "FROM MachinesRequiringCertification "
    sqlMachines += "ORDER BY machineLocation, machineDesc "
    #print('sqlMachines - ',sqlMachines)

    machineList = db.engine.execute(sqlMachines)
    if machineList == None:
        flash('No names to list.','danger')
    
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
    
    if member.machineCertificationStaff != True:
        msg = "You are not currently authorized to use this application."
        return jsonify(msg=msg)

    msg = "Authorized"
    return jsonify(msg=msg,status=200)
    
@app.route('/displayMachineInstructorsMembersUsage',methods=['GET','POST'])
def displayMachineData():
    #print('... displayMachineData')

    req = request.get_json()
    machineID = req["machineID"]
    #print('machineID - ',machineID)

    machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
    if machine == None:
        msg = "Machine ID " + machineID + " was not found."
        return jsonify(msg=msg,status=400)
    machineDesc = machine.machineDesc + ' (' + machineID + ') at ' + machine.machineLocation
    machineLocation = machine.machineLocation
    machineDuration = machine.certificationDuration
    keyInToolCrib = machine.keyInToolCrib
    keyProvider = machine.keyProvider
    
    # GET INSTRUCTORS FOR THIS MACHINE
        # GET INSTRUCTOR FOR THIS MACHINE
    instructorsList = []
    sp = "EXEC instructorsForSpecificMachine '" + machineID + "'"
    sql = SQLQuery(sp)
    instructors = db.engine.execute(sql)
    if instructors == None:
        instructorsList.append("No instructors assigned.")
    else:
        for i in instructors:
            instructorName = i.First_Name 
            if i.Nickname is not None:
                if len(i.Nickname) > 0 :
                    instructorName += ' (' + i.Nickname + ')'
            instructorName += ' ' + i.Last_Name
            instructorsList.append(instructorName)

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
    return jsonify(msg=msg,status=status,machineLocation=machineLocation,machineID=machineID,
    machineDesc=machineDesc,machineDuration=machineDuration,instructorsList=instructorsList,\
        certifiedDict=certifiedDict,UsageDict=usageDict,keyInToolCrib=keyInToolCrib,keyProvider=keyProvider)


@app.route('/displayMemberData',methods=['POST'])
def displayMemberData():
    #print('... displayMemberData')
    
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
    #print('... /certifyMember')
    
    req = request.get_json()
    transactionType = req["certifyTransactionType"]
    memberID = req["memberID"]
    machineID = req["machineID"]
    certifiedBy = req["certifiedBy"]
    duration = req["duration"]
    dateCertified = req["dateCertified"]
    #staffID = req["staffID"]
    todaysDate = date.today().strftime('%Y-%m-%d')

    print('memberID -',memberID)
    print('machineID - ',machineID)
    print('certifiedBy - ',certifiedBy)
    #print('todaysDate - ',todaysDate)

    # GET THE MEMBERS CURRENT CERTIFICATION RECORD
    print('transactionType - ',transactionType)
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
        #print('sqlInsert - ',sqlInsert)
        try:
            certification = db.engine.execute(sqlInsert)
            msg="New certification record added."
            return jsonify(msg=msg,status=200)
        except (SQLAlchemyError, DBAPIError) as e:
            print("ERROR -",e)
            flash("ERROR - DB error")
            msg='Record could not be inserted'
            return jsonify(msg=msg,status=201)

    # sp = "EXEC newMemberMachineCertification '" + memberID + "', '" + todaysDate + "', '" + machineID + "', '" + staffID + "'"
    # print('sp - ',sp)
    # try:
    #     sql = SQLQuery(sp)
    #     certification = db.engine.execute(sql)
    # except:
    #     print('error on EXEC')
    # if certification == None: 
    #     print('certification - ',certification)
    #     msg='Record could not be inserted'
    #     return jsonify(msg=msg,status=201)
    
    # msg='Success'
    # return jsonify(msg=msg,status=200)

@app.route('/deCertifyMember',methods=['GET','POST'])
def deCertifyMember():
    #print('... /deCertifyMember')
    
    req = request.get_json()
    memberID = req["memberID"]
    machineID = req["machineID"]
    
    # print('memberID - ',memberID)
    # print('machineID - ',machineID)
    # print('staffID - ',staffID)
    
    sqlDelete = "DELETE FROM memberMachineCertifications "
    sqlDelete += " WHERE member_ID = '" + memberID + "' and machineID = '" + machineID + "'"
    #print('sqlDelete - ',sqlDelete)
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
    #print('/prtMemberCertifications')
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
        print('machinesCertifiedItem - ',machinesCertifiedItem)

        machinesCertifiedDict.append(machineItem)
        return render_template("memberCerts.html",todaysDate=todaysDate,\
            memberName=memberName,villageID=villageID,\
            machineDict=machineDict)
    # List the machines for which the member is certified
    #     select memberMachineCertifications.*, machinesRequiringCertification.* from memberMachineCertifications
    # left join machinesRequiringCertification on memberMachineCertifications.machineID = machinesRequiringCertification.machineID
    # order by machineLocation, machineDesc
    
    for mc in machinesCertified:
        print('mc.machineID - ',mc.machineID)

        machineID = mc.machineID
        # Look up specific machine to get description and location
        machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
        if (machine == None):
            msg="Missing machine record."
            return jsonify(msg=msg,status=201)
        
        dateCertified=mc.dateCertified.strftime('%m-%d-%Y')
        # print('machineID - ',machineID)
        # print('dateCertified - ',dateCertified)
        machinesCertifiedItem = {
            'machineID': machineID,
            'machineDesc': machine.machineDesc  + ' ('+ machineID + ')',
            'machineLocation': machine.machineLocation,
            'dateCertified':dateCertified
        }
        # print('item - ',machinesCertifiedItem)
        machinesCertifiedDict.append(machinesCertifiedItem)
        
    return render_template("memberCerts.html",todaysDate=todaysDate,\
            memberName=memberName,villageID=villageID,\
            machinesCertifiedDict=machinesCertifiedDict)

@app.route('/editMachine',methods=['GET','POST'])
def editMachine():
    #print('... /editMachine')
    
    req = request.get_json()
    machineID = req["machineID"]
    machineDesc = req["machineDesc"]
    machineLocation = req["machineLocation"]
    certificationDuration = req["certificationDuration"]
    keyInToolCrib = req["keyInToolCrib"]
    keyProvider = req["keyProvider"]

    # print('machineID - ',machineID)
    # print('machineDesc -',machineDesc)
    # print('machineLocation - ',machineLocation)
    # print('certificationDuration - ',certificationDuration)
    # print('keyInToolCrib - ',type(keyInToolCrib),keyInToolCrib)
    # print('keyProvider - ',type(keyProvider),keyProvider)
    
    machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
    if (machine == None):
        return jsonify(msg="Machine not found.",status=201)
    try:
        machine.machineDesc = machineDesc
        machine.machineLocation = machineLocation
        machine.certificationDuration = certificationDuration
        # if keyInToolCrib == 1:
        #     machine.keyInToolCrib = True
        # else:
        #     machine.keyInToolCrib = False
        machine.keyInToolCrib = keyInToolCrib

        # if keyProvider == 1:
        #     machine.keyProvider = True
        # else:
        #     machine.keyProvider = False
        machine.keyProvider = keyProvider
        
        # print('machine.certificationDuration - ',machine.certificationDuration)
        # print('machine.keyInToolCrib - ',machine.keyInToolCrib)
        # print('machine.keyProvider - ',machine.keyProvider)
        
        # sqlUpdate = "UPDATE machinesRequiringCertification SET "
        # sqlUpdate += "machineDesc = '" + machineDesc + "', "
        # sqlUpdate += "machineLocation = '" + machineLocation + "', "
        # sqlUpdate += "certificationDuration = '" + certificationDuration + "', "
        # sqlUpdate += "keyInToolCrib = " + str(keyInToolCrib) + ", "
        # sqlUpdate += "keyProvider = " + str(keyProvider) 
        # sqlUpdate += " WHERE machineID = '" + machineID + "'"

        # print(sqlUpdate)

    
        #db.query.execute(sqlUpdate)
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
    print('... /newMachine')
    
    req = request.get_json()
    machineDesc = req["machineDesc"]
    machineLocation = req["machineLocation"]
    certificationDuration = req["certificationDuration"]
    keyInToolCrib = req["keyInToolCrib"]
    keyProvider = req["keyProvider"]
    machineID = getNextMachineID()
    

    print('machineDesc -',machineDesc)
    print('machineLocation - ',machineLocation)
    print('certificationDuration - ',certificationDuration)
    print('keyInToolCrib - ',type(keyInToolCrib),keyInToolCrib)
    print('keyProvider - ',type(keyProvider),keyProvider)
    print('machineID - ',machineID)
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
    sqlInsert += "certificationDuration,keyInToolCrib,keyProvider) "
    sqlInsert += " VALUES ('" + machineID + "', '" +  machineDesc +"', '" + machineLocation + "', '" 
    sqlInsert += certificationDuration + "'," + str(keyInToolCribNumber) + "," + str(keyProviderNumber) + ")"
    print('sqlInsert - ',sqlInsert)
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

    # sp = "EXEC newMachine '" + machineID + "', '" + machineDesc + "', '" 
    # sp += "" + machineLocation + "', '" + certificationDuration + "', " 
    # sp += "" + str(keyInToolCrib) + "," + str(keyProvider) 
    # print('sp - ',sp)

    # sql = SQLQuery(sp)
    # try:
    #     result = db.engine.execute(sql)
    #     if result == 0:
    #         msg = "Add failed"
    #         status = 400
    #     else:
    #         msg = "Add succeeded"
    #         status = 200
    #     return jsonify(msg=msg,status=status)
    # except (SQLAlchemyError, DBAPIError) as e:
    #     print("ERROR -",e)
    #     flash("ERROR - DB error")
    #     msg='Record could not be added'
    #     return jsonify(msg=msg,status=201)
    


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
        print('result - ',result)
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

    # LOOK UP MACHINE INSTRUCTORS RECORD    
    machineInstructor = db.session.query(MachineInstructors).filter(MachineInstructors.member_ID == memberID)\
        .filter(MachineInstructors.machineID == machineID).first()
    if machineInstructor != None:
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
        sqlInsert = "INSERT INTO machineInstructors (machineID, member_ID, canCertify, canAssist, keyProvider) "
        sqlInsert += "VALUES ('" + machineID + "', '" + memberID + "'," + str(canCertify) + "," + str(canAssist) + "," + str(keyProvider) + ")"
        
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
    print('machineID - |'+machineID+"|")
    # GET DATA COMMON TO BOTH 'NEW' AND 'EDIT'
    # sqlSelect = "SELECT top 1 * FROM machinesRequiringCertification WHERE machineID = '" + machineID + "'"
    #machine = db.engine.execute(sqlSelect)
    # print('sqlSelect - ',sqlSelect)
    try:
        machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
    except (SQLAlchemyError, DBAPIError) as e:
        msg='Database error - ' + e
        print(msg)
        return jsonify(msg=msg,status=201) 
    
    machineDesc = machine.machineDesc + "(" + machine.machineLocation + ")"
    machineDuration = machine.certificationDuration
    suggestedDuration = 'Std - ' + machineDuration
    
    # TRANSACTION DEPENDENT DATA FOR AUTHORIZATION MODAL FORM
    if transactionType == "NEW":
        # DATA FOR NEW CERTIFICATIONS
        dateCertified = date.today()
        dateCertifiedSTR = dateCertified.strftime('%Y-%m-%d')
        certificationDuration = machineDuration
    else:
        # DATA FOR EDIT OF EXISTING CERTIFICATION
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
        suggestedDuration=suggestedDuration,\
        instructorsDict=instructorsDict,transactionType=transactionType)    