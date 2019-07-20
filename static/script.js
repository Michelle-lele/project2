document.addEventListener('DOMContentLoaded', () =>{
	document.querySelector("#new-channel").onclick = () =>{
		var form = document.getElementById('add-channel');
		var new_channel_button = '<button id="new-channel" class="icon"><i class="fas fa-plus"></i></button>';
		var add_channel = '<input id="channel-name" type="text" required autofocus><button type="submit" id="save" class="icon"><i class="fas fa-save"></i></button>';
		form.innerHTML = add_channel;
		
		document.querySelector("#add-channel").onsubmit = () =>{
			/*
			const request = new XMLHttpRequest();
			request.open('POST', '/add-channel');

			request.onload () =>{

			};
			request.send();
			*/

			var myTable = document.querySelector("#channels-table");
			var tr = myTable.insertRow(0);
			var td = tr.insertCell(0);
			td.innerHTML = document.querySelector("#channel-name").value;
			document.querySelector("#channel-name").value = '';
			form.innerHTML = new_channel_button;
		
			return false;
		};
		return false;
	};
	return false;

});