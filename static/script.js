document.addEventListener('DOMContentLoaded', () =>{
	document.querySelector("#add-channel").onsubmit = () =>{
		document.querySelector("#add-channel").innerHTML = '<input id="channel-name" type="text" required autofocus><button type="submit" class="icon" formaction="/add-channel"><i class="fas fa-save"></i></button>';
		/*to fix the issue with 2 onsubmit bug*/
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
			document.querySelector("#add-channel").innerHTML = '<button type="submit" class="icon" formaction=""><i class="fas fa-plus"></i></button>'
		
			return false;
		};
		return false;
	};

});