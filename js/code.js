const urlBase = '/LAMPAPI';
const extension = 'php';

const deleteBtns = document.querySelectorAll(".deleteButton");
const table = document.querySelector(".contactTable");
let userId = 0;
let firstName = "";
let lastName = "";

for (let x = 0; x < deleteBtns.length; x++)
{
	deleteBtns[x].addEventListener("click", () => {
		deleteContact(deleteBtns[x]);
	});
}

function CheckRegisterFields()
{
	let firstName = document.getElementById("FirstName").value;
	let lastName = document.getElementById("LastName").value;
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	let reEnterPass = document.getElementById("loginPasswordreenter").value;

	if(firstName == ""){
		return [false, "Please enter First Name"];
	}
	else if(lastName == ""){
		return [false, "Please enter Last Name"];
	}
	else if(login == ""){
		return [false, "Please enter Username"];
	}
	else if(password == ""){
		return [false, "Please enter Password"];
	}
	else if(password != reEnterPass){
		return [false, "Passwords do not match."];
	}
	else
	return [true,""];
}

function CheckContactFields(contactFirstName, contactLastName, contactEmail, contactPhone)
{
	// From regexr.com/2rhq7
	const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
	
	// From regexr.com/38pvb
	const phoneRegex = /^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/g;
	
	if (contactFirstName == "") {
		return [false, "Please enter First Name"];
	} else if (contactLastName == "") {
		return [false, "Please enter Last Name"];
	} else if (contactEmail == "" || !emailRegex.test(contactEmail)) {
		return [false, "Please enter valid Email"];
	} else if (contactPhone == "" || !phoneRegex.test(contactPhone)) {
		return [false, "Please enter valid Phone Number"];
	} else {
		return [true, ""];
	}
	
}

function doRegister()
{
	if(!CheckRegisterFields()[0])
	{
		document.getElementById("loginResult").innerHTML = CheckRegisterFields()[1];
	}
	else{
		userId = 0;
		let firstName = document.getElementById("FirstName").value;
		let lastName = document.getElementById("LastName").value;
		
		let login = document.getElementById("loginName").value;
		let password = document.getElementById("loginPassword").value;
		var hash = md5( password );
		
		document.getElementById("loginResult").innerHTML = "";

		let tmp = {FirstName:firstName,LastName:lastName,Login:login,Password:hash};
		let jsonPayload = JSON.stringify( tmp );
		
		let url = urlBase + '/CreateUser.' + extension;

		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
		try
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200) 
				{
					let jsonObject = JSON.parse( xhr.responseText );
					window.location.href = "index.html";
				}
				else if (this.status == 403)
				{
					document.getElementById("loginResult").innerHTML = "Username is already in use. Please enter another username.";
				}
			};
			xhr.send(jsonPayload);
		}
		catch(err)
		{
			document.getElementById("loginResult").innerHTML = err.message;
		}
	}
}

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {Login:login,Password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.ID;
		
				if( userId < 1 || userId == undefined)
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				firstName = jsonObject.FirstName;
				lastName = jsonObject.LastName;

				saveCookie();
	
				window.location.href = "contact.html";
			}
			else if (this.status == 404)
			{
				document.getElementById("loginResult").innerHTML = "Login does not exist";
				return;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		if(document.URL.includes("/contact.html"))
		{
			document.getElementById("userName").innerHTML = "Welcome " + firstName + "!";
		}
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function cancelAddButton()
{
	window.location.href = "contact.html";
}

// Add contact to datebase 
function confirmAddButton()
{
	let contactFirstName = document.getElementById("contactFirstName").value;
	let contactLastName = document.getElementById("contactLastName").value;
	let contactEmail = document.getElementById("contactEmail").value;
	let contactPhone = document.getElementById("contactPhoneNumber").value;

	let check = CheckContactFields(contactFirstName, contactLastName, contactEmail, contactPhone); 
	if (!check[0]) {
		document.getElementById("contactAddResult").innerHTML = check[1];
	} else {
		let tmp = {FirstName:contactFirstName,LastName:contactLastName,Email:contactEmail,Phone:contactPhone, UserID:userId};
		let jsonPayload = JSON.stringify( tmp );
	
		let url = urlBase + '/AddContact.' + extension;
	
		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "applciation/json; charset=UTF-8");
		try
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200)
				{
					window.location.href = "contact.html";
				}
			};
			xhr.send(jsonPayload);
		}
		catch(err)
		{
			document.getElementById("contactAddResult").innerHTML = err.message;
		}
	}
}

function deleteContact(contactID)
{
	console.log(contactID);
	let flag = window.confirm('Delete this contact?');
	if(!flag){
		return; 
	}
	let tmp = {ID:contactID};
	let jsonPayload = JSON.stringify( tmp );
	let url = urlBase + '/DeleteContact.' + extension;
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				console.log("deleted ID"+contactID);
				window.location.reload();
			}
		};
		xhr.send(jsonPayload);

	}
	catch(err)
	{
		console.log(err);
	}
}

function confirmEditButton()
{
	let EditUrl = window.location.href;
	const EditwordsArray = EditUrl.split("?");
	let EditIDUser = (EditwordsArray[5].split("="))[1];
	
	let contactFirstName = document.getElementById("contactFirstName").value;
	let contactLastName = document.getElementById("contactLastName").value;
	let contactEmail = document.getElementById("contactEmail").value;
	let contactPhone = document.getElementById("contactPhoneNumber").value;

	let check = CheckContactFields(contactFirstName, contactLastName, contactEmail, contactPhone); 
	if (!check[0]) {
		document.getElementById("contactEditResult").innerHTML = check[1];
	} else {
	
		let editJSON = {FirstName:contactFirstName,LastName:contactLastName,Email:contactEmail,Phone:contactPhone,ID:EditIDUser};
		let jsonPayload = JSON.stringify( editJSON );
	
		let url = urlBase + '/UpdateContact.' + extension;
	
		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "applciation/json; charset=UTF-8");
		try
		{
			xhr.onreadystatechange = function() 
			{
				if (this.readyState == 4 && this.status == 200)
				{
					console.log("updated contact");
					window.location.href = "contact.html";
				}
			};
			xhr.send(jsonPayload);
		}
		catch(err)
		{
			console.log("error detected: " + err);
		}
	}

}

function searchContact(page)
{
	let search = document.getElementById("searchText").value;
	if(page <= 1){
	table.innerHTML = "";
	table.innerHTML += "<thead>\n" +
							"\t<tr>\n" +
								"\t\t<th>First Name</th>\n" +
								"\t\t<th>Last Name</th>\n" +
								"\t\t<th>Email</th>\n" +
								"\t\t<th>Phone Number</th>\n" +
								"\t\t<th>Date Created</th>\n" +
								"\t\t<th class='col-actions'>Actions</th>\n" +
							"\t</tr>" +
						"</thead>" + 
						"<tbody></tbody>";
	}
	let tmp = {Search:search, ID:userId, PageNumber:page};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse( xhr.responseText );

				if(jsonObject.error)
				{
					console.log(jsonObject.error);
					return;
				}

				// Add search result to the table
				Object.keys(jsonObject.Contacts).forEach(key => {
					Object.keys(jsonObject.Contacts[key]).forEach(innerKey => {
						let tableRow = document.createElement("tr");
						let contactID = innerKey;
						let firstName = jsonObject.Contacts[key][innerKey].FirstName;
						let lastName = jsonObject.Contacts[key][innerKey].LastName;
						let email = jsonObject.Contacts[key][innerKey].Email;
						let phone = jsonObject.Contacts[key][innerKey].PhoneNumber;
						let dateCreated = jsonObject.Contacts[key][innerKey].DateCreated;
						let tableRef = document.getElementsByClassName("contactTable")[0].getElementsByTagName("tbody")[0];
						let newRow = tableRef.insertRow(-1);
						newRow.id = contactID;
						var newCell = newRow.insertCell();
						newCell.appendChild(document.createTextNode(firstName));
						var newCell = newRow.insertCell();
						newCell.appendChild(document.createTextNode(lastName));
						var newCell = newRow.insertCell();
						newCell.appendChild(document.createTextNode(email));
						var newCell = newRow.insertCell();
						newCell.appendChild(document.createTextNode(phone));
						var newCell = newRow.insertCell();
						newCell.appendChild(document.createTextNode(dateCreated));
						var newCell = newRow.insertCell();
						let deleteRedirect = 'confirmdelete.html?ID=' + contactID;
						let editRedirect = 'editcontact.html?FirstName=' + firstName+"?LastName="+lastName+"?Email="+email+"?PhoneNumber="+phone+"?ID="+contactID;
						newCell.innerHTML += `<td class="col-actions">` + 
											 `<button type="button" id="edit" class="icon editButton" title="Click to edit contact!" onclick="location.href='`+editRedirect+`'"></button>` +
											 `<button type="button" id="delete" class="deletebtn deleteButton icon" title="Click to delete contact!" onclick="deleteContact(`+contactID+`);"></button>` +
											 `</td>`;
					});
				});
			}
		}

		xhr.send( jsonPayload );
	}
	catch (err)
	{
		console.log(err);
	}
}