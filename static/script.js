document.addEventListener('DOMContentLoaded', () => {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

	var newChannelBtn = document.getElementById('newChannelBtn');
	var form = document.getElementById('channelForm');
	var info_message =document.querySelector("#infoMessage");
	var newChannelname = document.getElementById('channelName');

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
			    		var myTable = document.querySelector('#channelsTable');
		    			var tr = myTable.insertRow(0);
		    			var td = tr.insertCell(0);
		    			td.innerHTML = newChannel;
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
		aNewChannel = data;
		var myTable = document.querySelector('#channelsTable');
		var tr = myTable.insertRow(0);
		var td = tr.insertCell(0);
		td.innerHTML = aNewChannel;
	});
});