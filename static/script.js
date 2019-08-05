document.addEventListener('DOMContentLoaded', () => {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

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
		    	//fix the condition, returns undefined
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
		a.setAttribute("onclick", "showChannel();return false;");
		a.innerHTML =aNewChannel;
		var tr = myTable.insertRow(0);
		var td = tr.insertCell(0);
		td.appendChild(a);
	}

	function showChannel{
		//add AJAX request here to get channel data
	}
	
});