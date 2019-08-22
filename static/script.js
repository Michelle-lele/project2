document.addEventListener('DOMContentLoaded', () => {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

	var newChannelBtn = document.getElementById('newChannelBtn');
	var form = document.getElementById('channelForm');
	var info_message =document.querySelector("#infoMessage");
	var newChannelname = document.getElementById('channelName');
	var myTable = document.querySelector('#channelsTable');
	var messages_div = document.querySelector("#messages");
	var aMessageForm = document.getElementById('add-message');
	var newMessageBtn = document.getElementById('newMessageBtn');
	var systemMessage = document.getElementById('systemMessage');
	var clearBtn = document.getElementById('clear-name');

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
		var tr = myTable.insertRow(0);
		var td = tr.insertCell(0);
		td.appendChild(a);

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
				//TO DO something here
				socket.emit('submit message', {'data': data.message});
				    }
			else {
				    //TO FO else here
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
		addMessage(data.message.text, data.message.user,data.message.timestamp);
	});


	//Add message
	function addMessage(text, user, timestamp){

		if (document.querySelectorAll("#messages .message-item").length >= 100){
			messages_div.removeChild(document.querySelector('.message-item'));
		}

		//need to get rid of that :/
		var div = document.createElement('div');
		if (user == localStorage.getItem('currentUser')){
			div.setAttribute("class", "message-item right");
		}
		else{
			div.setAttribute("class", "message-item left");
		}
		messages_div.appendChild(div);

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

		var leftQuote = document.createElement('i');
		leftQuote.setAttribute("class", "fas fa-quote-left");
		divMessage.insertBefore(leftQuote, divMessage.firstChild);

		var rightQuote = document.createElement('i');
		rightQuote.setAttribute("class", "fas fa-quote-right");
		divMessage.appendChild(rightQuote);	
	};
});