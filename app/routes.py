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
    sqlMachines = "SELECT machineID, machineDesc, machineLocation + ' - ' + machineDesc + ' (' + machineID + ')' as machineDisplayName, machineLocation "
    sqlMachines += "FROM MachinesRequiringCertification "
    #sqlMachines += "WHERE machineLocation = '" + shopLocation + "' "
    sqlMachines += "ORDER BY machineLocation, machineDesc "

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
    sqlNames += "WHERE machineCertificationStaff = 1 "
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
    machineDesc=machineDesc,instructorsList=instructorsList,certifiedDict=certifiedDict,UsageDict=usageDict)


@app.route('/displayMemberData',methods=['POST'])
def displayMemberData():
    #print('... displayMemberData')

    req = request.get_json() 
    villageID = req["villageID"]
    location = req["location"]
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
    machines = db.session.query(Machines)
    #.order(Machines.machineLocation,Machines.machineDesc)
    for m in machines:
        memberCertified = db.session.query(MemberMachineCertifications)\
            .filter(MemberMachineCertifications.machineID == m.machineID)\
            .filter(MemberMachineCertifications.member_ID == villageID).scalar() is not None
        
        machineItem = {
            'machineID': m.machineID,
            'machineDesc': m.machineDesc,   #+ ' ('+m.machineID + ')',
            'machineLocation': m.machineLocation,
            'memberCertified':memberCertified
        }
        
        machineDict.append(machineItem)
    return jsonify(msg=msg,memberName=memberName,mobilePhone=mobilePhone,homePhone=homePhone,eMail=eMail,machineDict=machineDict)

@app.route('/displayMachineInstructors',methods=['GET','POST'])
def displayMachineInstructors():
    #print('... displayMachineInstructors')
    
    req = request.get_json()
    instructorID = req["instructorID"]
    #print('instructorID - ',instructorID)

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
    machines = db.session.query(Machines)
    #.order(Machines.machineLocation,Machines.machineDesc)
    for m in machines:
        instructorCertified = db.session.query(MachineInstructors)\
            .filter(MachineInstructors.machineID == m.machineID)\
            .filter(MachineInstructors.member_ID == instructorID).scalar() is not None
        
        machineItem = {
            'machineID': m.machineID,
            'machineDesc': m.machineDesc,  # + ' ('+m.machineID + ')',
            'machineLocation': m.machineLocation,
            'instructorCertified':instructorCertified
        }
        
        machineDict.append(machineItem)
        msg="Success"
    return jsonify(msg=msg,status=200,instructorName=instructorName,mobilePhone=mobilePhone,\
        homePhone=homePhone,eMail=eMail,machineDict=machineDict)


@app.route('/certifyMember',methods=['GET','POST'])
def certifyMember():
    print('... /certifyMember')
    
    req = request.get_json()
    memberID = req["villageID"]
    machineID = req["machineID"]
    staffID = req["staffID"]
    todaysDate = date.today().strftime('%Y-%m-%d')

    print('memberID -',memberID)
    print('machineID - ',machineID)
    print('staffID - ',staffID)
    print('todaysDate - ',todaysDate)

    mbrCert = db.session.query(MemberMachineCertifications)\
        .filter(MemberMachineCertifications.machineID == machineID)\
        .filter(MemberMachineCertifications.member_ID == memberID).first()
    if (mbrCert != None):
        msg="Already certified."
        return jsonify(msg=msg,status=201)
    
    
    # add new record
    sqlInsert = "INSERT INTO memberMachineCertifications (member_ID,dateCertified,certifiedBy,machineID)"
    sqlInsert += " VALUES('" + memberID + "', '" + todaysDate + "', '" + staffID + "', '" + machineID + "')"
    print('sqlInsert - ',sqlInsert)
    try:
        certification = db.engine.execute(sqlInsert)
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
    
    msg='Success'
    return jsonify(msg=msg,status=200)

@app.route('/deCertifyMember',methods=['GET','POST'])
def deCertifyMember():
    #print('... /deCertifyMember')
    
    req = request.get_json()
    memberID = req["villageID"]
    machineID = req["machineID"]
    staffID = req["staffID"]
    
    # print('memberID - ',memberID)
    # print('machineID - ',machineID)
    # print('staffID - ',staffID)
    
    sqlDelete = "DELETE FROM memberMachineCertifications "
    sqlDelete += " WHERE member_ID = '" + memberID + "' and machineID = '" + machineID + "'"
    #print('sqlDelete - ',sqlDelete)
    try:
        certification = db.engine.execute(sqlDelete)
    except (SQLAlchemyError, DBAPIError) as e:
        print("ERROR -",e)
        flash("ERROR - DB error")
        msg='Record could not be deleted'
        return jsonify(msg=msg,status=201)
    # mbrCert = db.session.query(MemberMachineCertifications)\
    #     .filter(MemberMachineCertifications.machineID == machineID)\
    #     .filter(MemberMachineCertifications.memberID == memberID).first()
    # if (mbrCert != None):
    #     msg="Already certified."
    #     return jsonify(msg=msg,status=200)
    
    # add new record
    msg='Success'
    return jsonify(msg=msg,status=200)
    
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
        machinesCertifiedDict.append(machineItem)
        return render_template("memberCerts.html",todaysDate=todaysDate,\
            memberName=memberName,villageID=villageID,\
            machineDict=machineDict)
    # List the machines for which the member is certified
    #     select memberMachineCertifications.*, machinesRequiringCertification.* from memberMachineCertifications
    # left join machinesRequiringCertification on memberMachineCertifications.machineID = machinesRequiringCertification.machineID
    # order by machineLocation, machineDesc
    
    for mc in machinesCertified:
        machineID = mc.machineID
        # Look up specific machine to get description and location
        machine = db.session.query(Machines).filter(Machines.machineID == machineID).first()
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

@app.route('/newMachine',methods=['GET','POST'])
def newMachine():
    print('... /newMachine')
    
    req = request.get_json()
    machineDesc = req["machineDesc"]
    machineLocation = req["machineLocation"]
    certificationDuration = req["certificationDuration"]
    machineID = getNextMachineID()

    print('machineDesc -',machineDesc)
    print('machineLocation - ',machineLocation)
    print('certificationDuration - ',certificationDuration)
    print('machineID - ',machineID)

    sp = "EXEC newMachine '" + machineID + "', '" + machineDesc + "', '" + machineLocation + "', '" + certificationDuration + "'"
    sql = SQLQuery(sp)
    result = db.engine.execute(sql)
    if result == 0:
        msg = "Add failed"
        status = 400
    else:
        msg = "Add succeeded"
        status = 200

    return jsonify(msg=msg,status=status)
    
def getNextMachineID():
    maxID = db.session.query(func.max(Machines.machineID)).scalar()
    print('maxID - ',maxID)
    return maxID