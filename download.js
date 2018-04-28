let r = true;
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.command == "show_save_file_dialog" && r) {
		r = false;
		// let d = JSON.stringify(message.data);
		// let body = document.getElementById("body");
		// let savelink = document.createElement("a");
		// savelink.target = "_blank";
		// savelink.download = message.filename;
		// savelink.href = "data:text/csv;charset=utf-8," + encodeURIComponent(d);
		// body.appendChild(savelink);
		// setTimeout(function() {
			// chrome.tabs.update(message.currentTabId, { active: true });
		// }, 20);
		// setTimeout(function() {
			// savelink.click();
			// if (message.browserId != "V") {
				// setTimeout(function() {
					// chrome.tabs.update(message.currentTabId, { active: true });
					// chrome.tabs.remove(message.selfTabId, null);
				// }, 100);
			// }
		// }, 100);


		// let file = new File([JSON.stringify(message.data)], "test", {type: "text/csv;charset=utf-8"} );
		// let body = document.getElementById("body");
		// let savelink = document.createElement("a");
		// savelink.href = URL.createObjectURL(file);
		// console.log(savelink.href);
		// savelink.target = "_blank";
		// savelink.style.display = "none";
		// savelink.type = "file";
		// savelink.download = message.filename;
		// body.appendChild(savelink);		
		// setTimeout(function() {
			// savelink.click();
		// }, 100);


		// document.title = message.filename;

 
 
		// let d = JSON.stringify(message.data);
		// let body = document.getElementById("body");
		// let savelink = document.createElement("a");
		// savelink.target = "_blank";
		// savelink.download = message.filename;
		// savelink.style.display = "none";
		// savelink.type = "file";
		// savelink.href = "data:text/csv;charset=utf-8;"+message.filename+"," + encodeURIComponent(d);
		// body.appendChild(savelink);
		// savelink.click();
		// savelink.remove();


// let file = new File([JSON.stringify(message.data)], "test", {type: "text/csv;charset=utf-8"} );

// chrome.downloads.download({
	// url: URL.createObjectURL(file),
	// conflictAction: 'prompt',
	// filename: message.filename,
	// saveAs: true    
// });







		let file = new File([JSON.stringify(message.data)], "test", {type: "text/csv;charset=utf-8"} );
		let body = document.getElementById("body");
		let savelink = document.createElement("a");
		savelink.href = URL.createObjectURL(file);

		console.log(file.size);
		
		savelink.fileSize = file.size;
		
		
		savelink.target = "_blank";
		savelink.style.display = "none";
		savelink.type = "txt";
		savelink.download = "test";
		body.appendChild(savelink);		
		setTimeout(function() {
			savelink.click();
		}, 100);






	}
});
