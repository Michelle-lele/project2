import datetime

class User:
	_registry = []

	def __init__(self, user):
		self.user = user
		self._registry.append(self.user)

		def current_channel(self, channel_name):
			self.current_channel = Channel.name


class Channel:
	def __init__(self, name):
		self.name = name #should satisfy the rule for unique channel name, if not unique what? 
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
		self.messages.append(message)

	def serialize(self):
		return{
			'name': self.name,
			'created': self.created,
			'created_by': self.created_by
		}
	

class Message:
	def __init__(self, text, user):
		self.text = text
		self.timestamp = datetime.datetime.now()
		self.user = user

def main():
	User1 = User("Michelle")
	User2 = User("Anonymous")
	NewChannel = Channel("Michelle's Channel")
	NewChannel.add_user(User1)

	print(f"{NewChannel.name} users:")
	for user in NewChannel.users:
		print(f"{user}")

	NewChannel.add_message("Hi, this is my first message", User2)
	NewChannel.add_message("Hey you, second message", User1)
	print(f"{NewChannel.name} messages:")
	for message in NewChannel.messages:
		print(f"{message.user} says: {message.text}")
		print(f"{message.timestamp}")

	User1.current_channel(NewChannel.name)
	print(f"{User1.current_channel}")

if __name__=="__main__":
	main()