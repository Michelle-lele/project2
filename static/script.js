document.addEventListener('DOMContentLoaded', () => {
	var newChannelBtn = document.getElementById('newChannelBtn');
	var form = document.getElementById('channelForm');

  	newChannelBtn.addEventListener('click', () => {
	form.style.display = 'block';
  	});

    form.addEventListener('submit', () => {
    	var newChannel = document.querySelector('#channelName').value;

	    const request = new XMLHttpRequest();

	    request.open('POST', '/add-channel');

	    request.onload = () =>{
	    	console.log(request);
	    	const data = JSON.parse(request.responseText);
	    	console.log(request.status);
	    	//fix the condition, returns undefined
		    	if (request.status == 200) {
		    		var myTable = document.querySelector('#channelsTable');
	    			var tr = myTable.insertRow(0);
	    			var td = tr.insertCell(0);
	    			td.innerHTML = newChannel;
		    	}
		    	else {
		    		console.log(`Woops! ${data.status}`);
		    	}
	    }

	    const data = new FormData();
		data.append('name', newChannel);

	    request.send(data);

	    document.querySelector('#channelName').value = '';
		form.style.display = 'none';
    });

});