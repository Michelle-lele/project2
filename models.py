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
	_registry = []

	def __init__(self, name):
		self.name = name
		self.users = []
		self.messages = []
		self.created = datetime.datetime.now();
		self._registry.append(self)

	def created_by(self, user):
		self.created_by = user.user

	def add_user(self, user):
		self.users.append(user.user) #TODO check if user exists, add method to User class?

	def add_message(self, text, user):
		if len(self.messages) >= 100:
			self.messages.pop(0)
		message = Message(text, user)
		self.messages.append(message.serialize())
		return message

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
		self.user = user.user #TODO check if user exists, add method to User class?

	def serialize(self):
		return {'message': 
					{
						'text': self.text,
						'timestamp': self.timestamp,
						'user': self.user
					}
		}
