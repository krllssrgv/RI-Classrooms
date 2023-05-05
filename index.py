# This Python file uses the following encoding: utf-8
import os
import copy

from flask import Flask, render_template, redirect, request, url_for, jsonify, json
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, UserMixin, login_required, current_user, logout_user

import datetime
from werkzeug.security import generate_password_hash, check_password_hash



# App
app = Flask(__name__)
app.config['SECRET_KEY'] = '8f42a73054b1749f8f58848be5e6502c'


# DataBase
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
db = SQLAlchemy(app)

class users(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), nullable=False)
    password = db.Column(db.String(30), nullable=False)
    name = db.Column(db.String(40), nullable=False)
    surname = db.Column(db.String(40), nullable=False)
    lastname = db.Column(db.String(40), nullable=False)
    status = db.Column(db.Boolean, nullable=False, default=False)
    role = db.Column(db.Integer, nullable=False, default=1)

    def __repr__(self):
        return '<users %r>' % self.id
    

class classrooms(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return '<classrooms %r>' % self.id


class meetings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.String, nullable=False)
    classroom = db.Column(db.Integer, db.ForeignKey('classrooms.id'))
    status = db.Column(db.String, nullable=False, default='Запланирована')
    descr = db.Column(db.Text, nullable=False)
    members = db.Column(db.LargeBinary)

    def __repr__(self):
        return '<meetings %r>' % self.id


class actions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.String, nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'))

    def __repr__(self):
        return '<actions %r>' % self.id
    

# Login
login_manager = LoginManager(app)
login_manager.login_view = 'log'
    
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(users, user_id)
    

# Login
@app.route('/log', methods=['POST', 'GET'])
def log():
    if current_user.is_authenticated:
        return redirect(url_for('main'))
    
    if (request.method == 'POST'):
        data = request.json
        user = users.query.filter_by(email=data['email']).first()

        if (user and check_password_hash(user.password, data['password'])):
            login_user(user)
            result = {
                'status': '200',
                'link': url_for('main')
            }
        elif not (user):
            result = {
                'status': '404'
            }
        elif not (check_password_hash(user.password, data['password'])):
            result = {
                'status': '412'
            }

        return jsonify(result)
    else:
        return render_template('log.html')


# Logout
@app.route('/logout', methods=['POST', 'GET'])
def logout():
    logout_user()
    return redirect(url_for('log'))


# Registration
@app.route('/reg', methods=['POST', 'GET'])
def reg():
    if current_user.is_authenticated:
        return redirect(url_for('main'))
    
    if request.method == 'POST':
        data = request.json
        email = data['email']
        name = data['name']
        surname = data['surname']
        lastname = data['lastname']
        password = generate_password_hash(data['password'])

        new_user = users(email=email, name=name, surname=surname, lastname=lastname, password=password)

        if not (users.query.filter(users.email == email).all()):
            try:
                db.session.add(new_user)
                db.session.commit()
                result = {
                    'status': '200',
                    'link': url_for('log')
                }
            except:
                result = {
                    'status': '500',
                }
        else:
            result = {
                'status': '409',
            }

        return jsonify(result)
    
    else:
        return render_template('reg.html')


# Home
@app.route('/', methods=['GET', 'POST'])
@login_required
def main():
    user_role = int(db.session.get(users, int(current_user.get_id())).role)
    if request.method == 'POST':
        filter_date = datetime.datetime.fromtimestamp((int(request.json['date'])/1000.0)).date()
        filter_date_2 = datetime.datetime.fromtimestamp((int(request.json['date'])/1000.0) + 24 * 60 * 60).date()
        data_meetings = meetings.query.filter(meetings.date >= filter_date).filter(meetings.date < filter_date_2).order_by(meetings.date).all()
        
        list_of_objects_of_meetings = []
        for element in data_meetings:
            current_meeting = {
                'title': element.title,
                'owner': element.owner,
                'date': str(element.date.year) + '.' + str(element.date.month) + '.' + str(element.date.day),
                'time': element.time,
                'classroom': element.classroom,
                'status': element.status,
                'descr': element.descr
            }
            list_of_objects_of_meetings.append(copy.deepcopy(current_meeting))
            del current_meeting

        meetings_to_sent = {}
        for i in range(0, len(list_of_objects_of_meetings)):
            meetings_to_sent[i] = list_of_objects_of_meetings[i]
        
        return jsonify(list_of_objects_of_meetings)
    
    else:
        return render_template('main.html', user_role=user_role)


# Control meetings
@app.route('/meetings', methods=['POST', 'GET'])
@login_required
def meeting():
    user_role = int(db.session.get(users, int(current_user.get_id())).role)
    if user_role > 1:
        today = datetime.datetime.today().date()

        if (today.month < 10) and (today.day < 10):
            data_today = f'{today.year}-0{today.month}-0{today.day}'
        elif (today.month < 10) and (today.day > 10):
            data_today = f'{today.year}-0{today.month}-{today.day}'
        elif (today.month > 10) and (today.day < 10):
            data_today = f'{today.year}-{today.month}-0{today.day}'
        else:
            data_today = f'{today.year}-{today.month}-{today.day}'

        data_classrooms = classrooms.query.all()
        data_meetings = meetings.query.filter(meetings.owner == int(current_user.get_id())).order_by(meetings.date).all()

        if request.method == 'POST':
            data = request.json

            if data['type'] == 'createMeeting':
                owner = int(current_user.get_id())
                title = data['title']
                time = data['time']
                date = datetime.datetime.fromtimestamp(int(data['date'])/1000.0)
                classroom = data['classroom']
                descr = data['descr']
                members = data['members']
                
                new_meeting = meetings(owner=owner, title=title, date=date, time=time, classroom=classroom, descr=descr)

                try:
                    db.session.add(new_meeting)
                    db.session.commit()
                    return jsonify({'status': '200'})
                except:
                    return jsonify({'status': '500'})
                
            elif data['type'] == 'getClassroomTimetable':
                pass
        else:
            return render_template('meetings.html', data_meetings=data_meetings, data_classrooms=data_classrooms, data_today=data_today)
    else:
        return redirect(url_for('main'))


@app.route('/meeting<int:id>', methods=['POST', 'GET'])
@login_required
def meet(id):
    user_role = int(db.session.get(users, int(current_user.get_id())).role)
    if user_role > 1:
        today = datetime.datetime.today().date()
        
        if (today.month < 10) and (today.day < 10):
            data_today = f'{today.year}-0{today.month}-0{today.day}'
        elif (today.month < 10) and (today.day > 10):
            data_today = f'{today.year}-0{today.month}-{today.day}'
        elif (today.month > 10) and (today.day < 10):
            data_today = f'{today.year}-{today.month}-0{today.day}'
        else:
            data_today = f'{today.year}-{today.month}-{today.day}'

        data_classrooms = classrooms.query.all()

        meeting = db.session.get(meetings, id)
        meeting_copy = copy.deepcopy(meeting)
        meeting_copy.date = int(meeting.date.timestamp() * 1000)

        if request.method == 'POST':
            data = request.json
            if data['act'] == 'change':
                meeting.title = data['title']
                meeting.date = datetime.datetime.fromtimestamp(int(data['date'])/1000.0)
                meeting.classroom = data['classroom']
                meeting.status = data['status']
                meeting.descr = data['descr']
                
                try:
                    db.session.commit()
                    return jsonify({'status': '200'})
                except:
                    return jsonify({'status': '500'})
                
            elif data['act'] == 'delete':
                try:
                    db.session.delete(meeting)
                    db.session.commit()
                    return jsonify({'status': '200', 'url': url_for('meeting')})
                except:
                    return jsonify({'status': '500'})
            
        else:
            return render_template('meet.html', meeting=meeting_copy, data_today=data_today, data_classrooms=data_classrooms)
    else:
        return redirect(url_for('main'))
    

# Profile
@app.route('/profile')
@login_required
def profile():
    user = db.session.get(users, int(current_user.get_id()))
    return render_template('profile.html', user=user)


# Admin
@app.route('/admin')
@login_required
def admin():
    return render_template('admin/admin.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0')
