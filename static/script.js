document.addEventListener('DOMContentLoaded', () =>{
	var new_channel = document.getElementById('new-channel');
	var new_channel_button = '<button id="new-channel" class="icon"><i class="fas fa-plus"></i></button>';
	
	new_channel.addEventListener('click', () =>{
		var form = document.getElementById('new-channel');
		var add_channel = '<form id="add-channel"><input id="channel-name" type="text" required autofocus><button type="button" id="save" class="icon"><i class="fas fa-save"></i></button></form>';	
		form.outerHTML = add_channel;

		var save_channel = document.querySelector('#save');

		save_channel.addEventListener('click', () =>{
			/*
			const request = new XMLHttpRequest();
			request.open('POST', '/add-channel');

			request.onload () =>{

			};
			request.send();
			*/

			var myTable = document.querySelector('#channels-table');
			var tr = myTable.insertRow(0);
			var td = tr.insertCell(0);
			td.innerHTML = document.querySelector('#channel-name').value;
			form = document.getElementById('add-channel');
			form.outerHTML = new_channel_button;
		});
	});

	
});