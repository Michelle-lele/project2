document.addEventListener('DOMContentLoaded', () => {
	var newChannelBtn = document.getElementById('newChannelBtn');
	var form = document.getElementById('channelForm');

  	newChannelBtn.addEventListener('click', () => {
	form.style.display = 'block';
  });

    form.addEventListener('submit', () => {
	    /*
	    const request = new XMLHttpRequest();
	    request.open('POST', '/add-channel');

	    request.onload () =>{

	    };
	    request.send();
	    */
	    var myTable = document.querySelector('#channelsTable');
	    var tr = myTable.insertRow(0);
	    var td = tr.insertCell(0);
	    td.innerHTML = document.querySelector('#channelName').value;
	    document.querySelector('#channelName').value = '';
	    var form = document.getElementById('channelForm');
		form.style.display = 'none';
    });

});