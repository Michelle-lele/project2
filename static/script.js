document.addEventListener('DOMContentLoaded', () => {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
	
	//Load channels list


	//Add new channel and emit event to all other users
	var newChannelBtn = document.getElementById('newChannelBtn');
	var form = document.getElementById('channelForm');
	var info_message =document.querySelector("#infoMessage");
	var newChannelname = document.getElementById('channelName');
	var myTable = document.querySelector('#channelsTable');

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
		var tr = myTable.insertRow(0);
		var td = tr.insertCell(0);
		td.appendChild(a);
		getChannel(aNewChannel);

		a.addEventListener('click', () =>{
			getChannel(aNewChannel);
		});
	};

	//load channel content
	document.querySelectorAll(".channel-item").forEach(link =>{
		link.onclick = () =>{
			channelName = link.dataset.channel; //or use innerHTML
			getChannel(channelName);
		};
	});

	//get all data for specific channel
	function getChannel(channelName){
		messages_div.innerHTML = "";
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
			    		messUser = messages[i].message.user.user;

			    		addMessage(messText, messUser, messTimestamp);
			    	}
			    }
			    else {
			    	//show some error message
			    	//TO DO build message div & append message content
			    	console.log("Something went wrong! Channel cannot be loaded :(");
			    }

			    addMessageForm();
		    }

		const data = new FormData();
		data.append('channelName', channelName);

		request.send(data);
	};

	//Build new message form
	function addMessageForm(){
		var divNewMessage = document.createElement('div');
		var formAddMessage = document.createElement('form');
		formAddMessage.setAttribute("id", "add-message");
		formAddMessage.setAttribute("onsubmit", "return: false;");
		divNewMessage.appendChild(formAddMessage);
		console.log("Should have form by now!");

		var inputNewMessage = document.createElement('input');
		inputNewMessage.setAttribute("id", "new-message");
		inputNewMessage.setAttribute("type", "text");
		formAddMessage.appendChild(inputNewMessage);
		console.log("Should have text input by now!");

		var buttonNewMessage = document.createElement('button');
		buttonNewMessage.setAttribute("id", "newMessageBtn");
		buttonNewMessage.setAttribute("class", "icon");
		buttonNewMessage.setAttribute("type", "submit");
		formAddMessage.appendChild(buttonNewMessage);

		var btnSendMessage = document.createElement('i');
		btnSendMessage.setAttribute("class", "fas fa-paper-plane");
		buttonNewMessage.appendChild(btnSendMessage);
		console.log("Should have button by now!");

		//Add new message and emit event to all users
		var aMessageForm = document.getElementById("add-message");

		socket.on('connect', () =>{
		    aMessageForm.addEventListener('submit', () => {
		    	var newMessage = document.querySelector('#new-message').value;

			    const request = new XMLHttpRequest();

			    request.open('POST', '/add-message');

			    request.onload = () =>{
			    	const data = JSON.parse(request.responseText);
				    if (request.status == 200 && data.status == 200) {
				    	//TO DO something here
						socket.emit('submit message', {'aNewMessage': newMessage});
				    	}
				    else {
				    	//TO FO else here
				    }
			    }

			    const data = new FormData();
				data.append('text', newMessage);

			    request.send(data);
			   	document.querySelector('#new-message').value = '';
		    });
		});

		socket.on('announce new message', data =>{
			console.log("New message announced");
			//TO DO something here
		});

	};


	//Build message div
	var messages_div = document.querySelector("#messages");

	function addMessage(text, user, timestamp){
		//need to get rid of that :/
		var divMessageDetails = document.createElement('div');
		divMessageDetails.setAttribute("class", "message-details");
		messages_div.appendChild(divMessageDetails);

		user = user.toUpperCase();
		var divDisplayName = document.createElement('div');
		divDisplayName.setAttribute("class", "display-name");
		divDisplayName.innerHTML = `${user}:`;
		divMessageDetails.appendChild(divDisplayName);

		var divTimestamp = document.createElement('span');
		divTimestamp.setAttribute("class", "message-timestamp");
		divTimestamp.innerHTML = `${timestamp}`;
		divMessageDetails.appendChild(divTimestamp);

		var div = document.createElement('div');
		div.setAttribute("class", "message-item");
		messages_div.appendChild(div);


		var divMessage = document.createElement('div');
		divMessage.setAttribute("class", "message-text");
		divMessage.innerHTML = `${text}`;
		div.appendChild(divMessage);

		var leftQuote = document.createElement('i');
		leftQuote.setAttribute("class", "fas fa-quote-left");
		divMessage.insertBefore(leftQuote, divMessage.firstChild);

		var rightQuote = document.createElement('i');
		rightQuote.setAttribute("class", "fas fa-quote-right");
		divMessage.appendChild(rightQuote);
	};
});



