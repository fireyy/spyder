#coding: utf-8
from web.model import Model

class User(Model):
    uid = 0;
    def __init__(self, app):
	self.app = app
	self.db_config = self.app.config.get('DBS')
	self.db_setting = 'default'
	self._table_name = 'user'

	Model.__init__(self)

    def validate_username(self, username):
	'''
	'''
	return True
    
    def validate_email(self, email):
	'''
	'''
	return True

    def add(self, **profile):
	'''
	'''