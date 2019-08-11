import datetime

class User:
	_registry = []

	def __init__(self, user):
		self.user = user
		self._registry.append(self.user)

		def current_channel(self, channel_name):
			self.current_channel = Channel.name
	def serialize(self):
		return {
			'user': self.user
		}

class Channel:
	def __init__(self, name):
		self.name = name
		self.users = []
		self.messages = []
		self.created = datetime.datetime.now();

	def created_by(self, user):
		self.created_by = user

	def add_user(self, user):
		self.users.append(user)

	def add_message(self, text, user):
		#to satisfy the 100 messages requirement, so check how many currently, if 100 delete first and add last
		message = Message(text, user)
		self.messages.append(message.serialize())

	def serialize(self):
		return{
			'name': self.name,
			'created': self.created,
			'created_by': self.created_by,
			'users': self.users,
			'messages': self.messages
			}
	

class Message:
	def __init__(self, text, user):
		self.text = text
		self.timestamp = datetime.datetime.now()
		self.user = user

	def serialize(self):
		return {'message': 
					{
						'text': self.text,
						'timestamp': self.timestamp,
						'user': self.user.serialize()
					}
		}
