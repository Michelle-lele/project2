document.addEventListener('DOMContentLoaded', () => {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

	var newChannelBtn = document.getElementById('newChannelBtn');
	var form = document.getElementById('channelForm');
	var info_message =document.querySelector("#infoMessage");
	var newChannelname = document.getElementById('channelName');
	var myTable = document.querySelector('#channelsTable');
	var divMessages = document.querySelector("#messages");
	var aMessageForm = document.getElementById('add-message');
	var newMessageBtn = document.getElementById('newMessageBtn');
	var systemMessage = document.getElementById('systemMessage');
	var clearBtn = document.getElementById('clear-name');

	//Load unread messages counter
	if (JSON.parse(localStorage.getItem("newMessages")) == "" || !localStorage.getItem("newMessages") || localStorage.getItem("newMessages") == null){
		var newMessages = [];
		localStorage.setItem("newMessages", JSON.stringify(newMessages));
	}
	else{
		var newMessages = JSON.parse(localStorage.getItem("newMessages"));
		for (var i = 0; i < newMessages.length; i++){
			if (newMessages[i] != null){
				var aCounter = document.querySelector("td[data-channel= "+ CSS.escape(newMessages[i].channel) +"] > div");
				aCounter.innerHTML = newMessages[i].newMessages;
				aCounter.style.display = "block";
			}
		}
	}

	clearBtn.addEventListener("click", () =>{
		localStorage.setItem('currentChannel', "");
	});


	//Show current channel
	if (!localStorage.getItem('currentChannel')){
		systemMessage.style.color ='#4E95D7';
		systemMessage.innerHTML = "Hello there! Start flacking!";
	}
	else{
		getChannel(localStorage.getItem('currentChannel'));
	}

	//Add or update current user
	var currentUser = document.getElementById('currentUser').innerHTML;
	if (!localStorage.getItem('currentUser') || (localStorage.getItem('currentUser') != currentUser)){
		localStorage.setItem('currentUser', currentUser);
	}


	//Add new channel and emit event to all other users
  	newChannelBtn.addEventListener('click', () => {
	form.style.display = 'block';
	newChannelname.focus();
  	});

  	socket.on('connect', () =>{
	    form.addEventListener('submit', () => {
	    	info_message.innerHTML = '';
	    	var newChannel = document.querySelector('#channelName').value;

		    const request = new XMLHttpRequest();

		    request.open('POST', '/add-channel');

		    request.onload = () =>{
		    	const data = JSON.parse(request.responseText);
			    if (request.status == 200 && data.status == 200) {
		    		addChannelToTable(newChannel);

					form.style.display = 'none';

					getChannel(newChannel);

					socket.emit('submit channel', {'aNewChannel': newChannel});
			    	}
			    else {
			    	info_message.innerHTML = `${data.error}`;
			    	info_message.style.color = 'red';
			    	newChannelname.focus();
			    }
		    }

		    const data = new FormData();
			data.append('name', newChannel);

		    request.send(data);
		   	document.querySelector('#channelName').value = '';
	    });
	});

	socket.on('announce new channel', data =>{
		addChannelToTable(data.aNewChannel);
	});

	function addChannelToTable(aNewChannel){
		var a = document.createElement('a');
		a.setAttribute("class", "channel-item");
		a.setAttribute("title", "Click to show messages");
		a.setAttribute("href","#");
		a.setAttribute("data-channel",aNewChannel);
		a.innerHTML = aNewChannel;

		var divCounter = document.createElement('div');
		divCounter.setAttribute("class", "newMessagesCounter");

		var tr = myTable.insertRow(0);
		var td = tr.insertCell(0);
		td.setAttribute("data-channel", aNewChannel);
		td.appendChild(a);
		td.appendChild(divCounter);

		a.addEventListener('click', () =>{
			getChannel(aNewChannel);clearUnreadCounter(aNewChannel);
		});
	};

	//load channel content
	document.querySelectorAll(".channel-item").forEach(link =>{
		link.onclick = () =>{
			channelName = link.dataset.channel;
			getChannel(channelName);
			clearUnreadCounter(channelName);
		};
	});

	//get all data for specific channel
	function getChannel(channelName){
		divMessages.innerHTML = "";
		systemMessage.innerHTML = "";
		
		const request = new XMLHttpRequest();

		request.open('POST', '/get-channel');

		request.onload = () =>{
		    const data = JSON.parse(request.responseText);
			    if (request.status == 200 && data.status == 200) {
			    	//show channel data
			    	document.querySelector("#current-channel").innerHTML = `${data.channel.name}`;
			    	document.querySelector("#channel-details").innerHTML = `created ${data.channel.created}`;
			    	
			    	//Iterate all messages and show them
			    	var messages = data.channel.messages;

			    	for (var i = 0; i < messages.length; i++){
			    		messText = messages[i].message.text;
			    		messTimestamp = messages[i].message.timestamp;
			    		messUser = messages[i].message.user;

			    		addMessage(messText, messUser, messTimestamp);
			    	}

			    	setMessageForm(data.channel.name);
			    	localStorage.setItem('currentChannel', channelName);
			    	divMessages.scrollTop = divMessages.scrollHeight;
			    }
			    else {
			    	systemMessage.innerHTML = "Something went wrong! Channel cannot be loaded :(";
			    }
		    }

		const data = new FormData();
		data.append('channelName', channelName);

		request.send(data);
	};

	
	//Build new message form and add event for add & emit new message 
	function setMessageForm(currChannelName){
		aMessageForm.style.display = 'block';
		aMessageForm.setAttribute("data-channel", currChannelName);
		inputNewMessage.focus();

	};

	//TODO fix that validation
	var inputNewMessage = document.querySelector("#new-message");
	newMessageBtn.disabled = true;

	inputNewMessage.onkeyup = () =>{
		if (inputNewMessage.value.length > 0){
				newMessageBtn.disabled = false;
		}
		else{
				newMessageBtn.disabled = true;
		}
	};

	socket.on('connect', () =>{
		aMessageForm.addEventListener('submit', () => {
		var newMessage = document.querySelector('#new-message').value;


		const request = new XMLHttpRequest();

		request.open('POST', '/add-message');

		request.onload = () =>{
			const data = JSON.parse(request.responseText);

			if (request.status == 200 && data.status == 200) {
				socket.emit('submit message', {'data': data});
				    }
			else {
				    //TODO else here
				}
		}

		const data = new FormData();
		data.append('text', newMessage);
		data.append('channel', aMessageForm.dataset.channel);

		request.send(data);
		document.querySelector('#new-message').value = '';
		});
	});

	socket.on('announce new message', data =>{
		if (localStorage.getItem('currentChannel') == data.channel){
			addMessage(data.message.message.text, data.message.message.user,data.message.message.timestamp);
		}
		else{
			countNewMessage(data.message.message.user, data.channel);
		}
	});

	//Add message
	function addMessage(text, user, timestamp){
		//limit messages to 100
		if (document.querySelectorAll("#messages .message-item").length >= 100){
			divMessages.removeChild(document.querySelector('.message-item'));
		}


		//TODO need to get rid of that :/
		var div = document.createElement('div');
		if (byCurrentUser(user) == true){
			div.setAttribute("class", "message-item right");
		}
		else{
			div.setAttribute("class", "message-item left");
		}
		divMessages.appendChild(div);

		var divMessageDetails = document.createElement('div');
		divMessageDetails.setAttribute("class", "message-details");
		div.appendChild(divMessageDetails);

		var divDisplayName = document.createElement('div');
		divDisplayName.setAttribute("class", "display-name");
		divDisplayName.innerHTML = `${user.toUpperCase()}:`;
		divMessageDetails.appendChild(divDisplayName);

		var divTimestamp = document.createElement('span');
		divTimestamp.setAttribute("class", "message-timestamp");
		divTimestamp.innerHTML = `${timestamp}`;
		divMessageDetails.appendChild(divTimestamp);

		var divMessage = document.createElement('div');
		divMessage.setAttribute("class", "message-text");
		divMessage.innerHTML = `${text}`;
		div.appendChild(divMessage);

		divMessages.scrollTop = divMessages.scrollHeight;

		/*var leftQuote = document.createElement('i');
		leftQuote.setAttribute("class", "fas fa-quote-left");
		divMessage.insertBefore(leftQuote, divMessage.firstChild);

		var rightQuote = document.createElement('i');
		rightQuote.setAttribute("class", "fas fa-quote-right");
		divMessage.appendChild(rightQuote);	
		*/
	};

	function countNewMessage(user, channel){
		var counter = document.querySelector("td[data-channel= "+ CSS.escape(channel) +"] > div");
		if (byCurrentUser(user) == false){
			if (newMessages.length != 0){
				for (var i = 0; i < newMessages.length; i++){
						if (newMessages[i] != undefined && channel == newMessages[i].channel){
							newMessages[i].newMessages += 1;
							localStorage.setItem("newMessages", JSON.stringify(newMessages));
							counter.innerHTML =newMessages[i].newMessages;
							return true;
						}
					}
			}
			var newCounter = {"channel": `${channel}`, "newMessages": 1};
			newMessages.push(newCounter);
			localStorage.setItem("newMessages", JSON.stringify(newMessages));
			
			counter.innerHTML = newCounter.newMessages;
			counter.style.display = "block";
			return true;
		};
	};

	function clearUnreadCounter(channel){
		for (var i = 0; i < newMessages.length; i++){
			if (newMessages[i] != undefined && channel == newMessages[i].channel){
				delete newMessages[i];
				localStorage.setItem("newMessages", JSON.stringify(newMessages));
				document.querySelector("td[data-channel= "+ CSS.escape(channel) +"] > div").style.display = "none";
			}
		}
	};

	function byCurrentUser(user){
		if (user == localStorage.getItem('currentUser')){
			return true;
		}
		else{
			return false;
		}
	};
});